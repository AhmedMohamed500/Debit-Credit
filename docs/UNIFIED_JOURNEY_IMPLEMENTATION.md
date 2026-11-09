# Unified Accounting Journey V1 — Implementation Report

## Delivery metadata

- Starting SHA: `f6e753f047f86e1b0881c7b11cfbb5c4182e0053`
- Implementation branch: `codex/unified-accounting-journey-v1`
- Final implementation SHA: `PENDING_COMMIT`
- Draft pull request: `PENDING_PUSH`
- Vercel Preview: `PENDING_DEPLOYMENT`
- Production: not merged and not changed.

## What changed

The signed-in student home and the canonical `/{locale}/journey` route now use one unified accounting journey. The previous three-card sequence was replaced with a responsive dark-navy/gold learning map with eight numbered levels, completed/current/locked/development states, the real account name and photo, saved game rewards, real assessed-task progress, learning badges, the current level mission list, and links to career outcomes.

The implementation does not create a second dashboard. `/{locale}` and `/{locale}/journey` render the same `StudentJourneyHome` for the student persona. The thin cloud account strip is hidden on those two surfaces to avoid duplicated navigation.

## Existing modules reused

- Better Auth session and personal-profile completion guard.
- Server-authoritative Student Unit state from `GET /api/v1/me/student-unit`.
- Student Unit grading order and its 11 accepted task IDs.
- First Shift's five real milestones from `firstShiftMissionProgress`.
- Existing cloud-backed game state for XP, coins, active days, photo and display name.
- Existing Skill Passport, Practical Work, Career Profile, English CV and Achievements routes.
- Existing Competition route; no rank is shown without real participation data.
- Existing career evidence/CV projection behavior remains unchanged.
- Existing Excel Foundations files, API, saved records and ranking engine remain unchanged as a standalone module.

## Level mapping

| Level | Display title | Real completion inputs | Route |
|---|---|---|---|
| 1 | Accounting Foundations | `document-control` | `/game/student` |
| 2 | Source Documents | `journal-capital`, `journal-equipment`, `journal-inventory` | `/game/student` |
| 3 | Journal Entries | `journal-service`, `journal-receipt`, `journal-rent` | `/game/student` |
| 4 | General Ledger | `ledger-cash` | `/game/student` |
| 5 | Trial Balance | `trial-balance` | `/game/student` |
| 6 | Financial Statements | No assessed implementation yet; shown as **In development** and grants no completion | Journey map only |
| 7 | Review & Analysis | `classification-error`, `worksheet` | `/game/student` |
| 8 | Final Company Simulation | Three accepted First Shift documents, posted journal, reviewed ledger | `/game/first-shift` |

Every accepted Student Unit task is mapped exactly once. Excel is not mapped to the eight-level core journey.

## Progress and rewards rules

- Official journey progress is derived from 11 server-accepted Student Unit tasks plus 5 existing First Shift milestones: 16 assessed items total.
- A level is completed only when all mapped real requirements are complete.
- The next implemented level becomes current only after prior implemented levels are complete.
- Financial Statements remains visible for roadmap continuity but cannot award completion, XP or a badge.
- Learning badges are a derived presentation of completed journey levels and are explicitly labelled as non-professional accreditation.
- XP and coins shown are the existing saved game-state values. This implementation does not invent or duplicate XP awards.
- Weekly goal shows an honest unavailable state because the current accepted Student Unit state does not expose per-task completion timestamps.
- Competition remains optional. The journey links to the existing competition product but does not display a public rank without participation data.
- Career evidence and CV data are not inferred from map navigation or badge state; existing server/projector rules remain authoritative.

## Navigation and compatibility

- Added canonical signed-in route: `/{locale}/journey`.
- Guests are redirected to locale-correct login with `next=/{locale}/journey`.
- Users missing required personal details are redirected to the personal-profile form with the same safe internal destination.
- The signed-in home page renders the same journey, not a duplicate dashboard.
- Main student navigation now links to `/{locale}/journey` and treats the signed-in home as the same active destination.
- Excel Foundations stays available at `/{locale}/bootcamp/excel-foundations`; existing data was not deleted or reset.

## Files changed

- `app/[locale]/journey/page.tsx`
- `app/student-journey.css`
- `components/cloud/session-boundary.tsx`
- `components/game/student-world.tsx`
- `components/platform/game-hub.tsx`
- `components/platform/platform-nav.tsx`
- `components/student/student-journey.tsx`
- `lib/student/journey.ts`
- `tests/product-cleanup.test.ts`
- `tests/student-journey-ui.test.tsx`
- `tests/student-journey.test.ts`
- `docs/UNIFIED_JOURNEY_IMPLEMENTATION.md`

## Validation results

- ESLint: passed with zero warnings.
- TypeScript: passed.
- Unit/integration/component tests: **725/725 passed** across 86 test files.
- Focused unified journey tests: **35/35 passed**.
- Production build: passed on Next.js 16.4.3; `/{locale}/journey` is present as a dynamic route.
- The tests cover AR/EN routes, Excel exclusion from the core unlock chain, exact non-duplicated task mapping, old account progress, First Shift's five real milestones, honest development state, account switching, retry behavior and career outcome links.

## Browser QA and screenshots

Browser QA was attempted in two independent ways:

1. The Codex in-app browser automation failed during its own kernel asset initialization before a page could be controlled.
2. A Playwright run started an isolated PostgreSQL fixture successfully, but the fixture client stalled before the application flow could begin. The run was stopped; no production data was touched.

Because neither browser harness reached the journey UI, no screenshots are claimed as verified in this report. The responsive CSS includes dedicated layouts for desktop, tablet and 390px mobile, and component tests verified the eight interactive level controls and active links, but a real-browser visual pass remains required on the Vercel Preview.

## Preserved data and systems

- No Prisma schema or migration changes.
- No database reset.
- No stored Excel, Student Unit, First Shift, profile, competition, career evidence, CV or subscription data removed.
- No production writes.
- No paid service or new dependency added.

## Remaining limitations

- Level 6 Financial Statements needs new server-graded content before it can be completed.
- The existing Student Unit begins with document control, so the first visible level uses that real foundational task rather than claiming unimplemented accounting-equation assessment.
- Student Unit accepted state currently lacks per-task timestamps, so a trustworthy weekly mission goal cannot yet be calculated.
- Student Unit tasks do not currently award server-owned XP; the UI therefore shows only existing saved game XP rather than manufacturing a new score.
- A real-browser visual comparison and screenshots are pending because of the local browser/fixture failures described above.

## Deployment status

This branch is intended for a Draft PR and Vercel Preview. It must not be merged into `main` or promoted to Production until review and explicit approval.
