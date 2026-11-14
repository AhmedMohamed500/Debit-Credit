# Unified Accounting Journey V1.1 — Implementation Report

## Delivery metadata

- Starting SHA: `0b4ceab84104a3faf42c6d6892c9aa79b083c73e`
- Implementation branch: `codex/unified-accounting-journey-v1`
- Draft pull request: https://github.com/AhmedMohamed500/Debit-Credit/pull/52
- PR base: `codex/phase3-remove-redundant-ux`
- Stack: PR #49 → PR #50 → PR #51 → PR #52
- Final implementation SHA: recorded by the latest commit on PR #52 after this report is committed.
- Production: not merged, promoted, or written to.

## Executive result

V1.1 removes the false 100% completion state and makes the eight-level student journey traceable to real work. Completion is now checked by exact mission ID, not by array position or a numeric count. The journey separates server-graded learning, local First Shift practice, and professional evidence. Level 6 remains visible but honestly reports **In development** and can never grant completion, a badge, XP, or a certificate.

When every currently available activity is complete, the UI reports:

- Full program: **7/8 levels, 88%**.
- Available training: **7/7 levels, 100%**.
- Server-accepted learning: **24/24 missions** (13 Foundations + 11 Student Unit).
- Local First Shift practice: **5/5 checkpoints**, explicitly not server-certified.
- Full-program completion: **false** until Level 6 has real teaching and server grading.

## Defects fixed

| Defect | Before | V1.1 behavior |
|---|---|---|
| False program completion | Seven implemented levels could render as 100% for an eight-level program | Full-program progress is capped at 7/8 and 88% while Level 6 is unavailable |
| Positional completion | Accepted work could be inferred from `accepted.length` or UI position | Every level and task checks its exact accepted mission ID |
| Non-contiguous saved state | A later accepted ID could incorrectly imply earlier work | Only the saved IDs themselves render complete; the first missing canonical ID remains next |
| Foundations mismatch | Level 1 pointed at a Student Unit task instead of the Foundations curriculum | Level 1 uses all 13 existing server-graded Foundations missions, including final mastery |
| Generic level navigation | Levels opened a module without identifying the required work | Foundations uses `?mission=<id>` and Student Unit uses `?focus=<id>` |
| First Shift count-only state | A numeric total hid which checkpoints were actually complete | Five exact First Shift IDs are derived from document, journal, and ledger state |
| Authority ambiguity | Local simulation could look like an official credential | UI and model label server assessment, local practice, and professional evidence separately |
| Profile redirect loop | An incomplete student already on `/student-profile` redirected to itself | The session boundary allows the profile page to render and only redirects from other private pages |

## Level mapping and deep links

| Level | Title | Completion authority and exact inputs | Deep link |
|---|---|---|---|
| 1 | Accounting Foundations | Server-graded; all 13 IDs from `bootcampMissionIds`, ending with `mizan-boss` | `/{locale}/bootcamp?mission=<first-missing-foundation-id>` |
| 2 | Source Documents | Server-graded; `document-control`, `journal-capital`, `journal-equipment`, `journal-inventory` | `/{locale}/game/student?focus=<first-missing-id>` |
| 3 | Journal Entries | Server-graded; `journal-service`, `journal-receipt`, `journal-rent` | `/{locale}/game/student?focus=<first-missing-id>` |
| 4 | General Ledger | Server-graded; `ledger-cash` | `/{locale}/game/student?focus=ledger-cash` |
| 5 | Trial Balance | Server-graded; `trial-balance` | `/{locale}/game/student?focus=trial-balance` |
| 6 | Financial Statements | No complete assessment; development only | `/{locale}/journey` |
| 7 | Review & Analysis | Server-graded; `classification-error`, `worksheet` | `/{locale}/game/student?focus=<first-missing-id>` |
| 8 | Final Company Simulation | Local practice; three document IDs, `first-shift/journal`, `first-shift/ledger` | `/{locale}/game/first-shift` |

Locked and development levels remain inspectable so students can read why they are unavailable and what to do next. A completed level can still be opened for review.

## Accounting Foundations learning design

The implementation reuses the existing 13-mission Accounting Foundations engine rather than creating a duplicate course. It provides a short explanation, guided examples and interactive practice, corrective feedback after a wrong answer, retry, and a final `mizan-boss` mastery mission. Signed-in completion is submitted through the existing cloud API and is graded and stored server-side. Guest use remains clearly local practice.

