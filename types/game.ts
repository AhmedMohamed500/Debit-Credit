export type GameSkillId =
  | "fundamentals" | "account-classification" | "debit-credit" | "transaction-analysis"
  | "journal-entries" | "ledger-posting" | "trial-balance" | "adjustments"
  | "financial-statements" | "error-detection" | "business-cases" | "accuracy" | "speed";

export type GameActivityKind = "lesson" | "practice" | "money-flow" | "mission" | "detective" | "arena" | "daily" | "assessment";
export type MasteryBand = "beginner" | "intermediate" | "advanced" | "mastered";

export interface GameActivityEvidence {
  key: string;
  kind: GameActivityKind;
  bestScore: number;
  completions: number;
  attempts: number;
  xpAwarded: number;
  coinsAwarded: number;
  skills: GameSkillId[];
  completedAt: string;
}

export interface PlayerState {
  schemaVersion: 1;
  displayName: string;
  xp: number;
  coins: number;
  streak: number;
  lastActiveDate?: string;
  activities: Record<string, GameActivityEvidence>;
  badges: string[];
  certificates: string[];
}

export interface PlayerSnapshot extends PlayerState {
  level: number;
  levelXp: number;
  nextLevelXp: number;
  levelProgress: number;
  careerReadiness: number;
  skillScores: Record<GameSkillId, number>;
  currentObjective: { titleAr: string; titleEn: string; route: string; rewardXp: number; rewardCoins: number };
}

export interface LearningStep {
  id: string;
  kind: GameActivityKind | "classic";
  titleAr: string;
  titleEn: string;
  route: string;
  skillIds: GameSkillId[];
}

export interface LearningLevel {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  rewardAr: string;
  rewardEn: string;
  steps: LearningStep[];
}

