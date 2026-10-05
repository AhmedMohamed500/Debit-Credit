# Stage 0 — Accounting Foundations

Implemented on 2026-10-06 in the existing authoritative route `/ar/bootcamp` and `/en/bootcamp`. This upgrades Accounting Bootcamp instead of adding a second beginner progression system. Arabic positioning: **من صفر محاسبة إلى أول يوم في Mizan Trading**.

## Playable sequence

| Mission | Player action | Economic understanding |
| --- | --- | --- |
| 1 Open your first company | Move 100,000 EGP; place cash and capital | Company money is separate from the owner; assets and equity rise |
| 2 Transaction radar | Drag or tap six events into record/no-entry destinations | Financial changes, not conversation or plans |
| 3 Documents | Match purchase, cash collection, expense, bank transfer and authorization | Invoice, receipt, voucher, bank evidence, purchase order |
| 4 Balance the company | Edit asset/liability/equity blocks; watch the scale | 100,000 = 0 + 100,000; a 20,000 loan changes assets and liabilities |
| 5 Account City | Sort seven accounts into three districts | Resources, obligations and owner claims; links to existing protected Account City |
| 6 Earnings and consumption | Follow revenue/expense and equity effects | Indirect equity changes, before debit/credit |
| 7 Contra account | Pair equipment with accumulated depreciation; derive 18,000 carrying value | 20,000 gross equipment less 2,000 accumulated depreciation |
| 8 Increase/decrease | Assign movement to both accounts in four events | Understand the economic movement first |
| 9 Debit/credit lanes | Place six familiar movements into recording sides | Debit/credit are directions, not good/bad or necessarily cash in/out |
| 10 Double entry | Move 20,000 cash into equipment; translate both movements | Total assets unchanged; equipment debit, cash credit |
| 11 First journal | Drag/tap account and amount pieces or edit real rows | Shared journal validation plus scenario-specific economic checks |
| 12 Entry journey | Visit document, journal, ledger, trial balance and statement stations | Same EQ-002 transaction, different views, not five transactions |
| Boss Start Mizan Trading | Evidence → affected accounts → movements → balanced entry for seven transactions | Connected company books and first-shift access |

## Consistent boss dataset

1. Owner investment: Dr Cash 100,000 / Cr Capital 100,000.
2. Cash equipment purchase: Dr Equipment 20,000 / Cr Cash 20,000.
3. Credit inventory purchase: Dr Inventory 30,000 / Cr Payable 30,000.
4. Credit sale: Dr Receivable 15,000 / Cr Revenue 15,000 **and** Dr Cost of goods sold 10,000 / Cr Inventory 10,000.
5. Cash rent: Dr Rent expense 5,000 / Cr Cash 5,000.
6. Collect the existing receivable: Dr Cash 15,000 / Cr Receivable 15,000.
7. Partial supplier payment: Dr Payable 10,000 / Cr Cash 10,000.

Closing cash 80,000; inventory 20,000; equipment 20,000; receivables zero; supplier balance 20,000; capital 100,000; revenue 15,000; expenses 15,000; profit zero. Assets 120,000 = liabilities 20,000 + equity 100,000. Trial balance debit and credit totals each 135,000. Accepted journal entries alone feed the ledger, trial balance and statement preview. A balanced but economically incorrect entry is rejected.

The mission-12 trial station is explicitly a transaction-movement view, not the company's closing trial balance. The boss view is the complete closing trial balance.

## State and boundaries

- Retains the existing key `debit-credit-bootcamp-v1` and profile-scoped repository, upgrades payload to version 2.
- Preserves old completed IDs, partial interaction history and prior Mizan access in an explicit legacy record. Does not falsely credit the new tasks from old one-click interactions.
- Saves current mission, task progress, drafts, incorrect attempts, boss work and completion timestamp. Saves/rewards are idempotent; blocked storage retains in-tab progress and warns.
- Uses existing game practice activity storage for XP. Foundation activities have **no professional skill IDs**, no coins, no new certificates, no CV employment history and no Verified/Practiced/Demonstrated skill-evidence writes. Only learning progress and the foundation game badge are awarded.
- Final CTA goes to the unchanged `/{locale}/game/first-shift` experience. No main merge, backend, database, payment, live job service or runtime AI/API dependency.

## Validation

`npm run check`: zero-warning ESLint, TypeScript, 404 tests across 54 files, Next.js production build. Engine tests cover passes A/B/C, incorrect choices, equation semantics, economic journal errors, all boss outputs, old-save migration and storage recovery. UI tests cover Arabic/English, RTL/LTR, transfer observation, account matching, documents and editable journal amounts. Browser results and required screenshots are in `artifacts/foundations/`; `artifacts/verify-foundations.mjs` runs the complete progression with real mouse and keyboard events.

The browser playthrough completed all 12 missions and all 28 boss steps, verified the 135,000 balanced closing trial totals and the first-shift link, then restored all 13 completed nodes in English. Map checks passed at 1920×1080, 1440×900, 1366×768, 430×932 and 390×844. The seven requested interaction screens also passed both mobile widths without horizontal overflow; the desktop guide remains visible even beside long journal forms. Runtime exceptions and broken artwork: zero.

PR #4 is already merged and no longer an active delivery PR. Stable updates remain on `codex/career-league`, with production deployed to the existing Vercel project after final verification.