Existing Foundations records are preserved. The provider reads the actual `GET /api/v1/me/progress` response shape (`foundations.data.completedMissionIds`) alongside Student Unit state and refreshes the unified map after accepted work.

## Progress authority and evidence boundaries

- **Server assessment:** the 13 Foundations missions and 11 Student Unit tasks. These are the only missions included in the 24-item authoritative learning counter.
- **Local simulation:** the five First Shift checkpoints derived from local campaign state. They receive a separate counter and do not create server-certified badges or professional claims.
- **Professional evidence:** Skill Passport, practical work, career profile, English CV, and achievements continue to use their existing evidence/projector rules. Map visits and learning badges do not manufacture career evidence.
- **Rewards:** the journey displays existing saved XP and coins. V1.1 does not invent new server rewards for navigation or for unavailable content.
- **Excel Foundations:** retained without reset and intentionally outside the core eight-level unlock chain for this release.

## Compatibility and data preservation

- No Prisma schema or migration changes.
- No database reset and no production data writes.
- Existing Student Unit, Foundations, Excel, First Shift, profile, career evidence, CV, competition, and subscription data remain intact.
- Previously saved non-contiguous accepted IDs are normalized against the canonical task list without deleting valid IDs.
- Arabic RTL and English LTR use the same progression rules.
- Account switching clears the displayed owner state until the new account's server progress is loaded, preventing cross-account leakage.

## Automated validation

- ESLint: passed with zero warnings.
- TypeScript: passed.
- Full Vitest suite: **729/729 passed** across **86/86 files** using one worker. A prior two-worker run had one worker-start timeout; the affected file passed independently and the clean one-worker full run is the reported result.
- Focused regression files for V1.1: passed, including journey mapping/UI, Foundations, backend rules, First Shift, Student Unit UI, and CV behavior.
- Production build: passed on Next.js 16.4.3; `/{locale}/journey`, `/{locale}/bootcamp`, `/{locale}/game/student`, and `/{locale}/game/first-shift` are present.
- `git diff --check`: required before commit and recorded in the PR handoff.

## Real-browser QA

The reusable script `scripts/unified-journey-v11-browser-qa.mjs` ran against a local Next server and an isolated PostgreSQL database named `journey_v11_test`. It made no production writes. The result file records **38 checks**, no uncaught browser errors, and `productionWrites: false`.

Verified behavior:

- New student starts at the exact first Foundations mission.
- Refresh resumes saved work.
- A wrong answer shows corrective feedback and does not complete the mission.
- A corrected retry is accepted through server grading.
- Partial saved work deep-links to the exact missing Student Unit task.
- Fully completed available work remains 7/8 and 88%, with Level 6 visibly in development.
- Light and dark themes render.
- Arabic RTL and English LTR render without horizontal overflow at 1920, 1440, 768, 390, and 320 px.
- Switching between isolated accounts does not leak progress; returning to the first account restores its server state.
- Reduced-motion and keyboard-focus checks pass.

Screenshots are stored under `artifacts/unified-journey-v11/` and include new, partial, full AR/EN, responsive, light, and dark states. The machine-readable result is `artifacts/unified-journey-v11/browser-qa.json`.

## Files in the V1.1 change

- `app/student-journey.css`
- `app/student.css`
- `components/cloud/session-boundary.tsx`
- `components/platform/accounting-bootcamp.tsx`
- `components/student/student-journey.tsx`
- `components/student/student-unit.tsx`
- `lib/campaign/first-shift-hub.ts`
- `lib/student/journey.ts`
- `lib/student/unit.ts`
- `scripts/unified-journey-v11-browser-qa.mjs`
- `tests/bootcamp-ui.test.tsx`
- `tests/first-shift-hub.test.ts`
- `tests/student-journey-ui.test.tsx`
- `tests/student-journey.test.ts`
- `docs/UNIFIED_JOURNEY_IMPLEMENTATION.md`

## Remaining limitations and beta readiness

- Level 6 Financial Statements still needs a real curriculum, server grader, persistence, and regression coverage before the eight-level program can be completed or certified.
- First Shift remains browser-local practice. Promoting it to an official assessment requires a server-owned submission model and explicit evidence rules.
- Student Unit accepted state does not expose per-task completion timestamps, so the journey cannot calculate a trustworthy weekly goal.
- This release does not add a new XP economy or certificate.

**Readiness:** ready for a controlled student beta of the currently available curriculum on the protected Vercel Preview. It is not ready to claim final eight-level graduation, certification, or production promotion. Merge to `main` and Production remain out of scope until explicit review and approval.
