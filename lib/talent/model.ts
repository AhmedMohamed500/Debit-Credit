import { z } from "zod";
import { roleIds, skillIds } from "@/lib/career/catalog";
import {
  safeSocial,
  type ShowcaseSettings,
  type Work,
} from "@/lib/career/showcase";
import type { CareerProfile, SkillResult } from "@/lib/career/model";

export const discoveryDefaults = {
  enabled: false,
  photo: false,
  location: false,
  education: false,
  languages: false,
  socials: false,
  courses: false,
  certificates: false,
  cv: false,
  contactRequests: false,
};
export const discoveryPreferences = z
  .object({
    enabled: z.boolean(),
    photo: z.boolean(),
    location: z.boolean(),
    education: z.boolean(),
    languages: z.boolean(),
    socials: z.boolean(),
    courses: z.boolean(),
    certificates: z.boolean(),
    cv: z.boolean(),
    contactRequests: z.boolean(),
  })
  .strict();
export type DiscoveryPreferences = z.infer<typeof discoveryPreferences>;
export const discoveryCommand = z
  .object({
    revision: z.number().int().nonnegative(),
    preferences: discoveryPreferences,
  })
  .strict();
const field = z.string().trim().min(2).max(160);
export const companyInput = z
  .object({
    name: field,
    recruiter: field,
    industry: field,
    location: field,
    website: z
      .string()
      .trim()
      .max(300)
      .refine((value) => safeSocial("website", value)),
  })
  .strict();
export type Company = z.infer<typeof companyInput> & {
  id: string;
  permission: "OWNER";
};
export const shortlistCommand = z
  .object({ candidate: z.string().uuid(), action: z.enum(["add", "remove"]) })
  .strict();
export const contactCommand = z
  .object({
    candidate: z.string().uuid(),
    message: z.string().trim().min(10).max(1000),
  })
  .strict();
export const talentQuery = z
  .object({
    q: z.string().trim().max(100).default(""),
    role: z.enum(roleIds).optional(),
    skill: z.enum(skillIds).optional(),
    location: z.string().trim().max(100).default(""),
    education: z.string().trim().max(100).default(""),
    availability: z.enum(["not-looking", "internship", "work"]).optional(),
    level: z
      .enum(["student", "fresh-graduate", "junior", "mid", "senior"])
      .optional(),
    page: z.coerce.number().int().min(1).max(1000).default(1),
  })
  .strict();
export type TalentQuery = z.infer<typeof talentQuery>;
export type Candidate = {
  id: string;
  name: string;
  role: CareerProfile["targetRoleId"];
  location: string;
  level: CareerProfile["experienceLevel"];
  availability: ShowcaseSettings["availability"]["status"];
  summary: string;
  photo: string | null;
  education: CareerProfile["education"];
  languages: string[];
  skills: Pick<SkillResult, "skillId" | "status" | "score" | "evidenceCount">[];
  works: Work[];
  socials: Partial<ShowcaseSettings["socials"]>;
  courses: {
    title: string;
    provider: string;
    status: "in-progress" | "completed";
    date: string;
  }[];
  certificates: { title: string; issuer: string; date: string }[];
  cv: boolean;
  contactRequests: boolean;
};
export type DiscoveryRecord = {
  revision: number;
  preferences: DiscoveryPreferences;
};
export type SearchResults = {
  items: Candidate[];
  total: number;
  page: number;
  pageSize: number;
};
export function requirementOverlap(candidate: Candidate, requested: string[]) {
  const unique = [...new Set(requested)];
  return {
    matched: unique.filter((id) =>
      candidate.skills.some((skill) => skill.skillId === id),
    ).length,
    requested: unique.length,
  };
}
