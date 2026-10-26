# Routes and compatibility

Use resolved `ar` or `en` in URLs, never the filesystem placeholder `[locale]`.

## Primary journey

`/{locale}` → `/{locale}/signup?next=<safe internal destination>` → `/{locale}/login?next=<same destination>&registered=1` → `/{locale}/auth/continue` → first-time `/{locale}/student-profile` → requested destination. For signed-in students `/{locale}` is My Learning Journey: personal setup → Excel Foundations → Student Unit → First Shift, followed by a separate review of saved career outputs. `/student` remains a compatibility entry to the Student Unit and does not replace the learning home.

Signup does not start a session. Login preserves a safe internal destination; otherwise it returns home. Auth traffic goes directly to `/api/auth/[...all]`, without a locale prefix. `/api/auth/callback/google` is the callback handler but Google is unavailable until credentials are configured.

## Similar names, different responsibilities

| Path (under `/ar` or `/en`) | Responsibility |
| --- | --- |
| `/profile` | Legacy game/player identity retained for compatibility; it is no longer a primary navigation destination. |
| `/account` | Authenticated cloud account, privacy and learning-ranking participation settings. |
| `/student-profile` | Required private CV contact/education setup; session email is authoritative. |
| `/student` | Compatibility entry to the direct Student Unit workbench; existing saved progress is retained. |
| `/game/student` | Canonical Student Unit accounting workbench; server-graded source documents, journal, ledger, trial balance and spreadsheet tasks. |
| `/auth/continue` | Safe post-auth redirect gate: validated personal CV details before the requested destination. |
| `/career` | Career hub and readiness. |
| `/career-profile` | Signed-in profile for every persona: Profile, Courses, Progress and Certifications tabs; private certificate images, links to evidence and English CV; noindex. Guest view remains compatible. |
| `/career-profile/cv` | Current English account CV with courses, certificate metadata and supported simulation outcomes; compact single column, at most two measured A4 pages. No photo or QR. |
| `/portfolio/<token>` | Real owner-selected public professional profile: explicit enable/revoke, opaque token, optional name/socials/availability/accepted-work summary and up to three selected simulations. No private contacts, photos or credentials; no-store/noindex. |
| `/employers` | Current employer demo entry. Candidates are demo data, not real applicants. |
| `/companies` | Existing legacy employer/game view, retained for compatibility. |
| `/leaderboard` | Legacy bookmark redirected to `/competition`; the seeded local leaderboard UI was removed. |
| `/competition` | Authenticated server-scored competition. |
| `/accounting-arena` | Legacy bookmark redirected to `/account#learning-competition`; no standalone arena UI remains. |

These pages are not duplicates to merge without a product migration.

The private `GET /api/v1/me/cv?role=<role-id>` derives current account data; GET does not create CV history. Professional card downloads remain in the existing profile, not a fabricated card route. QR uses the explicitly enabled `/portfolio/<token>` link and its existing field selection.

## Legacy bookmarks

Compatibility pages remain physically present: `/arena/leaderboard` and `/leaderboard` → `/competition`; `/accounting-arena` → `/account#learning-competition`; `/learning-map`, `/journal-entry`, old `/missions/*`, `/detective/*` and `/money-flow/*` → `/campaign`; `/skills` → `/career-profile/skills`; `/missions/progress` → `/career-profile`; `/game/bank` → `/game/bank-reconciliation`.

`/arena` and `/academy/account-guide` are rendered pages, not redirects. They remain unchanged. The sitemap lists canonical public destinations only, not noindex account pages or legacy redirects. Its static catalog is `lib/platform/public-routes.ts`.
