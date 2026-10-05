import type { LocalizedText } from "@/lib/career/model";
export type BootcampMissionId =
  | "business-world"
  | "transaction-radar"
  | "document-dock"
  | "equation-builder"
  | "account-city"
  | "income-expenses"
  | "contra-account"
  | "movement-lab"
  | "debit-credit"
  | "double-entry"
  | "first-journal"
  | "accounting-cycle"
  | "mizan-boss";
export type FoundationMechanic =
  | "investment"
  | "classify"
  | "documents"
  | "equation"
  | "districts"
  | "income"
  | "contra"
  | "movement"
  | "lanes"
  | "flow"
  | "journal"
  | "cycle"
  | "boss";
export interface FoundationChoice {
  id: string;
  label: LocalizedText;
  icon?: string;
}
export interface FoundationTask {
  id: string;
  kind:
    | "transfer"
    | "choice"
    | "multiple"
    | "equation"
    | "movement"
    | "journal"
    | "station";
  prompt: LocalizedText;
  choices?: FoundationChoice[];
  answer: string[];
  explanation: LocalizedText;
  rows?: { id: string; label: LocalizedText; options: FoundationChoice[] }[];
  entryId?: string;
}
export interface BootcampMission {
  id: BootcampMissionId;
  order: number;
  title: LocalizedText;
  brief: LocalizedText;
  mechanic: FoundationMechanic;
  tasks: FoundationTask[];
  xp: number;
  evidenceRule: "practice-only";
}
export interface FoundationLine {
  account: string;
  debit: number;
  credit: number;
}
export interface FoundationEntry {
  id: string;
  story: LocalizedText;
  document: LocalizedText;
  reference: string;
  amount: number;
  lines: FoundationLine[];
}
export type FoundationResponse = string[] | FoundationLine[];
export interface BootcampState {
  version: 2;
  currentMissionId: BootcampMissionId;
  completedMissionIds: BootcampMissionId[];
  interactionProgress: Partial<Record<BootcampMissionId, string[]>>;
  attempts: Partial<Record<BootcampMissionId, number>>;
  drafts: Record<string, FoundationResponse>;
  bossCompleted: boolean;
  mizanUnlocked: boolean;
  completedAt: string | null;
  legacy: {
    completedMissionIds: string[];
    interactionProgress: Record<string, string[]>;
    mizanUnlocked: boolean;
  };
  storageWarning?: boolean;
}
