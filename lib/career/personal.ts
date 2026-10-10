import { z } from "zod";
import type { CareerProfile } from "./model";

const text = (max: number) => z.string().trim().min(2).max(max);
const optionalLink = z.union([
  z.literal(""),
  z
    .url()
    .max(300)
    .refine((value) => /^https?:\/\//.test(value)),
]);
export const personalSchema = z
  .object({
    fullName: text(120),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d ()-]{7,25}$/)
      .refine((value) => value.replace(/\D/g, "").length >= 7),
    country: text(80),
    location: text(100),
    institution: text(160),
    degree: text(120),
    field: text(120),
    graduationYear: z.string().regex(/^(19|20|21)\d{2}$/),
    experienceLevel: z.enum([
      "student",
      "fresh-graduate",
      "junior",
      "mid",
      "senior",
    ]),
    linkedIn: optionalLink,
    portfolio: optionalLink,
    languages: z.array(text(60)).max(8),
    actualExperience: z
      .array(
        z
          .object({
            id: text(80),
            company: text(160),
            title: text(120),
            startDate: text(30),
            endDate: z.string().trim().max(30),
            current: z.boolean(),
            description: text(1500),
          })
          .strict()
          .refine((row) => row.current || row.endDate.length >= 2),
      )
      .max(5)
      .optional(),
  })
  .strict();
export type PersonalDetails = z.infer<typeof personalSchema>;
export const personalCommand = z
  .object({ revision: z.number().int().nonnegative(), details: personalSchema })
  .strict();
export type PersonalRecord = {
  details: PersonalDetails;
  email: string;
  savedAt: string;
};
export function isPersonalRecord(value: unknown): value is PersonalRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as PersonalRecord;
  return (
    personalSchema.safeParse(row.details).success &&
    z.email().safeParse(row.email).success
  );
}
export function applyPersonal(
  profile: CareerProfile,
  record: PersonalRecord,
): CareerProfile {
  const {
    institution,
    degree,
    field,
    graduationYear,
    actualExperience,
    ...details
  } = record.details;
  return {
    ...profile,
    ...details,
    email: record.email,
    graduationYear,
    education: [
      { id: "student-primary", institution, degree, field, graduationYear },
      ...profile.education.filter(
        (row) =>
          row.id !== "student-primary" &&
          !(row.institution === institution && row.degree === degree && row.field === field && row.graduationYear === graduationYear),
      ),
    ],
    experience: actualExperience ? [...actualExperience, ...profile.experience.filter(row => !row.id.startsWith("personal-") && !actualExperience.some(next => next.id === row.id))] : profile.experience,
    completed: true,
    onboardingStep: 5,
    updatedAt: record.savedAt,
  };
}
