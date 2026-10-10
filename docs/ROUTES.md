# Routes and compatibility

Use resolved `ar` or `en` in URLs, never the filesystem placeholder `[locale]`.

## Primary journey

`/{locale}` → `/{locale}/signup?next=%2F{locale}` → `/{locale}/login?next=%2F{locale}&registered=1` → `/{locale}/auth/continue` → first-time `/{locale}/student-profile` → `/{locale}` → `/{locale}/student`.

Signup does not start a session. Login preserves a safe internal destination; otherwise it returns home. Auth traffic goes directly to `/api/auth/[...all]`, without a locale prefix. `/api/auth/callback/google` is the callback handler but Google is unavailable until credentials are configured.

## Similar names, different responsibilities

| Path (under `/ar` or `/en`) | Responsibility |
| --- | --- |
| `/profile` | Browser-local game/player profile. |
| `/account` | Authenticated cloud account settings. |
| `/student-profile` | Required private CV contact/education setup; session email is authoritative. |
| `/student` | Server-graded introductory source-document, journal, ledger, trial balance and spreadsheet tasks. |
| `/auth/continue` | Safe post-auth redirect gate: validated personal CV details before the requested destination. |
| `/career` | Career hub and readiness. |
| `/career-profile` | Professional evidence, skills and CV; noindex. |
| `/employers` | Current employer demo entry. Candidates are demo data, not real applicants. |
| `/companies` | Existing legacy employer/game view, retained for compatibility. |
| `/leaderboard` | Guest/demo view; authenticated users redirect to `/competition`. |
| `/competition` | Authenticated server-scored competition. |

These pages are not duplicates to merge without a product migration.

## Legacy bookmarks

Compatibility pages remain physically present: `/arena/leaderboard` → `/leaderboard`; `/learning-map`, `/journal-entry`, old `/missions/*`, `/detective/*` and `/money-flow/*` → `/campaign`; `/skills` → `/profile`; `/game/bank` → `/game/bank-reconciliation`.

`/arena` and `/academy/account-guide` are rendered pages, not redirects. They remain unchanged. The sitemap lists canonical public destinations only, not noindex account pages or legacy redirects. Its static catalog is `lib/platform/public-routes.ts`.
