# Current project status

Reviewed: 2026-10-23. This file supersedes historical release claims in archived reports.

## Product consolidation (2026-10-23)

The signed-in student now has one primary sequence: private personal details → five server-backed Excel Foundations stages → the 11-task foundations desk → First Shift and ledger review → Skill Passport → factual English CV. The guided home derives one next action from accepted progress and shows only the learner's own concise learning-rank summary. Public learning ranking remains opt-in and its display name/consent are managed in Account Settings.

The standalone Accounting Arena and seeded local leaderboard interfaces were retired. `/accounting-arena` now redirects to the preserved participation settings and `/leaderboard` plus `/arena/leaderboard` redirect to the authenticated server competition. Accepted Excel outcomes, opt-in fields, cloud matches, Prisma models and production records were not deleted. Game Hub no longer promotes duplicate employer-preview or local-league cards, and unfinished company zones are not primary navigation.

## Product scope and cleanup audit (2026-10-17)

The product's connected core is: bilingual entry and pricing → separate email signup/login and private personal setup → guided accounting practice and server-accepted evidence → skills and career profile → factual English CV and consent-based professional sharing. Employer discovery is consent-gated; training simulations are not employment or professional certification. The detailed Arabic product map and remaining-work list are in [the complete project reference](PROJECT-COMPLETE-REFERENCE-AR-2026-10-14.md), and route ownership is in [routes](ROUTES.md).

The public Pricing page describes plans but paid subscriptions are not active. Google sign-in and email-based verification/reset require configured providers. Full employer jobs/applications, further independently reviewed accounting cases, and broad cloud sync beyond supported domains are future product work, not hidden features to expose. Do not present any of these as complete or add fabricated user achievements.

Disk review found the major local consumers to be generated dependencies/builds/caches and ignored browser/backend QA artifacts, not route source files. Removed the regenerable `.npm-cache-backend/` (~903 MB) and the unreferenced superseded `public/game/accounting-manual-office.png` (~1.6 MB); the active `accounting-manual-office-v2.png` remains. Kept `node_modules`, active build output, historical QA captures, test PostgreSQL data, and compatibility routes. Deleting old routes or test databases would offer little source-space benefit or risk data/progress loss. The removed image is recoverable from Git; the cache is recreated when backend tests need it.

Local validation after cleanup: ESLint, TypeScript, 695 Vitest tests across 82 files, and Next.js production build passed. This is not a claim of a deployed release or a full browser journey test. The developer machine's `npm` launcher points to a missing Roaming copy; validation succeeded by invoking the installed npm CLI directly with Node.

## Production and boundaries

- Primary site: https://debit-credit-nine.vercel.app/ar (English: `/en`).
- Existing production email authentication is connected to production PostgreSQL. Preserve its users and migrations.
- Isolated Neon and local embedded test databases are not production and must not replace it.
- Guest learning remains browser-local. Supported authenticated domains use the backend; unsupported domains are not silently cloud-synced.
- Google credentials are not configured; Google login stays unavailable. Email verification/password-reset delivery is not claimed without an email provider.
- Render account connection was confirmed, but service creation returned HTTP 402 requiring a payment method. No Render service was created and no production secrets were transferred.
- Prior connection timeouts were reachability failures, not proof of a missing route or failed database.

## Current release work

The professional card now combines the saved account photo, name, role, social links and consent-enabled QR in a downloadable 1600×1100 PNG. The English ATS CV reads live account profile/course/certificate data, preserves existing simulation evidence, synchronizes professional contact links, and curates at most two measured A4 pages with visible omission notices rather than shrinking text. Course English display names are optional; uploads are self-reported, not assessed skills. See [card and CV synchronization](PROFILE-CARD-CV-SYNC-AR.md) for scope and verification; publication must be confirmed separately from the local build.

The career profile now includes private social preferences, up to three pinned server-accepted training workpapers, an automatic task-based capability summary, English PNG achievement cards, self-reported internship/work availability and an explicitly enabled, field-selected professional profile link with local QR generation and revocation. Contact details, photos, certificates and private courses remain excluded from shared HTML/RSC. The initial artifacts cover the server-graded introductory unit, not unverified local gameplay or claimed employment. See [showcase delivery](CAREER-SHOWCASE-AR.md) for verified release results and limitations.

First Shift now has a single professional briefing and one explicit desk action instead of a giant poster, duplicate journey panel and repeated start/manager gates. A shared in-game header connects foundations, profile, skill evidence and the English CV; language switching stays in the same mission. Existing city art, cases, drafts, posting safeguards and ledger-review prerequisites are preserved. See [First Shift navigation redesign](CONNECTED-FIRST-SHIFT-AR.md).

The signed-in career profile now has the reference-style petrol/teal/gold dashboard for all four personas, private external-course CRUD and certificate image upload/view/removal. Images preserve document aspect ratio, are re-encoded without location metadata, and are excluded from progress backups, public previews, competitions and ATS CVs. Uploaded credentials remain self-reported, not verified skill evidence. See [member profile delivery](MEMBER-PROFILE-AR.md).

Signup → separate login → required private CV personal setup → localized student home is implemented. Returning users with a validated record skip setup. The introductory student unit has 11 server-graded tasks, cloud-owned evidence and automatically regenerated private CV snapshots, plus browser-local CV versions and text/PDF-print exports. See [student CV release](STUDENT-CV-RELEASE-AR.md) for scope and verified publication results.

The signed-in home now uses the existing Game Hub. Student training is in the game city at `/ar/game/student` or `/en/game/student`; `/student` remains compatible with saved progress. CV documents use English and LTR independently of the website language. Optional profile photos are center-cropped to 512×512, privately stored after metadata stripping, and excluded from ATS CVs and competitions. See [English CV, photos and game integration](STUDENT-GAME-PHOTO-CV-AR.md).

Historical reports retain their original conclusions. [Documentation index](README.md) identifies current guides; [routes](ROUTES.md) explains separate profile/account/employer experiences.

The latest student navigation uses one guided home: personal details → Excel Foundations → foundations desk → First Shift (including real ledger review) → skills → English CV. Saved account progress chooses the next step; optional tools remain available without competing start prompts. Existing guest and advanced-persona interfaces are retained. Career-profile photos now fill the entire avatar frame. See [connected journey](CONNECTED-STUDENT-JOURNEY-AR.md), the [cleanup report](PRODUCT_CLEANUP_AND_CONSOLIDATION_2026-10-22.md), and the [comprehensive Arabic project record](PROJECT-MASTER-HANDOFF-AR.md).
