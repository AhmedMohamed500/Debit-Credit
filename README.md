# Debit & Credit

Bilingual accounting career simulation by Money Coder. Next.js App Router, React, TypeScript, PostgreSQL, Prisma and Better Auth.

[Arabic site](https://debit-credit-nine.vercel.app/ar) · [English site](https://debit-credit-nine.vercel.app/en) · [Documentation](docs/README.md) · [Current status](docs/STATUS.md)

## User journey

Guests can learn and play with browser-local progress. Email signup creates an account without a session, then opens localized login. Successful login opens `/ar` or `/en`, unless a safe internal destination was requested. The homepage remains the starting point for learning and work.

Supported authenticated features use the existing cloud backend. Browser-local learning, professional evidence and employer demo data are not automatically cloud-synced or verified achievements. Google and email delivery require separate provider configuration; disabled buttons do not mean these services work.

## Development

```sh
npm install
npm run dev
npm run check
```

Open `http://localhost:3000/ar` or `/en`. See [backend setup](docs/BACKEND-PHASE-1.md) before enabling cloud features. Secrets belong in ignored local environment files or provider settings, never Git.

`npm run check` runs lint, TypeScript, unit tests and the production build. Building generates Prisma Client; it does not reset, seed or migrate a database. Database deployment is a separate explicit operation.

## Project map

- `app/`: localized routes, API handlers and active styles.
- `components/`: current UI and learning modules.
- `lib/`, `data/`, `types/`: accounting rules, educational content, storage and server domains.
- `prisma/`: schema and versioned migrations.
- `tests/`, `scripts/`: automated checks and local QA runners.
- `docs/`: current guides; [archived reports](docs/archive/reports/README.md) retain historical release records.
- `archive/`: frozen unused landing implementations, excluded from runtime tooling.
- `artifacts/`: ignored local screenshots, QA outputs and isolated test databases; not published.

[Routes](docs/ROUTES.md) explains current navigation and compatibility. Protected accounting systems, player storage keys and historical bookmarks are retained. Older reports describe their release date, not necessarily today's deployment.

## Product documentation

[Curriculum](docs/COMPLETE-ACCOUNTING-CAREER-CURRICULUM.md) · [First Shift](docs/GAMEPLAY-PHASE-B.md) · [Skill Passport](docs/PROFESSIONAL-EVIDENCE-PIPELINE.md) · [Backend](docs/BACKEND-PHASE-1.md) · [Signup → login → home](docs/SIGNUP-SIGNIN-HOME-AR.md)

Production is hosted on Vercel. Render fallback configuration exists but no Render deployment is live; its account currently requires a payment method. No paid service or database reset is authorized by this organization work.
