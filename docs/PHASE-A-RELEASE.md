# Phase A Release — Stable Playable Experience

Date: 11 September 2026  
Baseline: `e4466ed0d5752ef013a49a4f4581d6f970d4d557`  
Implementation commit: `b8bd85346a5631f82a63b15562657ef9a9a2e689`  
Branch: `codex/first-day-cinematic`  
Main remained at: `244b3c5c87bef06a20225f19a5f1daaf82e20d63`

## Result

Phase A repairs the existing First Shift and Nature of Accounts experience without starting Chapter 2 or replacing the current game, progression, storage or accounting content.

- The First Day intro now has a compact cinematic HUD and one coherent chapter/action block on desktop and mobile.
- The accounting guide keeps the office and open-book identity while using readable document flow, a reserved ring gutter, stable account-detail grids, clearer scroll areas and a single-page mobile pattern.
- A partial journal entry and its hint attribution survive closing the document and browser refresh.
- Successful document submission is idempotent. Double callbacks cannot add a second accepted attempt, journal entry or reward.
- A correct answer still requires the expected accounts, sides and amounts; a merely balanced wrong entry remains rejected and does not mutate accepted balances.
- Invalid stored JSON recovers to a safe state carrying a warning instead of appearing to load successfully.
- The Nature of Accounts MD download and the guide links in the main header, First Day HUD and journal workbench remain available.

## Changed application sources

- `app/first-day-entry.css`
- `components/campaign/cinematic-chapter-intro.tsx`
- `app/accounting-manual.css`
- `components/campaign/first-day-screen.tsx`
- `lib/campaign/first-day.ts`
- `lib/campaign/director.ts`
- Focused regression tests in `tests/first-day.test.ts`, `tests/campaign-ui.test.tsx`, `tests/campaign.test.ts` and the intentional Nature stylesheet protection hash update.
- Browser verification scripts and review artifacts under `artifacts/`.

## Routes checked

- `/ar` and `/en`: intro, manager briefing, desk, open document, journal builder, wrong consequence, successful consequence and shift completion.
- `/ar/account-guide` and `/en/account-guide`: category selection, search, account selection, page/detail navigation and MD download.
- Compatibility routes `/ar/arena/account-guide` and `/en/academy/account-guide`.
- Guide opened from an in-progress First Shift document and returned to the original draft.

## Verification

The full repository command `npm run check` passed on the implementation commit:

- ESLint: passed with zero warnings.
- TypeScript: passed.
- Vitest: 25 files passed, 201 tests passed.
- Next.js 16.3.4 production build: passed; 7 static pages generated and all listed dynamic routes compiled.

Browser-only Playwright verification also passed:

- Arabic and English First Shift flows.
- All three accounting documents completed end to end.
- Balanced but semantically wrong submission rejected before correction.
- Draft retained after browser refresh.
- Double submit produced one accepted evidence record, one journal entry, +100 XP and +50 coins for the document.
- Final totals remained 3 journal entries, +300 XP and +150 coins.
- Processed tray moved 0 → 1 → 2 → 3 and remained correct after reload.
- Dialog focus stayed inside the dialog and Escape closed it.
- Nature of Accounts search, categories, selection, local pane scrolling, mobile list/detail tabs and return context passed.
- Widths 360, 390, 768, 1280 and 1440, plus 1906×890 and 1877×953, reported no page-wide horizontal overflow.

Detailed visual evidence is in [UI-AUDIT.md](./UI-AUDIT.md). The two exact-size after captures are [Nature of Accounts](../artifacts/phase-a-after/nature-ar-1906x890.png) and [First Day intro](../artifacts/phase-a-after/first-day-intro-ar-1877x953.png). Representative mobile captures are [account guide at 390×844](../artifacts/phase-a-after/manual-en-390.png) and [First Day intro at 390×844](../artifacts/phase-a-after/intro-ar-390.png).

## Remaining limits

- Browser storage is still local practice storage. It is not a trusted server record and does not provide cross-device recovery.
- Failed browser writes retain progress only in memory for the open tab; the existing warning communicates that limitation.
- The original screenshot files named by the plan were unavailable in this run. Matching runtime baseline captures were made at the exact routes, languages and viewport dimensions; the audit does not claim direct reinspection of the missing files.
- Physical-device virtual-keyboard behavior and 200% text zoom were not validated in this environment.

## GitHub and preview delivery

- Pull request: [PR #1 — codex/first-day-cinematic](https://github.com/AhmedMohamed500/Debit-Credit/pull/1)
- GitHub head verified after the Phase A push: `aef3f9459971d2346feada04d0532a6d02e1694a`
- Vercel deployment: [Phase A Preview](https://debit-credit-9ng53mhv5-ahmed-mohameds-projects-c51bc2cc.vercel.app)
- GitHub deployment ID `6398764627` reported `success` with the description `Deployment has completed`.

The Preview is protected by Vercel Authentication. An unsigned headless request receives a `302` redirect to Vercel SSO, so the deployed UI could not be independently exercised without the project session. Deployment success is verified from the Vercel GitHub status; all route and visual journeys listed above were executed against the same production build locally. This limitation is stated here instead of claiming a public runtime inspection.

## Next-phase boundary

No Chapter 2, backend, paid service, framework migration, Career expansion, readiness score or VERIFIED evidence was added. Phase B may begin only from the current source and this release record, and must keep these layout, persistence and accounting guarantees intact.
