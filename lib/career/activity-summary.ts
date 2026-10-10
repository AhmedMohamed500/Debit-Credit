import type { SkillEvidence } from "./model";
export function activitySummary(evidence: SkillEvidence[], prefix: string) {
  const latest = new Map<string, SkillEvidence>();
  for (const item of evidence.filter(row => row.activityId.startsWith(prefix))) {
    const old = latest.get(item.activityId);
    if (!old || (item.projectionVersion ?? 1) > (old.projectionVersion ?? 1) || ((item.projectionVersion ?? 1) === (old.projectionVersion ?? 1) && item.completedAt >= old.completedAt)) latest.set(item.activityId, item);
  }
  const records = [...latest.values()];
  return { completed: records.filter(row => row.accuracy >= 70 && row.criticalErrors === 0).length, accuracy: records.length ? Math.round(records.reduce((sum, row) => sum + row.accuracy, 0) / records.length) : null, firstAttempt: records.filter(row => row.firstAttemptCorrect).length, hints: records.reduce((sum, row) => sum + row.hintsUsed, 0) };
}
