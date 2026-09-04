# Debit & Credit

### by Money Coder

Debit & Credit is a bilingual, frontend-only accounting learning product. It teaches accounting through guided practice, visual money movement, journal construction, short missions, evidence-based investigations, and a professional work simulation—not through passive video lessons alone.

## Learning journey

1. Accounting Basics — equation, account types, normal balance, debit and credit rules.
2. Money Flow — see value move and understand increases and decreases.
3. Journal Entries — analyze transactions, choose accounts, and validate balance.
4. Missions — solve short practical accounting situations.
5. Accounting Detective — investigate evidence, link clues, and propose treatment.
6. Arena — work through a professional accounting simulation and daily challenges.
7. Career Progress — review scores, skills, weak areas, readiness, and achievements.

## Features

- Educational Account Guide in Arabic and English.
- Touch, click, select, and drag-friendly Money Flow Lab.
- Journal entry practice with balanced-entry validation.
- Missions with hints, retry, feedback, score, and financial impact.
- Accounting Detective cases with evidence, notes, links, progressive hints, and conclusions.
- Debit & Credit Arena with career mode, daily challenges, CFO guidance, scoring, and best-attempt progress.
- Local learner profile, XP signals, streaks, achievements, and skill aggregation.
- Local/demo leaderboard behavior clearly separated from online competition.
- Arabic RTL and English LTR interfaces.
- Installable PWA metadata with Debit & Credit branding.

## Architecture

The application is a Next.js App Router project using React, TypeScript, Tailwind CSS, Lucide icons, and Vitest. All content and progress remain in this repository and the browser. There is no backend, paid API, external local package, symlink, or runtime dependency on FINORA.

Key folders:

- `app/` — localized product routes and metadata.
- `components/` — learning, Arena, Missions, Detective, Money Flow, layout, and progress UI.
- `data/` — real extracted courses, cases, missions, scenarios, Arena tasks, and the educational chart of accounts.
- `lib/` — learning engines, accounting validation, scoring, storage, progress, and migration.
- `types/` — education-only domain types.
- `tests/` — accounting and educational engine tests.
- `docs/` — technical notes.

## Local storage

Progress uses namespaced keys such as `debit-credit-arena-v1`, `debit-credit-missions-v1`, `debit-credit-detective-v1`, `debit-credit-money-flow-v1`, and `debit-credit-progress-v1`. A one-time migration copies only recognized FINORA education keys and never deletes or edits operational journals, parties, invoices, or settings.

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

The project builds as a standard Next.js application and is ready for GitHub/Vercel deployment. No paid service is required.
