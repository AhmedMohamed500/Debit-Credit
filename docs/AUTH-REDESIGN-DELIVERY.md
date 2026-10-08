# Auth experience redesign — 2026-10-08

تم تنفيذ تصميم التسجيل والدخول بالاستناد إلى الصورة المرجعية: مساحة عمل مضيئة وشاب يستخدم لابتوب، رسالة تعلّم بالممارسة، أربع فوائد، أمثلة تقدم وإنجازات، وبطاقة تسجيل حقيقية. بقية المنتج وأنظمة المحاسبة لم تتغير.

## Source and scope

- Starting commit: `eabac1fd446898087641aa255da96405d456568b`.
- Final implementation commit: `3db684a8057b730c2ab91f3214b094c208a8e292`.
- Branch: `codex/career-league`.
- Delivery evidence/documentation is a separate follow-up commit; the final repository HEAD is reported in the handoff.
- No backend rewrite, Better Auth removal, schema migration change, accounting engine change, storage reset, new paid service or package installation.

## Routes

| Experience | Arabic | English |
| --- | --- | --- |
| Signup | `/ar/signup` | `/en/signup` |
| Login | `/ar/login` | `/en/login` |
| Default authenticated destination | `/ar/onboarding` | `/en/onboarding` |

The existing physical App Router login/signup pages are unchanged. The global auth handler remains `app/api/auth/[...all]/route.ts`, not localized. The production Google callback remains `https://debit-credit-nine.vercel.app/api/auth/callback/google`.

## Design and reusable components

The desktop composition is 60% story / 40% form. The large white form card uses navy typography, pale blue inputs, a blue CTA and small restrained mint/gold/violet visual accents. At 1366×768 the page scrolls normally: no scaled-down page or clipped fixed-height form. Mobile uses a compact artwork band, short message, condensed four benefits and a single-column form; both 390×844 and 430×932 were tested.

New files under `components/auth/`:

- `auth-shell.tsx`: shared split-screen/mobile composition.
- `auth-story-panel.tsx`: localized product story and responsive artwork.
- `auth-benefits.tsx`: four value points and existing Lucide icons.
- `auth-progress-preview.tsx`: explicitly labelled illustrative progress, challenge completion and in-platform achievement examples; no official certification/employment claim.
- `auth-brand.tsx`: current Debit & Credit wordmark/stair-step symbol presentation.
- `auth-form-card.tsx`: shared signup/login heading and truthful availability-dependent copy.
- `google-auth-button.tsx`: real social-start button, loading/disabled states and inline SVG Google mark.
- `password-field.tsx`: independent accessible reveal buttons; required labels, autocomplete and unchanged server-aligned password policy.

The controller stays in `components/cloud/auth-form.tsx` and uses these components. `app/auth-experience.css` is scoped to auth. The conditional auth-only wrapper override removes the game shell's unused mobile navigation padding; other product pages retain their original padding/theme. `app/layout.tsx` only adds the stylesheet import.

## Artwork strategy

Used the `imagegen` skill/built-in tool to create the **art layer only**, following the approved reference's smiling adult male Egyptian/MENA learner, light-blue shirt, laptop and bright workspace. Existing assets were inspected first. No functional form, headline, progress label, brand lettering or certification claim is baked into the art.

- `public/auth/career-workspace-v1.webp`: 1536×1024; 79,138 bytes.
- `public/auth/career-workspace-mobile-v1.webp`: 640×427; 20,764 bytes.

Next/Image uses separate small-phone artwork and responsive derivatives. Existing bundled Cairo font and existing Sharp/Lucide dependencies are reused. See `AUTH-REDESIGN-ART-PROMPT.md` for the exact prompt and generation/encoding method.

## Real auth and error/loading behavior

- Email signup still calls `authClient.signUp.email`; login still calls `authClient.signIn.email`. Real local PostgreSQL-backed signup/sign-in/logout flows passed.
- Google still calls `authClient.signIn.social({ provider: "google", callbackURL: destination })`, never directly navigates to the provider callback. Without Google configuration its button is disabled and explains availability unobtrusively.
- `safeNext` still determines the internal localized destination. Signup/login links preserve it.
- Better Auth 1.7.7's installed redirect plugin already navigates on confirmed email login responses with `redirect: true`. The new controller avoids a second competing navigation; signup without that SDK redirect still navigates to the same safe destination after server confirmation. This preserves destinations/session behavior while removing a reproduced `ERR_ABORTED` navigation race.
- A synchronous in-flight guard prevents duplicate requests; fields and submit controls reflect pending state. Separate localized email/Google loading labels are shown. No fake success state.
- Passwords remain only in the existing uncontrolled form inputs and request payload, not component state/localStorage/sessionStorage. Reveal controls keep the same input and do not echo its content in helper text.
- Signup and confirmation retain the real 12-character minimum/128-character maximum. Login retains its existing minimum of one character, not an invented signup constraint.
- Native validity errors are replaced with localized inline guidance; mismatch and real API error/connection messages are inline without stacks. Existing account responses use conservative sign-in guidance rather than unnecessarily exposing account details.
- Password reset is offered only when backend/email delivery are configured; its existing Better Auth request is preserved but the browser prompt is replaced by a labelled inline email form.
- The large yellow setup warning is removed. Unavailable registration is explained with a small user-facing notice, disabled submission and a working local-learning link. No developer environment language or false cross-device-sync promise is shown when backend setup is unavailable.
- Server-managed HttpOnly sessions, PostgreSQL integration, profile/bootstrap hooks and logout implementation are unchanged. Repeated local logins were checked with a read-only SQL count: exactly one user per fixture account.

