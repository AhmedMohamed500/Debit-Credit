# Excel Foundations + Accounting Arena — Implementation Report

Date: 2026-10-21
Branch: `codex/excel-foundations-arena`

## Usability and account-integration update — 2026-10-22

- The workspace header now uses the active cloud identity, saved profile photo, display name, and current five-stage progress. Its account affordance links to account settings; guests are routed to sign-in with the Excel route preserved as `next`.
- The desktop header is fixed at 88 px and the learning rail stays fixed directly below it. Page-level horizontal clipping prevents RTL overflow from cutting off the brand or rail. Mobile retains a compact non-trapping header and document flow.
- Workbook keyboard interaction now supports Enter/Arrow Down to advance, Shift+Enter/Arrow Up to return, while keeping focus on editable amount cells.
- Font family, font size, bold, italic, and underline controls are real accessible controls, not decorative labels. Formatting is intentionally session-local; assessed cell values, answers, server validation, and authenticated progress persistence are unchanged.
- Typography was increased across the header, rail, hero, step bar, lesson, workbook, task rail, feedback, and mobile presentation.
- Added `tests/excel-foundations-ui.test.tsx` for account linkage, keyboard focus movement, and live cell formatting. Browser QA now also asserts fixed header geometry, aligned sidebar geometry, keyboard navigation, and formatting in Arabic and English.

## Delivered scope

- Added bilingual Excel Foundations lessons at `/ar/bootcamp/excel-foundations` and `/en/bootcamp/excel-foundations`.
- Preserved all twelve existing Bootcamp missions and linked the lesson from the existing Bootcamp navigation.
- Recreated the approved desktop composition: dark navigation, petroleum-blue rail, photographic hero, five-step progress strip, lesson panel, interactive workbook, task/feedback panel, and footer cards.
- Added a responsive, non-trapping mobile layout. The workbook remains contained and the step strip is directly scrollable.
- Added a separate bilingual Accounting Arena at `/ar/accounting-arena` and `/en/accounting-arena`, leaving the approved lesson composition focused on learning.

## Interactive workbook

The worksheet is a controlled spreadsheet surface, not a screenshot. Learners can select and edit allowed cells, use a formula bar, classify accounts, enter amounts, write formulas, download CSV, and receive step feedback.

The bounded expression engine supports numeric literals, references inside `A1:D15`, arithmetic, parentheses, and `SUM(A1:B5)`. It returns explicit `#REF!`, `#NAME?`, `#VALUE!`, `#DIV/0!`, and `#CIRC!` errors. It never calls `eval`, `Function`, or executes arbitrary input.

## Five-step mastery path

1. Cell selection and the meaning of a cell.
2. Accounting equation and account classification.
3. Source amount entry.
4. Correct `SUM` formulas and balanced totals.
5. Independent final challenge with a server-selected data variant, planted classification error, two incorrect ranges, and reasoning questions.

The final challenge has three deterministic variants with equivalent structure. The server derives the variant from the authenticated user ID. The client cannot choose it.

Mastery thresholds are centralized in `EXCEL_RULES`: 80% accounting and 80% Excel, with critical conditions required. A step unlocks only after the preceding step passes. Failed attempts remain retryable and preserve progress.

## Trusted persistence and anti-cheating

Authenticated progress uses the existing PostgreSQL, Better Auth, Prisma, and `CloudProgress` infrastructure under the `excel-foundations` domain. No schema migration or second backend was introduced.

- The client sends cells and reasoning answers, never an authoritative score, XP, completion flag, or rank.
- The server recalculates every assessment.
- Commands use UUID idempotency keys and the existing `MissionAttempt` unique constraint.
- Progress writes use the existing serializable transaction and retry behavior.
- The final result uses the existing `AcceptedOutcome` unique `(userId, outcomeKey)` constraint.
- Replays cannot duplicate completion or XP; changed reuse of a command ID is rejected.
- Revision checks protect against stale tabs and double navigation.
- Guest practice works locally but grants no verified progress or Arena entry.

## XP and achievement rules

- Steps 1–4: 20 XP each, once.
- Completed stage: 100 XP, once.
- Passed final challenge: 200 XP, once.
- Total for completed Excel Foundations: 380 XP.

