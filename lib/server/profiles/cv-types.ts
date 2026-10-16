import type { CareerProfile, CvDocument } from "@/lib/career/model";
import type { CompactCv } from "@/lib/career/compact-cv";
import type { CvReadiness } from "@/lib/career/ats";

export type ReturnTypeOfAccountCv = {
  profile: CareerProfile;
  cv: CvDocument;
  compact: CompactCv;
  plainText: string;
  readiness: CvReadiness;
};
