import "server-only";
import { json, type Transaction } from "../db/client";
import {
  applyPersonal,
  isPersonalRecord,
  type PersonalRecord,
} from "@/lib/career/personal";
import { showcaseSettings, type ShowcaseSettings } from "@/lib/career/showcase";
import { normalizeSnapshot } from "../migration/snapshots";
import type { CareerProfile } from "@/lib/career/model";

// LinkedIn/website are the same professional contact fields in both editors.
// Never copy email, telephone, images or CV details into the public DTO.
export async function syncPersonalLinks(
  tx: Transaction,
  userId: string,
  settings: ShowcaseSettings,
) {
  const where = { userId_domain: { userId, domain: "student-personal" } };
  const personal = await tx.cloudProgress.findUnique({ where });
  if (!isPersonalRecord(personal?.data)) return;
  const details = personal.data.details;
  if (
    details.linkedIn === settings.socials.linkedin &&
    details.portfolio === settings.socials.website
  )
    return;
  const data = {
    ...personal.data,
    details: {
      ...details,
      linkedIn: settings.socials.linkedin,
      portfolio: settings.socials.website,
    },
    savedAt: new Date().toISOString(),
  };
  await tx.cloudProgress.update({
    where,
    data: { data: json(data), revision: { increment: 1 } },
  });
  const profileWhere = {
    userId_domain: {
      userId,
      domain: "local-backup/debit-credit-career-profile-v1",
    },
  };
  const old = await tx.cloudProgress.findUnique({ where: profileWhere });
  if (old)
    await tx.cloudProgress.update({
      where: profileWhere,
      data: {
        data: json(
          applyPersonal(
            normalizeSnapshot(
              "debit-credit-career-profile-v1",
              old.data,
              userId,
            ) as CareerProfile,
            data,
          ),
        ),
        revision: { increment: 1 },
      },
    });
}
export async function syncShowcaseLinks(
  tx: Transaction,
  userId: string,
  personal: PersonalRecord,
) {
  const where = { userId_domain: { userId, domain: "private-showcase" } };
  const row = await tx.cloudProgress.findUnique({ where });
  const data = row?.data as { settings?: unknown; token?: unknown } | undefined;
  const old = showcaseSettings.safeParse(data?.settings);
  if (!row || !old.success) return;
  const next = showcaseSettings.safeParse({
    ...old.data,
    socials: {
      ...old.data.socials,
      linkedin: personal.details.linkedIn,
      website: personal.details.portfolio,
    },
  });
  // Preserve unusual legacy URLs privately rather than introducing them into
  // the safe public-link policy. Newly edited safe links stay synchronized.
  if (
    !next.success ||
    JSON.stringify(next.data.socials) === JSON.stringify(old.data.socials)
  )
    return;
  await tx.cloudProgress.update({
    where,
    data: {
      data: json({ ...data, settings: next.data }),
      revision: { increment: 1 },
    },
  });
}
