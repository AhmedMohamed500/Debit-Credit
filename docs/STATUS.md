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

Signup → separate login → localized home is implemented and locally verified. Production publication must be confirmed by the release record in [organization report](PROJECT-ORGANIZATION-AR.md), not inferred from a successful local build.

Historical reports retain their original conclusions. [Documentation index](README.md) identifies current guides; [routes](ROUTES.md) explains separate profile/account/employer experiences.
