# Production auth routing incident — 2026-10-08

تم إصلاح مشكلة مسارات الإنتاج ونشر النسخة المختبرة. تسجيل الدخول السحابي ما زال غير متاح على الإنتاج لغياب إعدادات قاعدة البيانات والمصادقة؛ نجاح فحص المسارات ليس نجاحًا لـGoogle OAuth.

## Outcome and root cause

Broken URL: `https://debit-credit-nine.vercel.app/api/auth/callback/google`.

Production was running commit `684efc11a1aecc11dbf316aa00f80cb72e5cc573`, which did not contain the backend/auth implementation. Its Git tree contained neither the global auth API route nor the localized login/signup pages. The backend commit `ad05902` and subsequent local work had not reached this production deployment. No evidence implicated PostgreSQL in the original generic Next.js missing-page response.

Evidence linking the old source to production:

- Vercel deployment: `dpl_C5Y3svGzY9SasWUKqx5cqBiEA8s3`.
- Unique URL: `https://debit-credit-1s3n7zndu-ahmed-mohameds-projects-c51bc2cc.vercel.app`.
- GitHub deployment `6870595176` had SHA `684efc11a1aecc11dbf316aa00f80cb72e5cc573`; its successful deployment status pointed to that same unique Vercel URL.
- Before deployment, the callback, session API and all four login/signup URLs returned HTTP 404 with the generic Next.js missing-page response. `/ar` and `/en` returned 200.

The fix was publishing the existing correct implementation, not relocating the callback or rewriting correct application code. New regression tests guard this deployment contract.

## Verified production deployment

- Repository: `AhmedMohamed500/Debit-Credit`.
- Branch: `codex/career-league`.
- Deployed source commit: `4bf36b6ad5b821a19baa10431ca0b4271a23af84`.
- Vercel deployment: `dpl_DwNzJmksDRLM2hyvcjYkkMJudXfU`.
- Unique URL: `https://debit-credit-ojp2f4emw-ahmed-mohameds-projects-c51bc2cc.vercel.app`.
- Production: `https://debit-credit-nine.vercel.app`.
- Vercel state: `READY`; target: `production`; alias assigned: true; source SHA matched the verified commit.

A clean-source CLI upload first failed with a transport timeout before completing deployment. Publishing directly from the pushed GitHub commit through the existing Vercel project succeeded. No paid build option or additional service was enabled. Later documentation/evidence commits do not alter the deployed runtime source.

## Actual route and installed Better Auth API

The global App Router handler is `app/api/auth/[...all]/route.ts`, outside `[locale]`. It exports GET and POST, guards missing backend configuration with JSON 503, then delegates to `auth().handler(request)`. Auth initialization is lazy so builds do not need production secrets.

Installed Better Auth version: **1.7.7**. Inspection of `node_modules/better-auth/dist/integrations/next-js.mjs` confirmed that `toNextJsHandler` delegates to the same `.handler(request)` API. The existing adapter is equivalent while preserving its configuration guard and signup validation; it was not replaced with an eager initialization that would fail unconfigured builds.

Installed provider sign-in code generates the provider callback from the auth base path plus `/callback/google`. `components/cloud/auth-form.tsx` already calls `authClient.signIn.social({ provider: "google", callbackURL: destination })`. Its destination is a safe application path, not the provider callback. Users are not manually sent to the callback.

| Purpose | Exact production URL or path | Verified response |
| --- | --- | --- |
| Arabic login | https://debit-credit-nine.vercel.app/ar/login | 200 HTML |
| Arabic signup | https://debit-credit-nine.vercel.app/ar/signup | 200 HTML |
| English login | https://debit-credit-nine.vercel.app/en/login | 200 HTML |
| English signup | https://debit-credit-nine.vercel.app/en/signup | 200 HTML |
| Better Auth namespace | https://debit-credit-nine.vercel.app/api/auth/* | Global catch-all mounted |
| Session API | https://debit-credit-nine.vercel.app/api/auth/get-session | 503 JSON; no redirect |
| Google OAuth callback | https://debit-credit-nine.vercel.app/api/auth/callback/google | 503 JSON; no redirect; no generic Next.js 404 |
| Arabic post-login destination | /ar/onboarding | Physical App Router page; local authenticated flow passed |
| English post-login destination | /en/onboarding | Physical App Router page; local authenticated flow passed |

Current production callback body: `{"error":{"code":"BACKEND_NOT_CONFIGURED"}}`. This proves the application catch-all is mounted and its configuration guard receives the request. It does **not** prove the provider completed OAuth or that Better Auth initialized without configuration.

The correct Google Cloud authorized redirect URI remains `https://debit-credit-nine.vercel.app/api/auth/callback/google`. For owner-run localhost development document `http://localhost:3000/api/auth/callback/google`. Neither callback has a locale prefix. A direct request without OAuth state/code is not a sign-in test.

## Locale routing, CTAs and middleware

