# Debit & Credit

### by Money Coder

Debit & Credit is a bilingual, frontend-only, game-based accounting learning platform. One player journey connects lessons, journal practice, visual money movement, real missions, evidence-based investigations, Arena competition, measurable skills, career readiness, and a clearly labeled demo employer portal.

## Learning journey

1. Accounting Foundations — equation, classification, protected Nature of Accounts, and Money Flow.
2. Journal Entries — analyze transactions, choose accounts, determine sides, and validate balance.
3. Ledger & Posting — move from journal entries to ledgers and running balances.
4. Trial Balance — validate balances and detect posting differences.
5. Adjusting Entries — accruals, prepayments, depreciation, and period-end adjustments.
6. Financial Statements — income, financial position, and statement relationships.
7. Real-World Accounting — Missions, Detective, Money Flow, and mixed cases.
8. Professional Mode — Arena, Career Mode, timed work, and career readiness.

## Features

- Educational Account Guide in Arabic and English.
- Touch, click, select, and drag-friendly Money Flow Lab.
- Journal entry practice with balanced-entry validation.
- Missions with hints, retry, feedback, score, and financial impact.
- Accounting Detective cases with evidence, notes, links, progressive hints, and conclusions.
- Debit & Credit Arena with career mode, daily challenges, CFO guidance, scoring, and best-attempt progress.
- One canonical player model for XP, coins, levels, objectives, streaks, badges, certificates, skills, and career readiness.
- Command Center, eight-level Learning Map, and persistent global journey status.
- Skills & Certificates and Career Readiness dashboards based on real recorded activity.
- Separate employer experience with skill filters, local shortlist actions, and explicitly seeded demo candidates.
- Local/demo leaderboard behavior clearly separated from online competition.
- Arabic RTL and English LTR interfaces.
- Installable PWA metadata with Debit & Credit branding.

## Architecture

The application is a Next.js App Router project using React, TypeScript, Tailwind CSS, Lucide icons, and Vitest. All content and progress remain in this repository and the browser. There is no backend, paid API, external local package, symlink, or runtime dependency on FINORA.

Key folders:

- `app/` — localized product routes and metadata.
- `components/` — game shell, Command Center, Learning Map, practice, companies, learning modes, layout, and progress UI.
- `data/` — real extracted courses, cases, missions, scenarios, Arena tasks, and the educational chart of accounts.
- `lib/` — the unified game engine, employer filters, learning engines, accounting validation, scoring, storage, progress, and migration.
- `types/` — education-only domain types.
- `tests/` — accounting and educational engine tests.
- `docs/` — technical notes.

## Gameplay Phase B

First Shift is now a reusable accounting work simulation. The player receives three Mizan Trading case files, reviews source and supporting documents, chooses a professional action, posts through the protected accounting engine when appropriate, and receives an event-derived performance review. Versioned case events also project explainable local evidence into the Skill Passport. Chapter 2 remains explicitly locked and non-routable.

Architecture, migration, scoring, evidence rules, QA, artifacts, limitations, and the next recommendation are documented in [`docs/GAMEPLAY-PHASE-B.md`](docs/GAMEPLAY-PHASE-B.md).

Review: <https://github.com/AhmedMohamed500/Debit-Credit/pull/2> · Preview: <https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app>

## Local storage

The canonical player state uses `debit-credit-player-v1`. Detailed module evidence remains in namespaced stores such as `debit-credit-arena-v1`, `debit-credit-missions-v1`, `debit-credit-detective-v1`, `debit-credit-money-flow-v1`, and `debit-credit-progress-v1`. Existing progress is synchronized once into the unified player without deleting module data. The original FINORA migration remains unchanged and never reads or edits operational journals, parties, invoices, or settings.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/ar` or `http://localhost:3000/en`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
# or all gates
npm run check
```

## Deployment

Production: <https://debit-credit-nine.vercel.app>

Repository: <https://github.com/AhmedMohamed500/Debit-Credit>

No paid service is required.
