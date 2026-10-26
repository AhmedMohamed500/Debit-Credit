# Learning journey UI and semantics cleanup — 2026-10-26

## Outcome

The signed-in student keeps the same account-owned progress and saved routes,
but the product no longer renders a large global journey bar above specialized
applications. The only full journey sequence is on **My Learning Journey**.

No database schema, API contract, accepted task ID, score, CV record, skill
evidence, or saved result was changed.

## Product classification

| Area | Classification | Result |
| --- | --- | --- |
| `StudentJourneyProvider` | KEEP | Still loads account-bound Excel, Student Unit and First Shift progress. |
| Progress and next-route calculation | IMPROVE | Learning completion is calculated independently from career output availability. |
| `StudentJourneyBar` | REMOVE | No longer rendered globally; its component and dedicated CSS were removed. |
| `JourneySteps` | KEEP ON HOME | Shows only approved learning stages on My Learning Journey. |
| Skill Passport, practical work, profile, CV and achievements | RECLASSIFY | Shown as career outputs, never failed/incomplete lessons. |
| `/student` | PRESERVE FOR COMPATIBILITY | Continues to identify the saved Student Unit route without resetting progress. |

## Current model

### Setup prerequisite

- `personal` — private personal/education details.

### Learning stages

- `excel` — five server-checked Excel Foundations stages.
- `training` — the existing 11 accepted Student Unit task IDs.
- `shift` — five First Shift requirements including ledger review.

The learning percentage uses only those three stages: 0%, 33%, 67% or 100%.
Setup and career documents cannot hold the learner at 66% or 75%.

### Learning outcomes

- `skills` — Skill Passport.
- `practical-work` — accepted practical work.
- `career-profile` — the professional profile.
- `cv` — the factual English CV.
- `achievements` — outcomes already supported by saved evidence.

An output has an availability state, not a pass/fail completion state. Nothing
new is awarded and no placeholder achievement is created.

## UI behavior

My Learning Journey shows the current stage, completed learning stages, latest
successful milestone, true learning percentage, one primary next action, and a
separate outcome area. Competition, Academy, Bootcamp, Career and other
application dashboards retain the provider data but receive no repeated global
journey overlay.

## Verification

- Focused journey/account/game tests: 103 passing.
- Complete automated suite: 86 files and 725 tests passing.
- ESLint: passing.
- TypeScript: passing.
- Next.js 16.4.3 production build: passing.
- `npm audit`: zero known vulnerabilities.
- Real local auth/browser journey: passing in Arabic and English at 1920, 1440
  and 390 px; no uncaught browser errors and no global journey overlay.
- Browser QA uses isolated local PostgreSQL and temporary users; production
  accounts and production data are not changed.

## Remaining approved-scope gaps

The Phase 2 source attachment physically ends at `Known CSS:` in Phase 5.
`BeginnerCareerWorld` is still reachable for a student whose placement result is
level 1, so it is not dead code and was not deleted. Its requested consolidation,
the referenced final competition design, and any later Academy/Bootcamp/Game Hub
instructions cannot be implemented safely from the truncated source. The full
remainder of the approved prompt is required before changing those connected
flows.

Production merge and deployment are also intentionally separate from this local
product-cleanup verification. They require approval after the review branches
and checks are ready.
