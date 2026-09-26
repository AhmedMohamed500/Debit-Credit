# Career League Scoring

The compact approved challenge rubric produces a normalized 0–100 score: accounting accuracy 30%, professional judgment 22%, evidence investigation 18%, risk awareness 12%, documentation 8%, first-attempt quality 5%, consistency 5%. Speed has no direct points. Posting before reviewing source documents scores poorly even when fast. Wrong accounts or amount score zero in the accuracy dimension. A foundation preview cannot earn official points.

Ranking uses one official result per profile/challenge/version/scoring version. Additional attempts remain practice. Weekly standings group only profiles in the same career league and current UTC week; total points are summed from unique official results. Ties use accuracy, then stable profile ID for row ordering, while an equal duel score is a true draw. League score is game data, not Skill Passport status or employment readiness.

The older `lib/local-competition/engine.ts` scoring/JSON contracts remain for backward compatibility; V2's display and new official results are in `v2.ts`. A future versioned migration should consolidate those rubrics before server-backed competition.
