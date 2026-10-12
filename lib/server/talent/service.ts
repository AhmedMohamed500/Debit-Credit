import "server-only";
import { randomUUID } from "node:crypto";
import { db, serial, json, type Transaction } from "../db/client";
import { HttpError } from "../security/http";
import { deriveAccountCv } from "../profiles/cv";
import {
  showcaseSettings,
  defaultShowcase,
  acceptedWorks,
} from "@/lib/career/showcase";
import { calculatePassport } from "@/lib/career/evidence";
import { compactCv } from "@/lib/career/compact-cv";
import { roleCatalog, skillCatalog } from "@/lib/career/catalog";
import type { StudentState } from "@/lib/student/unit";
import {
  discoveryDefaults,
  discoveryPreferences,
  companyInput,
  type Candidate,
  type Company,
  type DiscoveryPreferences,
  type TalentQuery,
} from "@/lib/talent/model";

const DISCOVERY = "talent/discovery",
  COMPANY = "talent/company",
  SHORTLIST = "talent/shortlist/";
type Saved = {
  preferences: DiscoveryPreferences;
  candidate: Candidate | null;
  search: string;
  location: string;
  education: string;
};
const own = (userId: string, domain: string) => ({
  userId_domain: { userId, domain },
});
async function companyFor(
  tx: Pick<Transaction, "cloudProgress">,
  userId: string,
): Promise<Company | null> {
  const row = await tx.cloudProgress.findUnique({
    where: own(userId, COMPANY),
  });
  const parsed = companyInput.safeParse(row?.data);
  // Only the dedicated server onboarding command can create this capability.
  return row?.provenance === "SERVER" && parsed.success
    ? { ...parsed.data, id: row.id, permission: "OWNER" }
    : null;
}
async function requireRecruiter(
  tx: Pick<Transaction, "cloudProgress">,
  userId: string,
) {
  const company = await companyFor(tx, userId);
  if (!company) throw new HttpError(403, "RECRUITER_MEMBERSHIP_REQUIRED");
  return company;
}
export async function employerAccount(userId: string) {
  return { company: await companyFor(db(), userId) };
}
export async function saveCompany(
  userId: string,
  input: ReturnType<typeof companyInput.parse>,
) {
  return serial(async (tx) => {
    const row = await tx.cloudProgress.upsert({
      where: own(userId, COMPANY),
      create: {
        userId,
        domain: COMPANY,
        data: json(input),
        provenance: "SERVER",
        revision: 1,
      },
      update: {
        data: json(input),
        provenance: "SERVER",
        revision: { increment: 1 },
      },
    });
    return { company: { ...input, id: row.id, permission: "OWNER" as const } };
  });
}
export async function discoveryFor(userId: string) {
  const row = await db().cloudProgress.findUnique({
    where: own(userId, DISCOVERY),
  });
  const preferences = discoveryPreferences.safeParse(
    (row?.data as Partial<Saved> | undefined)?.preferences,
  );
  return {
    revision: row?.revision ?? 0,
    preferences: preferences.success
      ? preferences.data
      : { ...discoveryDefaults },
  };
}
async function project(
  tx: Transaction,
  userId: string,
  id: string,
  preferences: DiscoveryPreferences,
): Promise<Candidate | null> {
  const source = await deriveAccountCv(tx, userId);
  if (!source) return null;
  const rows = await tx.cloudProgress.findMany({
    where: {
      userId,
      domain: {
        in: [
          "private-showcase",
          "profile-photo",
          "private-portfolio",
          "student-unit1",
        ],
      },
    },
  });
  const value = (domain: string) =>
    rows.find((row) => row.domain === domain)?.data;
  const parsed = showcaseSettings.safeParse(
    (value("private-showcase") as { settings?: unknown } | undefined)?.settings,
  );
  const settings = parsed.success ? parsed.data : defaultShowcase();
  const portfolio = value("private-portfolio") as
    | {
        courses?: Candidate["courses"];
        certificates?: Candidate["certificates"];
      }
    | undefined;
  const profile = source.profile;
  // Explicit allowlist. Never serialize source.profile/source.cv to the recruiter.
  return {
    id,
    name: profile.fullName,
    currentRole: profile.headline,
    workType: profile.preferredWorkType,
    graduationYear: preferences.education ? profile.graduationYear : "",
    role: profile.targetRoleId,
    location: preferences.location
      ? [profile.location, profile.country].filter(Boolean).join(", ")
      : "",
    level: profile.experienceLevel,
    availability: settings.availability.status,
    summary: source.cv.summary.slice(0, 600),
    photo: preferences.photo
      ? ((value("profile-photo") as { image?: string } | undefined)?.image ??
        null)
      : null,
    education: preferences.education
      ? profile.education.map((row) => ({
          id: "education",
          institution: row.institution,
          degree: row.degree,
          field: row.field,
          graduationYear: row.graduationYear,
        }))
      : [],
    languages: preferences.languages ? profile.languages : [],
    skills: calculatePassport(source.cv.evidence)
      .filter((row) => row.status !== "unassessed")
      .map((row) => ({
        skillId: row.skillId,
        status: row.status,
        score: row.score,
        evidenceCount: row.evidenceCount,
      })),
    works: acceptedWorks(
      rows.find((row) => row.domain === "student-unit1")?.provenance ===
        "SERVER"
        ? (value("student-unit1") as StudentState)
        : null,
    ),
    socials: preferences.socials ? { ...settings.socials } : {},
    courses: preferences.courses
      ? (portfolio?.courses ?? [])
          .filter(
            (row) => row.status === "completed" || row.status === "in-progress",
          )
          .map((row) => ({
            title: row.title,
            provider: row.provider,
            status: row.status,
            date: row.date,
          }))
      : [],
    certificates: preferences.certificates
      ? (portfolio?.certificates ?? []).map((row) => ({
          title: row.title,
          issuer: row.issuer,
          date: row.date,
        }))
      : [],
    cv: preferences.cv,
    contactRequests: preferences.contactRequests,
  };
}
export async function refreshDiscovery(tx: Transaction, userId: string) {
  const row = await tx.cloudProgress.findUnique({
    where: own(userId, DISCOVERY),
  });
  const parsed = discoveryPreferences.safeParse(
    (row?.data as Partial<Saved> | undefined)?.preferences,
  );
  if (
    !row ||
    row.provenance !== "SERVER" ||
    !parsed.success ||
    !parsed.data.enabled
  )
    return;
  const candidate = await project(tx, userId, row.id, parsed.data);
  await tx.cloudProgress.update({
    where: { id: row.id },
    data: { data: json(savedProjection(parsed.data, candidate)) },
  });
}
function savedProjection(
  preferences: DiscoveryPreferences,
  candidate: Candidate | null,
): Saved {
  return {
    preferences,
    candidate,
    search: candidate
      ? [
          candidate.name,
          candidate.currentRole ?? "",
          candidate.location,
          candidate.role,
          roleCatalog[candidate.role].label.en,
          roleCatalog[candidate.role].label.ar,
          ...candidate.skills.flatMap((row) => [
            row.skillId,
            skillCatalog[row.skillId].label.en,
            skillCatalog[row.skillId].label.ar,
          ]),
          ...candidate.education.map(
            (row) => `${row.institution} ${row.degree} ${row.field}`,
          ),
        ]
          .join(" ")
          .toLowerCase()
      : "",
    location: candidate?.location.toLowerCase() ?? "",
    education:
      candidate?.education
        .map((row) => `${row.institution} ${row.degree} ${row.field}`)
        .join(" ")
        .toLowerCase() ?? "",
  };
}
export async function saveDiscovery(
  userId: string,
  command: { revision: number; preferences: DiscoveryPreferences },
) {
  return serial(async (tx) => {
    const row = await tx.cloudProgress.findUnique({
      where: own(userId, DISCOVERY),
    });
    if ((row?.revision ?? 0) !== command.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    // Rotate the discovery identifier after revocation; stale shortlists never reactivate.
    const wasEnabled =
      (row?.data as Partial<Saved> | undefined)?.preferences?.enabled === true;
    const id =
      row && (wasEnabled || !command.preferences.enabled)
        ? row.id
        : randomUUID();
    const candidate = command.preferences.enabled
      ? await project(tx, userId, id, command.preferences)
      : null;
    if (command.preferences.enabled && !candidate)
      throw new HttpError(409, "COMPLETE_CAREER_PROFILE_FIRST");
    const next = await tx.cloudProgress.upsert({
      where: own(userId, DISCOVERY),
      create: {
        id,
        userId,
        domain: DISCOVERY,
        data: json(savedProjection(command.preferences, candidate)),
        provenance: "SERVER",
        revision: 1,
      },
      update: {
        id,
        data: json(savedProjection(command.preferences, candidate)),
        provenance: "SERVER",
        revision: { increment: 1 },
      },
    });
    return { revision: next.revision, preferences: command.preferences };
  });
}
async function candidateFor(tx: Transaction, id: string) {
  const row = await tx.cloudProgress.findUnique({ where: { id } });
  const parsed = discoveryPreferences.safeParse(
    (row?.data as Partial<Saved> | undefined)?.preferences,
  );
  if (
    !row ||
    row.domain !== DISCOVERY ||
    row.provenance !== "SERVER" ||
    !parsed.success ||
    !parsed.data.enabled
  )
    throw new HttpError(404, "CANDIDATE_UNAVAILABLE");
  const candidate = await project(tx, row.userId, id, parsed.data);
  if (!candidate) throw new HttpError(404, "CANDIDATE_UNAVAILABLE");
  return { row, candidate, preferences: parsed.data };
}
export async function searchCandidates(userId: string, query: TalentQuery) {
  return db().$transaction(
    async (tx) => {
      await requireRecruiter(tx, userId);
      // Parameterized PostgreSQL query; only opted-in safe projections are searched.
      // No registered-user directory is sent to the browser.
      const { q, role, skill, location, education, availability, level, page } =
        query;
      const filter = (value: string) => value.toLowerCase();
      const rows = await tx.$queryRaw<{ items: Candidate[]; total: bigint }[]>`
      WITH filtered AS (SELECT id, "updatedAt", data->'candidate' AS candidate FROM cloud_progress
      WHERE domain = ${DISCOVERY} AND provenance = 'SERVER'
      AND data->'preferences'->>'enabled' = 'true' AND data->'candidate'->>'name' IS NOT NULL
      AND (${q === ""} OR strpos(data->>'search', ${filter(q)}) > 0)
      AND (${!role} OR data->'candidate'->>'role' = ${role ?? ""})
      AND (${!skill} OR EXISTS (SELECT 1 FROM jsonb_array_elements(data->'candidate'->'skills') s WHERE s->>'skillId' = ${skill ?? ""}))
      AND (${location === ""} OR strpos(data->>'location', ${filter(location)}) > 0)
      AND (${education === ""} OR strpos(data->>'education', ${filter(education)}) > 0)
      AND (${!availability} OR data->'candidate'->>'availability' = ${availability ?? ""})
      AND (${!level} OR data->'candidate'->>'level' = ${level ?? ""})
      ) SELECT COALESCE(jsonb_agg(page_rows.candidate), '[]'::jsonb) AS items,
      (SELECT count(*) FROM filtered) AS total
      FROM (SELECT candidate FROM filtered ORDER BY "updatedAt" DESC, id LIMIT 20 OFFSET ${(page - 1) * 20}) page_rows`;
      return {
        items: rows[0]?.items ?? [],
        total: Number(rows[0]?.total ?? 0),
        page,
        pageSize: 20,
      };
    },
    { isolationLevel: "RepeatableRead", timeout: 30000 },
  );
}
export async function previewCandidate(userId: string, id: string) {
  return db().$transaction(
    async (tx) => {
      await requireRecruiter(tx, userId);
      return (await candidateFor(tx, id)).candidate;
    },
    { isolationLevel: "RepeatableRead" },
  );
}
export async function candidateCv(userId: string, id: string) {
  return db().$transaction(
    async (tx) => {
      await requireRecruiter(tx, userId);
      const { row, preferences } = await candidateFor(tx, id);
      if (!preferences.cv) throw new HttpError(404, "CV_NOT_SHARED");
      const source = await deriveAccountCv(tx, row.userId);
      if (!source) throw new HttpError(404, "CV_NOT_SHARED");
      // Never disclose account email/phone, even when a CV preview is opted in.
      const profile = {
        ...source.profile,
        email: "",
        phone: "",
        location: preferences.location ? source.profile.location : "",
        country: preferences.location ? source.profile.country : "",
        linkedIn: preferences.socials ? source.profile.linkedIn : "",
        portfolio: preferences.socials ? source.profile.portfolio : "",
        education: preferences.education ? source.profile.education : [],
        languages: preferences.languages ? source.profile.languages : [],
      };
      const portfolio = await tx.cloudProgress.findUnique({
        where: own(row.userId, "private-portfolio"),
      });
      const data = portfolio?.data as
        { courses?: []; certificates?: [] } | undefined;
      const compact = compactCv(profile, source.cv, {
        revision: 0,
        courses: preferences.courses ? (data?.courses ?? []) : [],
        certificates: preferences.certificates
          ? (data?.certificates ?? [])
          : [],
      });
      return {
        blocks: compact.blocks,
        notice:
          "Candidate-consented English preview; private contact fields removed. Training simulation is not employment.",
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}
export async function shortlistFor(userId: string) {
  return db().$transaction(
    async (tx) => {
      await requireRecruiter(tx, userId);
      const rows = await tx.cloudProgress.findMany({
        where: {
          userId,
          domain: { startsWith: SHORTLIST },
          provenance: "SERVER",
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      const candidates = await tx.cloudProgress.findMany({
        where: {
          id: { in: rows.map((row) => row.domain.slice(SHORTLIST.length)) },
          domain: DISCOVERY,
          provenance: "SERVER",
        },
      });
      const byId = new Map(
        candidates.map((row) => [row.id, row.data as Saved]),
      );
      const items: Candidate[] = [];
      for (const row of rows) {
        const value = byId.get(row.domain.slice(SHORTLIST.length));
        if (value?.preferences.enabled && value.candidate)
          items.push(value.candidate);
      }
      return { items, total: items.length, limit: 100 };
    },
    { isolationLevel: "RepeatableRead", timeout: 30000 },
  );
}
export async function mutateShortlist(
  userId: string,
  command: { candidate: string; action: "add" | "remove" },
) {
  return serial(async (tx) => {
    const company = await requireRecruiter(tx, userId);
    const domain = SHORTLIST + command.candidate;
    if (command.action === "remove") {
      await tx.cloudProgress.deleteMany({ where: { userId, domain } });
      return { saved: false };
    }
    await candidateFor(tx, command.candidate);
    const current = await tx.cloudProgress.findUnique({
      where: own(userId, domain),
    });
    if (
      !current &&
      (await tx.cloudProgress.count({
        where: { userId, domain: { startsWith: SHORTLIST } },
      })) >= 100
    )
      throw new HttpError(409, "SHORTLIST_LIMIT");
    await tx.cloudProgress.upsert({
      where: own(userId, domain),
      create: {
        userId,
        domain,
        data: json({ company: company.id }),
        provenance: "SERVER",
        revision: 1,
      },
      update: {},
    });
    return { saved: true };
  });
}
export async function requestContact(
  userId: string,
  command: { candidate: string; message: string },
) {
  return serial(async (tx) => {
    const company = await requireRecruiter(tx, userId);
    const { row, preferences } = await candidateFor(tx, command.candidate);
    if (!preferences.contactRequests)
      throw new HttpError(403, "CONTACT_NOT_ALLOWED");
    if (row.userId === userId) throw new HttpError(400, "SELF_CONTACT");
    await tx.cloudProgress.upsert({
      where: own(row.userId, "talent/contact/" + company.id),
      create: {
        userId: row.userId,
        domain: "talent/contact/" + company.id,
        data: json({
          company: company.name,
          recruiter: company.recruiter,
          website: company.website,
          message: command.message,
          sentAt: new Date().toISOString(),
        }),
        provenance: "SERVER",
        revision: 1,
      },
      update: {
        data: json({
          company: company.name,
          recruiter: company.recruiter,
          website: company.website,
          message: command.message,
          sentAt: new Date().toISOString(),
        }),
        revision: { increment: 1 },
      },
    });
    return { sent: true };
  });
}
export async function contactInbox(userId: string) {
  const rows = await db().cloudProgress.findMany({
    where: {
      userId,
      domain: { startsWith: "talent/contact/" },
      provenance: "SERVER",
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return { items: rows.map((row) => row.data) };
}