Physical pages exist at `app/[locale]/login/page.tsx` and `app/[locale]/signup/page.tsx`. The locale layout validates resolved `ar`/`en`; `[locale]` is not a URL value. Existing CTAs resolve logged-out users to `/{locale}/signup?next=%2F{locale}%2Fonboarding`; authenticated users go to `/{locale}/onboarding`. Signup/login links preserve the safe destination. Logout returns to the localized landing page. Physical onboarding/account destinations were checked.

No root or `src/` middleware/proxy exists, and `next.config.ts` has no locale rewrites or redirects. The built middleware manifest has no middleware/functions. Therefore `/api/*`, `/_next/*`, favicon, robots, sitemap and static/public assets never enter locale rewriting. **No middleware/proxy change was necessary or made.** Runtime smoke checks verified unprefixed auth traffic, sitemap, manifest and a public document. Regression tests require this contract to remain intact if middleware is introduced later.

## Production configuration — names only

Names were rechecked after deployment. No values were printed, requested in chat, downloaded or committed.

| Variable name | Configured in Vercel production |
| --- | --- |
| BETTER_AUTH_SECRET | No |
| BETTER_AUTH_URL | No |
| GOOGLE_CLIENT_ID | No |
| GOOGLE_CLIENT_SECRET | No |
| DATABASE_URL | No |

Expected non-secret base URL: `BETTER_AUTH_URL=https://debit-credit-nine.vercel.app` — application origin only, not `/ar`, `/en` or `/api/auth`.

Google credentials configured: **No**. Database configured: **No**. Production forms correctly show an unavailable message and disable email submission; Google is hidden. Local/guest learning remains available. This is the existing honest fallback, not a newly introduced feature or a working production login claim.

Owner action still required: privately configure the production variables above; apply the existing additive Prisma migrations to the intended database without resetting data; configure the exact Google redirect URI; then redeploy so the deployment receives the environment. Do not send secret values in chat.

## Validation

- `npm run check`: **PASS** — lint, TypeScript, 435 tests across 57 test files, production build.
- Explicit `npm run build`: **PASS**.
- Build route table included `ƒ /[locale]/login`, `ƒ /[locale]/signup`, and `ƒ /api/auth/[...all]`. Runtime checks independently confirmed all four resolved localized auth pages return 200.
- New regression unit tests: **12 PASS**. Physical pages, global API ownership, locale-safe destinations, social-start semantics, unchanged Request forwarding and JSON unavailable fallback are covered.
- Local production-build browser QA: **73 PASS**, no uncaught browser errors. Arabic/English at 1920×1080, 1440×900 and 390×844: landing → signup → login; email signup/sign-in → authenticated onboarding; authenticated CTA; logout → localized landing; HttpOnly session. This used a separate persistent localhost-only test PostgreSQL database, not production. No database reset or row deletion.
- Local direct callback: 302 → `http://localhost:3111/api/auth/error?error=state_not_found`, without locale rewriting. Google credentials were intentionally absent in this isolated test.
- **Real production** browser QA: **40 PASS**, no uncaught browser errors. Arabic/English at all three viewport sizes: landing CTA → existing signup → login, safe `next`, no malformed locale links, no horizontal overflow, and honest disabled/unavailable controls.
- Production HTTP checks: four auth pages 200; global session/callback 503 JSON; sitemap/manifest/public document 200. No localized API redirect or generic callback 404.
- Production email signup/login/logout and authenticated destination: **not completed**, blocked by missing production database/secret/base URL. No fake production users or credential submissions were made.
- Production Google OAuth end-to-end: **not tested / not claimed working**, blocked by missing credentials and backend configuration. PostgreSQL Google account creation and second-login deduplication remain unverified until the real configured Google flow succeeds.

## Changed files and evidence

Core commit `4bf36b6` changed only:

- `package.json`: added route/browser QA commands and capped Vitest at two workers. This resolves a reproduced existing Account City test timeout under concurrent CPU load without changing accounting behavior, test assertions or timeouts.
- `tests/auth-routing.test.ts`: 12 routing regression checks.
- `scripts/auth-route-smoke.mjs`: HTTP route/API/static contract; accepts an explicit base URL.
- `scripts/auth-routing-browser-qa.mjs`: isolated local full-email flow and read-only real-production browser audit. Its own local fixtures are persistent/additive and not reset.

Delivery documentation/evidence: this file, `artifacts/auth-routing-regression/local-qa.json`, `production-qa.json`, and 24 final login/signup screenshots. Failed intermediate debug artifacts are not part of the delivery commit.

Reproduction commands (run after a successful build):

```sh
npm run check
npm run build
node scripts/auth-route-smoke.mjs https://debit-credit-nine.vercel.app
node scripts/auth-routing-browser-qa.mjs
node scripts/auth-routing-browser-qa.mjs --production
```

The browser script uses installed Chrome. Local QA adds randomly named fixture accounts only to its separate localhost database. Production mode never submits credentials or writes production users.

No existing backend code, accounting engine, brand, localStorage progress or user-authored files were removed or modified. No database was reset. No Excel, payments or additional feature work was performed.
