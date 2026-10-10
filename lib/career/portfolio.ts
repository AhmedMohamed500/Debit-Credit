import { z } from "zod";

export const PORTFOLIO_LIMIT = 20;
export const CERTIFICATE_IMAGE_LIMIT = 900_000;
const title = z.string().trim().min(2).max(160);
const date = z.string().regex(/^$|^\d{4}-(0[1-9]|1[0-2])$/);
export const courseInput = z
  .object({
    title,
    provider: title,
    date,
    status: z.enum(["not-started", "in-progress", "completed"]),
    notes: z.string().trim().max(1000),
  })
  .strict();
export const certificateInput = z
  .object({
    title,
    issuer: title,
    date,
    credentialId: z.string().trim().max(120),
  })
  .strict();
const image = z
  .string()
  .max(CERTIFICATE_IMAGE_LIMIT)
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/);
const revision = z.number().int().nonnegative();
export const portfolioCommand = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("save-course"),
      revision,
      id: z.string().uuid().optional(),
      course: courseInput,
    })
    .strict(),
  z
    .object({
      action: z.literal("remove-course"),
      revision,
      id: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      action: z.literal("add-certificate"),
      revision,
      certificate: certificateInput,
      image,
    })
    .strict(),
  z
    .object({
      action: z.literal("remove-certificate"),
      revision,
      id: z.string().uuid(),
    })
    .strict(),
]);
export type PortfolioCommand = z.infer<typeof portfolioCommand>;
export type Course = z.infer<typeof courseInput> & {
  id: string;
  updatedAt: string;
};
export type Certificate = z.infer<typeof certificateInput> & {
  id: string;
  updatedAt: string;
  width: number;
  height: number;
};
export type Portfolio = {
  revision: number;
  courses: Course[];
  certificates: Certificate[];
};
export const emptyPortfolio: Portfolio = {
  revision: 0,
  courses: [],
  certificates: [],
};

// One case may produce several skill records. The activity feed must not count
// each projection as a new activity or invent dates/scores for external courses.
export function recentEvidence<
  T extends { activityId: string; completedAt: string },
>(rows: T[]) {
  const latest = new Map<string, T>();
  for (const row of rows) {
    if (
      !latest.has(row.activityId) ||
      row.completedAt > latest.get(row.activityId)!.completedAt
    )
      latest.set(row.activityId, row);
  }
  return [...latest.values()]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 5);
}
