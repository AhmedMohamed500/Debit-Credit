import "server-only";
import { randomUUID } from "node:crypto";
import { db, json, serial, type Transaction } from "../db/client";
import { HttpError } from "../security/http";
import { isPersonalRecord } from "@/lib/career/personal";
import {
  acceptedWorks,
  defaultShowcase,
  publicShowcase,
  showcaseSettings,
  type Showcase,
  type ShowcaseCommand,
} from "@/lib/career/showcase";
import type { StudentState } from "@/lib/student/unit";

export const SHOWCASE_DOMAIN = "private-showcase";
export const PUBLIC_PROFILE_PREFIX = "public-profile/";
const validToken = (token: unknown): token is string =>
  typeof token === "string" && /^[0-9a-f]{32}$/.test(token);
async function load(
  client: Pick<Transaction, "cloudProgress">,
  userId: string,
): Promise<Showcase> {
  const [row, personal, unit] = await Promise.all(
    [SHOWCASE_DOMAIN, "student-personal", "student-unit1"].map((domain) =>
      client.cloudProgress.findUnique({
        where: { userId_domain: { userId, domain } },
      }),
    ),
  );
  const saved = row?.data as
    { settings?: unknown; token?: unknown } | undefined;
  const parsed = showcaseSettings.safeParse(saved?.settings);
  const settings = parsed.success ? parsed.data : defaultShowcase();
  // Seed existing profile links privately; no implicit publication.
  if (!row && isPersonalRecord(personal?.data)) {
    for (const [key, value] of [
      ["linkedin", personal.data.details.linkedIn],
      ["website", personal.data.details.portfolio],
    ] as const) {
      const seeded = showcaseSettings.safeParse({
        ...settings,
        socials: { ...settings.socials, [key]: value },
      });
      if (seeded.success) settings.socials[key] = seeded.data.socials[key];
    }
  }
  return {
    revision: row?.revision ?? 0,
    settings,
    token: validToken(saved?.token) ? saved.token : null,
    name: isPersonalRecord(personal?.data)
      ? personal.data.details.fullName
      : "Accounting learner",
    works: acceptedWorks(
      unit?.provenance === "SERVER" ? (unit.data as StudentState) : null,
    ),
  };
}
export async function showcaseFor(userId: string) {
  return load(db(), userId);
}
export async function saveShowcase(userId: string, command: ShowcaseCommand) {
  return serial(async (tx) => {
    const current = await load(tx, userId);
    if (current.revision !== command.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    if (
      command.settings.pinned.some(
        (id) => !current.works.some((work) => work.id === id),
      )
    )
      throw new HttpError(409, "WORK_NOT_ACCEPTED");
    const choices = command.settings.public;
    if (
      command.action === "publish" &&
      !choices.name &&
      !choices.socials &&
      !choices.availability &&
      !choices.summary &&
      !choices.works.length
    )
      throw new HttpError(400, "SELECT_PUBLIC_FIELDS");
    let token = current.token;
    if (command.action === "revoke" && token) {
      await tx.cloudProgress.deleteMany({
        where: { userId, domain: PUBLIC_PROFILE_PREFIX + token },
      });
      token = null;
    }
    if (command.action === "publish" && !token) {
      token = randomUUID().replaceAll("-", "");
      await tx.cloudProgress.create({
        data: {
          id: token,
          userId,
          domain: PUBLIC_PROFILE_PREFIX + token,
          data: json({ version: 1 }),
          revision: 1,
          provenance: "SERVER",
        },
      });
    }
    const row = await tx.cloudProgress.upsert({
      where: { userId_domain: { userId, domain: SHOWCASE_DOMAIN } },
      create: {
        userId,
        domain: SHOWCASE_DOMAIN,
        revision: 1,
        provenance: "SERVER",
        data: json({ settings: command.settings, token }),
      },
      update: {
        revision: { increment: 1 },
        provenance: "SERVER",
        data: json({ settings: command.settings, token }),
      },
    });
    return {
      ...current,
      revision: row.revision,
      settings: command.settings,
      token,
    };
  });
}
export async function sharedShowcase(token: string) {
  if (!validToken(token)) return null;
  const row = await db().cloudProgress.findUnique({
    where: { id: token },
  });
  if (
    !row ||
    row.domain !== PUBLIC_PROFILE_PREFIX + token ||
    row.provenance !== "SERVER"
  )
    return null;
  const data = await showcaseFor(row.userId);
  return data.token === token ? publicShowcase(data) : null;
}
