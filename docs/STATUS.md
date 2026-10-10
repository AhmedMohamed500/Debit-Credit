# Current project status

Reviewed: 2026-10-10. This file supersedes historical release claims in archived reports.

## Production and boundaries

- Primary site: https://debit-credit-nine.vercel.app/ar (English: `/en`).
- Existing production email authentication is connected to production PostgreSQL. Preserve its users and migrations.
- Isolated Neon and local embedded test databases are not production and must not replace it.
- Guest learning remains browser-local. Supported authenticated domains use the backend; unsupported domains are not silently cloud-synced.
- Google credentials are not configured; Google login stays unavailable. Email verification/password-reset delivery is not claimed without an email provider.
- Render account connection was confirmed, but service creation returned HTTP 402 requiring a payment method. No Render service was created and no production secrets were transferred.
- Prior connection timeouts were reachability failures, not proof of a missing route or failed database.

## Current release work

Signup → separate login → required private CV personal setup → localized student home is implemented. Returning users with a validated record skip setup. The introductory student unit has 11 server-graded tasks, cloud-owned evidence and automatically regenerated private CV snapshots, plus browser-local CV versions and text/PDF-print exports. See [student CV release](STUDENT-CV-RELEASE-AR.md) for scope and verified publication results.

The signed-in home now uses the existing Game Hub. Student training is in the game city at `/ar/game/student` or `/en/game/student`; `/student` remains compatible with saved progress. CV documents use English and LTR independently of the website language. Optional profile photos are center-cropped to 512×512, privately stored after metadata stripping, and excluded from ATS CVs and competitions. See [English CV, photos and game integration](STUDENT-GAME-PHOTO-CV-AR.md).

Historical reports retain their original conclusions. [Documentation index](README.md) identifies current guides; [routes](ROUTES.md) explains separate profile/account/employer experiences.
