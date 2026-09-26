# Career Entry System

## Scope

This delivery adds the local, four-stage entry campaign on `codex/career-league`: identify a starting persona, select an aspiration and target role, play a persona-specific diagnostic, then follow a personal map. It does not implement the future career roadmap, server sync, paid features, employment verification, or a hiring outcome.

## Player flow

1. `/{locale}/onboarding`: choose Accounting Student, Fresh Graduate, Working Accountant or Experienced Accountant. Each path explains current situation, focus and recommended starting point. Current workplace is optional for working paths.
2. Select a broad aspiration and a target role. Persona-appropriate roles are displayed first; “Explore all roles” reveals all nine targets from Junior Accountant through Finance Manager. The choice saves `CareerLeagueState.targetRoleId`, `CareerProfile.targetRoleId` and CV preferences. It grants no skills.
3. `/{locale}/career-league/placement`: a one-case-at-a-time decision challenge loads the task set for the saved persona. Answers and result are local. A completed diagnostic never creates Skill Evidence.
4. The result distinguishes diagnostic strengths from *evidence-backed* Practiced skills and target-role gaps. It links to the next playable activity and `/{locale}/career-league/map`.
5. The map uses the target role and current Skill Passport evidence to label each node Available, Locked, Practiced, Demonstrated or Planned. Verified is deliberately unavailable. It links to Career Profile, Skill Passport, Career Gap, ATS CV, Bootcamp, Mizan Trading and Career League.

## Storage and migration

- Existing `debit-credit-career-league-v1`, `debit-credit-placement-v1`, `debit-credit-career-profile-v1`, `debit-credit-cv-preferences-v1` and skill evidence keys remain unchanged. No backend/database is introduced.
- Older Career League saves gain a target role inferred from their saved goal. If the older league save lacked `targetRoleId` and a Career Profile already specified a valid role, that existing profile target wins.
- Existing offer IDs, assessment results, profile fields, CV accent/score preference and skill evidence are preserved.
- For future sync, state remains a versioned local repository object; diagnostic answers and result are separate from professional evidence.

## Product integrity

The aspiration and role are targets, not awarded job titles. A high diagnostic score is a starting recommendation, not certification. Only saved gameplay evidence can move a skill to Practiced or Demonstrated. Planned activities have no playable CTA; Verified remains unavailable locally. This experience runs without backend, database or paid service.

## Verification

`npm run check` covers lint, TypeScript, Vitest and production build. Domain tests cover all four diagnostic sets, storage migration, role-specific map/gap, no evidence award, and onboarding AR/EN with RTL/LTR. Browser QA on the local production build covered the experienced Arabic campaign end to end, result and map, plus Arabic and English at 390px with no horizontal overflow. Desktop screenshots are in `artifacts/career-entry/`.

## Known limits

Several later-stage missions remain planned, including full bank reconciliation, adjustments and month-end. The map labels these honestly. The local diagnostic uses short decision cases, not a proctored assessment. Advanced target roles are planning goals and do not imply currently playable management worlds.
