import type { ChallengeSeed } from "./model";

const hash = (value: string) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, "0");
};

/** Deterministic seed shared by the real-account challenge service. */
export function dailyChallenge(
  date: string,
  level: number,
  track: string,
): ChallengeSeed {
  const seed = hash(`${date}|${level}|${track}|career-league-v1`);
  return {
    challengeId: `daily-${date}-${level}-${track}`,
    challengeVersion: 1,
    rulesetVersion: 1,
    seed,
    caseId: `career-daily-${Number.parseInt(seed.slice(0, 4), 16) % 7}`,
    difficulty: Math.max(1, Math.min(5, Math.ceil(level / 2))),
    issuedFor: date,
    localOnly: true,
  };
}