## Quality gates and browser QA

- `npm run check`: **PASS**, 449 tests in 58 test files, lint/typecheck and production build.
- Explicit `npm run build`: **PASS**, after the final implementation commit; optimized compilation and production route table verified.
- Build manifest/table retains `/[locale]/login`, `/[locale]/signup`, `/api/auth/[...all]`; all four resolved auth URLs returned 200.
- Focused auth UI tests: **14 PASS**. RTL/labels, policy, password visibility, unavailable states, safe social-start destination, validation/mismatch, pending/duplicate protection, API/connection feedback and conditional inline reset are covered. Unit mocks are limited to component tests, not the browser integration proof.
- Final browser QA: **223 PASS**, zero uncaught browser errors. Arabic and English signup/login at 1920×1080, 1440×900, 1366×768, 430×932 and 390×844.
- Browser checks include no overflow, unclipped comfortable input bounds, keyboard-visible focus, independent reveal controls, localized direction, safe CTA/link destinations, invalid email and mismatch with zero auth requests, real signup loading, real wrong-password feedback, successful authenticated redirects, logout, HttpOnly cookies and read-only database deduplication checks.
- The existing real login rate limit is respected by waiting its idle window between locale suites; it is not disabled, reset or weakened.
- QA uses a separate persistent localhost-only PostgreSQL test database and randomly named fixture accounts. No existing database rows or user localStorage were deleted. Production credentials/users were never submitted by this audit.
- Temporary deployment-source copies under the already-ignored `artifacts/backend-phase-1/tmp/` are excluded from TypeScript, ESLint and Vitest. This prevents rechecking/rerunning copied sources with absent generated dependencies; actual application/tests and all existing assertions/timeouts remain included.

## Screenshots and report

`artifacts/auth-redesign/local-qa.json` records the final 223 checks. Twenty final screenshots cover both pages, both languages and all five widths. Requested examples:

- `artifacts/auth-redesign/signup-ar-1920.png`
- `artifacts/auth-redesign/signup-ar-1366.png`
- `artifacts/auth-redesign/signup-ar-mobile-390.png`
- `artifacts/auth-redesign/signup-en-1440.png`
- `artifacts/auth-redesign/login-ar-1440.png`
- `artifacts/auth-redesign/login-en-mobile-390.png`

Intermediate failure/debug screenshots are preserved locally but are not staged as final evidence.

## Deployment and remaining configuration

The owner explicitly authorized publication in the follow-up. This redesign is now **pushed to GitHub and deployed to Vercel production**.

- Published source commit: `c3d37920ce0d16766722870fa09ffd5297d64018`, branch `codex/career-league`.
- Vercel deployment: `dpl_GkneetwHEbN8uz9C2BnSQ2mGRiS1`.
- Unique deployment: https://debit-credit-wu0016447-ahmed-mohameds-projects-c51bc2cc.vercel.app.
- Production: https://debit-credit-nine.vercel.app.
- Verified state: `READY`; target: `production`; alias assigned: true; source SHA matches the published commit.
- Real production browser QA: **160 PASS**, zero uncaught browser errors, Arabic/English at all five requested desktop/mobile sizes. Landing → signup → login, safe `next`, RTL/LTR, input bounds, no horizontal overflow, visible keyboard focus, independent password reveal and honest disabled/unavailable controls passed.
- All four auth pages return 200. Global session/callback endpoints return JSON 503 for missing configuration, without locale rewriting or generic Next.js 404; static-route checks passed.
- Both published WebP assets return 200 and their SHA-256 hashes match the committed assets. The production HTML contains the redesigned auth experience.
- Read-only production evidence: `artifacts/auth-redesign/production-qa.json` and 20 `*-production.png` screenshots. No credentials were submitted or production users created. The follow-up documentation/evidence commit does not change the deployed runtime source.

Google OAuth end-to-end is **not claimed working**. Existing production configuration remains a blocker for Google and email/password login: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL` are not configured in the checked production inventory. Only names/presence were inspected; no values were printed or requested.

Expected base origin remains `https://debit-credit-nine.vercel.app`. Owner must privately configure backend/Google credentials and the exact unlocalized callback, apply existing additive migrations to the intended database without reset, and redeploy before a real production Google/email flow can be verified. No secret should be pasted in chat.

## Changed-file inventory and reproduction

Implementation: the eight components above, `components/cloud/auth-form.tsx`, `app/auth-experience.css`, `app/layout.tsx`, two new WebP assets, `tests/auth-ui.test.tsx`, `scripts/auth-routing-browser-qa.mjs`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts` (18 files).

Evidence/documentation: this file, `AUTH-REDESIGN-ART-PROMPT.md`, final QA JSON and 20 final screenshots. Unrelated existing untracked user work is untouched and unstaged.

```sh
npm run check
npm run build
node scripts/auth-routing-browser-qa.mjs --redesign
# Only after this source is deployed:
node scripts/auth-routing-browser-qa.mjs --redesign --production
```

Installed Chrome is used for browser QA. Production mode is read-only and never submits credentials or creates fake users.