XP is derived from server-held completed steps. The accepted outcome is labelled `trainingOnly: true`; it is not employment experience, an external certificate, or verified professional evidence.

## Accounting Arena ranking

The Arena reads completed, server-accepted outcomes only for users who explicitly opted in.

Ranking priority is completed stages, non-duplicated eligible XP, then final mastery score. Completion time provides deterministic display order only; users equal on ranking criteria share a rank.

Views include overall learning, Excel stage, and weekly outcomes accepted since Monday 00:00 UTC. Only nickname, rank, stage count, eligible XP, score, and completion time are returned. Email, phone, CV, profile fields, documents, and assessment answers are never returned. Withdrawing consent removes the entry while preserving private progress. Arena consent does not enable employer discovery.

An honest empty state appears when nobody is eligible. There are no seeded players, fake scores, company claims, or fabricated statistics.

## Files added

- `app/[locale]/bootcamp/excel-foundations/page.tsx`
- `app/[locale]/accounting-arena/page.tsx`
- `app/excel-foundations.css`
- `app/excel-foundations-feedback.css`
- `components/foundations/excel-foundations.tsx`
- `components/foundations/accounting-arena.tsx`
- `lib/excel-foundations/engine.ts`
- `lib/excel-foundations/engine.test.ts`
- `lib/server/progress/excel-foundations.ts`
- `public/foundations/excel-foundations-hero-v1.png`
- `scripts/excel-foundations-browser-qa.mjs`
- `docs/EXCEL_FOUNDATIONS_ACCOUNTING_ARENA_REPORT.md`

## Files updated

- `app/api/v1/[...path]/route.ts` — authenticated progress and Arena routes.
- `components/platform/accounting-bootcamp.tsx` — route into Excel Foundations without changing mission IDs or data.
- `scripts/backend-api-qa.mjs` — database, idempotency, tamper, privacy, and leaderboard regression coverage.
- `README.md` — report link.

## API additions

- `GET /api/v1/me/excel-foundations`
- `POST /api/v1/me/excel-foundations`
- `GET /api/v1/competition/excel-foundations?scope=overall|stage|weekly`

All routes require an authenticated owner. State changes preserve same-origin protection, account-context checks, rate limits, and strict Zod validation.

## Validation performed

- `npm run check` on 22 October 2026: ESLint and TypeScript passed; 86 files / 718 tests passed; Next.js production build passed and included both route families.
- Focused engine tests: 6 passed for formulas, error states, cycles, variants, scoring, tamper resistance, progress recovery, and shared ranks.
- Local PostgreSQL authenticated API QA: 90 checks passed, including separate signup/sign-in, stage-skip rejection, fake score/XP rejection, all five server assessments, idempotent replay, one accepted reward, private-by-default completion, explicit opt-in, no email leakage, and withdrawal.
- Chromium browser QA: Arabic and English at 1536×1024 and 390×844, complete five-step guest flow, honest Arena empty state, and no document-level mobile overflow.
- Local screenshots are in ignored `artifacts/excel-foundations-qa/`.

## Hero artwork

The hero uses a newly generated fictional learner, not a real user or copied person. It was generated as a text-free ultrawide, photorealistic dark-blue office scene with a fictional young accountant wearing glasses at a laptop and negative space for live UI. Text, controls, and numbers remain HTML.

## Existing data and migration policy

- No existing mission, ID, accepted outcome, user, subscription, profile, or competition record is rewritten.
- No database migration is required.
- Existing users begin this new stage incomplete and private; legacy activity is not silently promoted into competition.
- Existing CV and Skill Passport evidence rules remain unchanged. The outcome stays an internal learning achievement unless a separately approved evidence policy maps it.

## Remaining limitations

- This release delivers one complete stage and the expandable Arena foundation. Later accounting stages retain their existing implementations.
- Weekly ranking is derived on read; no paid realtime service or new season table was added.
- Notes are session-local and labelled as such; assessed workbook data and answers are persisted.
- Google OAuth and outbound email were not exercised in local QA. Existing email/password Better Auth signup and separate sign-in were exercised.
