import { z } from "zod";
import { roleCatalog } from "@/lib/career/catalog";
export const personas = [
  "student",
  "graduate",
  "working-accountant",
  "experienced-accountant",
] as const;
export const roleSchema = z
  .string()
  .refine((x) => Object.hasOwn(roleCatalog, x));
export const profileSchema = z
  .object({
    displayName: z.string().trim().min(2).max(60),
    handle: z.string().regex(/^[a-z0-9][a-z0-9-]{2,29}$/),
    avatar: z.enum(["blue", "green", "gold", "purple"]),
    locale: z.enum(["ar", "en"]),
    persona: z.enum(personas).nullable(),
    targetRoleId: roleSchema,
    revision: z.string().datetime(),
  })
  .strict();
export const careerEntrySchema = z
  .object({
    persona: z.enum(personas),
    goal: z.enum([
      "understand-basics",
      "first-job",
      "improve-current",
      "bigger-company",
      "general-accountant",
      "ap",
      "ar",
      "treasury",
      "gl",
      "cost",
      "corporate-accounting",
    ]),
    targetRoleId: roleSchema,
    workEnvironment: z
      .enum([
        "small-business",
        "accounting-office",
        "retail",
        "restaurant",
        "trading-company",
        "other",
      ])
      .nullable(),
    revision: z.number().int().nonnegative(),
  })
  .strict();
