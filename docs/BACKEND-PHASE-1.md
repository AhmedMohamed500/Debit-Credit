# Backend Phase 1

Implementation date: 2026-10-07 (Africa/Cairo). Starting branch: `codex/career-league`; starting commit: `684efc11a1aecc11dbf316aa00f80cb72e5cc573`.

This phase is a backend foundation over the existing product, not a curriculum rewrite. Production Neon, Google OAuth, Resend and backend secrets are not configured by this work. Local PostgreSQL testing is not proof of live-provider operation. No paid services, production seeds, payments, certificates or Verified professional certification are added.

## 1. Final architecture

The existing Next.js App Router application is a modular monolith. `app/api/auth/[...all]` delegates authentication to Better Auth. `app/api/v1/[...path]` is a thin HTTP dispatcher; server-only services under `lib/server/` own authorization, validation, transactions and database access. React clients use `lib/cloud/runtime.ts` and existing repository adapters, not Prisma queries. Accounting engines remain shared pure functions; the bank, foundations and competition services reuse them.

Domains: auth, users, profiles, progress, migration, cases, competition, admin, security and db. Activity and evidence currently live within progress/case services rather than empty wrapper modules. Database table names and API paths are neutral and do not depend on the future public brand. `PUBLIC_APP_NAME` is reserved configuration; this phase does not rename the established visual brand.

## 2. Database design

PostgreSQL with Prisma 7.10 and generated stable UUIDs. Models:

- Auth: User, Account, Session, Verification, RateLimit.
- Profile/activity: PlayerProfile, UserPreference, UserActivity.
- Sync: CloudProgress, ProgressSnapshot, LegacyImport.
- Career: CareerGoal, CareerProfileCloud, SkillEvidenceCloud, CvVersionCloud.
- Work: MissionAttempt, CaseAttempt, CaseEvent, AcceptedOutcome.
- Competition: CompetitionPlayer, CompetitionQueue, CompetitionMatch, CompetitionMatchPlayer, CompetitionAttempt.
- Security: AuditLog.

Ownership uses User.id, never email. Child records cascade on user deletion; audit ownership and match winners use SetNull where appropriate. Match/attempt/active-match references have foreign keys. Domain revisions prevent blind overwrites. Unique constraints cover auth identities/session tokens, user/domain, user/import-version/checksum, user/command, accepted outcomes, match membership and official attempts. A PostgreSQL partial unique index permits only one WAITING queue row per user. FIFO/version, createdAt, lastActiveAt and ownership indexes support bounded queries.

Three additive migrations:

1. `202610070001_backend_foundation` — tables, indexes and the waiting-queue partial unique index.
2. `202610070002_match_references` — active-match, winner and official-attempt foreign keys.
3. `202610070003_command_and_queue_versions` — bank command idempotency and scoring-version queue compatibility.

Run `npm run db:generate`, then `npm run db:migrate`. Never run migrate reset on production. ProgressSnapshot, UserPreference, CareerProfileCloud and CvVersionCloud are reserved relational extension points; they are not falsely advertised as completed history/snapshot APIs. Current profile/CV adapters use private CloudProgress backups.

## 3. Why Next.js, not a separate NestJS server

A separate server would introduce another deployment, operational surface and potentially paid host. Route Handlers plus server-only domain services support this phase within the existing runtime. No NestJS, Redis, Kubernetes or microservices are introduced. This does not imply the monolith is unlimited in scale.

## 4. Better Auth setup

Better Auth 1.7.7 uses its official Prisma adapter and PostgreSQL-backed sessions. Auth is initialized lazily, so a build without production credentials does not contact a database. Database-backed auth rate limits work across instances. `.npmrc` uses legacy-peer-deps because optional Svelte-related peer dependencies conflict with this project's existing test toolchain; the app does not use Svelte. The lockfile is committed for reproducibility.

Session duration is seven days, refresh interval one day. Cookies are HttpOnly, SameSite=Lax and Secure for HTTPS; production configuration requires HTTPS except loopback tests. Cookie caching of sessions is disabled. Better Auth owns password hashing, CSRF/origin checks and OAuth state/PKCE behavior; no custom cryptography or localStorage tokens are added. Social account linking is disabled to prevent an unverified claimed credential email being linked to the owner's Google identity.

## 5. Email/password authentication

`/[locale]/signup` accepts name, email, password and confirmation; password length is 12–128. `/[locale]/login` supports existing credentials without Google. Signup rejects public role or ownership fields. Database hooks bootstrap a canonical profile and activity row. Unverified users may learn, but an unverified email cannot gain ADMIN through ADMIN_EMAILS.

Landing start/persona CTAs route logged-out visitors through signup with a validated internal next path. Logged-in visitors proceed to the intended route. Safe-next validation rejects absolute/protocol-relative URLs, encoded backslashes/control characters, traversal outside locale routes and auth loops. Public guides and ordinary browsing remain public. Guest local learning is linked from the auth screen.

## 6. Google OAuth

Integration is implemented, but credentials and live sign-in remain pending. Missing both Google variables hides the button; incomplete configuration is rejected safely. Configure a Google Cloud OAuth Web Application with its consent screen/audience and permitted test users as needed. Privately configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Exact callback path: `/api/auth/callback/google`.

- Local owner development: `http://localhost:3000/api/auth/callback/google`.
- Existing production domain: `https://debit-credit-nine.vercel.app/api/auth/callback/google`.

The isolated integration server uses port 3110 and does not test Google. A different local port/domain requires its exact corresponding callback and BETTER_AUTH_URL. Do not silently enable insecure account linking to work around duplicate-email login: use the original sign-in method until a secure linking workflow is implemented.

## 7. Neon setup

First external owner step, after local implementation/QA: create one Neon project on Free, without billing or an upgrade. Choose a nearby region and PostgreSQL. Copy the pooled connection URL privately into `.env.local` as DATABASE_URL; copy the direct URL as DIRECT_URL for migrations. Do not paste either URL in chat. Tell the agent only “Configured”. Verify the current plan still suits the zero-cost requirement; stop if billing, paid overages or a mandatory paid plan is required.

Runtime uses the official PrismaNeon adapter, a lazy shared PrismaClient and a bounded pool (max 5). DIRECT_URL is used only by Prisma migration configuration. The official pg adapter is for the isolated localhost test harness (`DATABASE_DRIVER=postgres`), not an undocumented Neon HTTP fallback.

## 8. Optional Resend setup

Resend is optional. Without RESEND_API_KEY and EMAIL_FROM, verification/reset delivery is disabled, reset requests return HTTP 503 / EMAIL_UNAVAILABLE and the UI hides forgot-password/verification actions. Builds and normal email/password learning still work. With a verified sender and a usable Free plan, the adapter awaits the provider's successful response and rejects failure; it never pretends mail was delivered. A reset request is described as accepted, not as guaranteed inbox delivery. Do not use a personal Gmail password.

## 9. Environment variables

`.env.example` contains placeholders only. Required cloud configuration: DATABASE_URL, DIRECT_URL (migration path), BETTER_AUTH_SECRET and BETTER_AUTH_URL. Optional: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET, RESEND_API_KEY/EMAIL_FROM, ADMIN_EMAILS, PUBLIC_APP_NAME. DATABASE_DRIVER defaults to Neon. APP_BUILD_DIR is an internal test isolation option.

Generate a new 32-byte random secret privately on the owner's machine, for example `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`, and place it directly in `.env.local`. Never send the value to chat. Use stable separate secrets and databases for local/preview/production. Do not rotate an existing live secret merely to run tests. `.env`, `.env.local` and other .env variants are ignored except `.env.example`; generated Prisma output, local PostgreSQL data, npm cache and browser temporary profiles are ignored.

## 10. Admin role security

Roles are USER and ADMIN. ADMIN_EMAILS is private server configuration, never a public role picker. The authenticated session user must have a verified email matching the allowlist before server-side promotion, with an audit record. Claiming the email at credential signup is insufficient. A Google identity or configured verification delivery can establish verification; local tests use an explicitly isolated verified-email fixture and do not claim a live verification test.

requireUser/requireAdmin enforce roles on APIs and server pages. Client IDs, role, verified, score and winner fields cannot override them. X-Account-Context is only a stale-tab mismatch guard: ownership still comes exclusively from the session. Admin role removal is an explicit operational action; removing an address from the promotion allowlist is not a complete role-revocation workflow.

## 11. Admin dashboard

`/[locale]/admin` is server protected and noindex. Normal users redirect safely; private admin APIs return 403. Metrics are real database counts: total, registered today UTC, last seven days, active 24h, last two minutes, provider counts, unexpired waiting rows, playing and completed matches. Activity means a recent heartbeat, not WebSocket presence. User search by name/email, provider/persona/activity filters and cursor pagination run server-side (20 default, 50 maximum). Recent competition queries are bounded to 50; emails remain confined to authenticated owner/self views.

## 12. Cloud profile

Every account has a canonical profile with display name, safe handle, built-in avatar color, locale, persona, target role and timestamps. Arbitrary remote avatar uploads are not added. Profile saves use updatedAt optimistic concurrency; competing changes/duplicate handles return conflict. Self-reported persona/target selection is context, never professional evidence. Existing Career Entry is reused; server acknowledgement precedes navigation.

## 13. Cross-device restore

The localized cloud boundary obtains session identity and supported progress before private learning components read their repositories. Authenticated supported data restores from PostgreSQL; localStorage is a working cache, not the identity or official-result authority. Guest mode uses the existing browser repositories. The guest snapshot is durably backed up before replacing its active working copy and restored on sign-out.

Account-scoped backup outboxes preserve unsynced drafts and their original revision. They never rebase automatically onto a newer cloud revision. Requests serialize per backup domain; stale responses cannot write another account's outbox. A session-context mismatch is rejected by the server. Canonical bank results override unvalidated workpaper backups. Foundation input drafts are preserved on same-account reload without converting cached completions into server outcomes. Server confirmation, pending, unsynced and conflict states are distinguished in the UI.

## 14. Legacy migration

Meaningful local data is detected through existing foundations, career, profile and evidence repositories plus game state. A bilingual dialog offers Merge, Keep cloud and a review of detected domains. Nothing uploads automatically. Original guest data is preserved even when the owner chooses cloud. Imports use version 1, a device UUID and canonical sorted-key SHA-256 checksum; user/version/checksum uniqueness makes replay idempotent. Bounded JSON validation rejects corrupt/dangerous/oversized payloads; requests are capped at 512 KiB for imports.

Recognized keys preserve the old storage names. Foundations are merged with existing migration/validation rules. Other recognized legacy domains are private tagged backups created only if cloud has no corresponding backup. Legacy evidence receives LEGACY_LOCAL_IMPORT. No imported competition scores or accepted ledger outcomes become official server records.

## 15. Merge and conflict rules

| Domain | Policy |
| --- | --- |
| Foundations learning | Union valid historical steps/completions using existing migrations; attempt counts follow domain maximum; imported completion does not create server AcceptedOutcome proof. |
| New foundation actions | Immutable user/command records, server recomputation, CAS domain revision; same command cannot change its payload. |
| Bank work | Reconstruct from actions with the existing engine; one accepted outcome per scenario/user; immutable commands; separate canonical result. |
| Profile / Career Entry | Latest explicit choice only with the correct current revision; conflict is not silently overwritten. |
| World, placement, career/CV preference backups | Revision-controlled private backup; not server-validated accounting/evidence. |
| Legacy backups | Create-only if absent; preserve cloud if already present. |
| Evidence | Server trust/provenance dominates; no automatic Verified upgrade. |
| Competition | Server-only scoring, immutable unique official attempt; local results are never imported as official. |

There is no universal last-write-wins. On conflict, recover the account-scoped draft and review against fresh cloud state before explicitly resolving it; automatic destructive force-sync is deliberately absent.

## 16. Evidence trust rules

Foundations are learning practice, not professional competence. Bank evidence is a server-validated simulation and remains Practiced. Legacy practice remains practice; legitimate historical Demonstrated status is tagged as legacy and never promoted to Verified. Fabricated verified_server fields are downgraded on import. Personas, XP and competition points do not award professional readiness. Existing skill projections and accounting correctness remain unchanged. New local First Shift evidence is not yet a server-authoritative evidence ingestion flow.

## 17. Competition matchmaking

`/[locale]/competition` is authenticated. The lobby, queue, matches and weekly leaderboard use real registered accounts, with no seeded online users. Server selection uses UTC daily challenge content and server-earned eligibility, not browser XP/persona claims. Foundations completion imported from local state alone cannot unlock a higher official league.

Matchmaking uses SERIALIZABLE transactions, bounded retries and PostgreSQL transaction advisory locks. It selects the oldest compatible waiting user with matching league/challenge/challenge-version/scoring-version, never self. A user has at most one active match or waiting row. Waiting expires after 15 minutes and is filtered out of displays; cleanup occurs on matchmaking. Match results use stored inspections and approved domain scoring, not client scores, attempt counts or winners. Both sides are sealed until completion, including leaderboard aggregation. Unique official attempts cover user/challenge/version/scoring-version. Replays are practice-only with no extra official points. Ties are supported. Weekly standings derive only from completed matches and start Monday UTC.

The foundation league is official account-based game competition, not verified professional assessment. Higher-league breadth and unattended-match cancellation/forfeit policies are future work; an abandoned playing match is not mislabeled as live presence.

## 18. Polling strategy

Only the competition component polls, every 20 seconds, while visible; it stops on unmount and skips hidden pages. Authenticated activity sends an approximately 60-second visible-page heartbeat; the server throttles writes to at least 45 seconds. Active-now is the last two minutes. There is no paid realtime provider or Redis. HTTP service boundaries permit a later transport replacement without changing scoring rules.

## 19. Privacy and security

Private APIs use session ownership, no-store responses, strict schemas, bounded bodies, same-origin mutation checks and database rate limits. Errors are sanitized and never return SQL stacks. Public competitor identity includes name, handle and built-in avatar, not email or answers. Auth credentials never enter localStorage. Device caches/outboxes can contain private user-authored profile drafts; sharing a browser/OS account has privacy implications. There is not yet a public account deletion/export UI; internal cleanup logic is not exposed without authorization.

## 20. SEO considerations

Landing content, guide/manual/learning resources and legal routes stay public. Auth/reset/admin/account/competition/private career profiles are noindex; private APIs are not search documents. Authentication is not placed around every public page. Public content continues to server render even when cloud identity is loading or external services are absent. Safe auth redirects do not create public arbitrary-URL redirection endpoints.

## 21. Future AdSense considerations

No AdSense is implemented. Before monetization, review hosting terms, provider quotas, privacy/consent, public content quality and the separation between public learning resources and private account routes. Vercel Hobby is for personal non-commercial use; free hosting is current-stage infrastructure, not an assertion that a future commercial product can remain on Hobby. [Vercel Hobby terms](https://vercel.com/docs/plans/hobby).

## 22. Free-tier dependencies

Next.js runtime on the existing host, PostgreSQL (Neon Free preferred), open-source Prisma/Better Auth, Google OAuth configuration and optional Resend Free. No provider accounts or paid plans are created by this implementation. No commercial API keys are committed. Official setup references: [Better Auth Next.js](https://www.better-auth.com/docs/integrations/next), [Prisma adapter](https://www.better-auth.com/docs/adapters/prisma), [Google provider](https://www.better-auth.com/docs/authentication/google), [Prisma Neon](https://www.prisma.io/docs/orm/overview/databases/neon).

## 23. Free-tier limitations

Verify live plan terms again at setup. Neon's 2026-10-02 announcement lists 1 GB storage and 100 CU-hours per project/month with scale-to-zero and a six-hour instant restore window; cold starts and quota ceilings are real constraints. [Neon Free announcement](https://neon.com/blog/neon-free-plan-1-gb-per-project). Resend Free currently lists 3,000 transactional emails/month and 100/day; sender/domain verification is required for general delivery. [Resend pricing](https://resend.com/pricing). These are limits, not capacity guarantees. Never accept automatic billing to bypass them. Polling, activity, auth rate-limit rows and immutable attempts need measured load/retention planning as usage grows.

## 24. What remains local

Guest learning; local multi-profile competition/demo; historical academy/arena/detective subsystems; unsupported profile-scoped domains; ATS PDF generation; CV version history; future curriculum/company phases. First Shift work remains client-calculated but its world state has a private backup adapter. A restored backup is not server-approved accounting. Not all old modules emit cloud writes; no blanket full-cloud claim is made. Authenticated leaderboard entry goes to online competition, preserving the old local multi-profile implementation for guests without mixing local competitor profiles into an account cache.

## 25. What is cloud-backed now

Canonical auth/session identity and player profile; explicit Career Entry; new Foundations commands/progress and idempotent learning outcomes; bank server reconstruction/accepted outcome/simulation evidence; legacy import records/tagged evidence; private world/placement/career-profile/CV-preference backup adapters; heartbeat/admin metrics; real-user queue/matches/official attempts/weekly standings. Supported state can restore in a clean browser. Cloud-backed code and local verification do not imply production services are configured.

API inventory (all under `/api/v1`, authenticated): GET me; GET/PUT me/profile; POST me/activity; GET/POST/PUT me/progress; PUT me/career-entry; POST me/bank; POST migration/legacy; GET competition/lobby; POST competition/matchmake; GET competition/matches/:id; POST competition/matches/:id/submit; GET competition/leaderboard; GET admin/overview/users/competition (ADMIN). Auth endpoints remain `/api/auth/*`.

## 26. Future NestJS extraction path

Keep domain engines transport-neutral. Move server services/repositories and auth/session verification behind a dedicated service only when deployment budget and measured load justify it; preserve API contracts, error shapes, revision/idempotency rules and shared scoring versions. Separate database adapters from domain services first. Do not migrate to a new framework merely to replace working accounting logic.

## 27. Deployment checklist

1. Run all original/new tests and `npm run check`; generate Prisma before build. Run isolated API/browser QA through `npm run dev:backend-test`, then the QA scripts. Test fixtures must never target Neon or production.
2. Owner creates/configures Neon Free privately. Generate the auth secret privately, set local URL and optional owner allowlist. Apply additive migrations with `npm run db:migrate`; never reset.
3. Verify actual Neon connectivity, signup/signin, cross-browser persistence and two-account isolation. Set up Google as a separate next step; test real consent/callback. Configure Resend only if desired, then test actual delivery. Missing optional adapters must remain disabled.
4. Privately add production env names in Vercel; use production HTTPS BETTER_AUTH_URL. Keep preview environments isolated. Review the current free plan and monetization terms.
5. Deploy only when explicitly requested and code/local/live integration gates are ready. Recheck cookie security, CSRF, admin verification, search privacy and two-account competition on the deployed domain. No production deploy is performed by this phase before configuration.

## 28. Rollback strategy

Retain the previous Vercel deployment and Git release reference. Prefer rolling back application code while preserving newly created PostgreSQL data; the three migrations are additive. Never drop/reset production tables to roll back UI. Suspend cloud writes with a clear maintenance notice if schema compatibility is uncertain. Removing env configuration falls back to guest mode and restored guest state, not deletion of cloud accounts. Take a provider-supported backup/branch before future schema changes and verify free-plan retention limits; no paid backup promise is made.

## 29. Known limitations and validation status

Dependency audit: runtime dependencies reported zero vulnerabilities. Full audit reports 12 development-tool findings (1 moderate, 9 high, 2 critical), involving Vitest/tinypool, Prisma CLI transitive tooling and ESLint glob tooling. Non-breaking fixes were applied; forced major toolchain upgrades/downgrades were not applied blindly. Do not expose development/test servers or run untrusted test/config inputs. A deliberate development-toolchain security update remains outstanding; the runtime result does not imply all development dependencies are clean.

Live Neon, Google, Resend and Vercel backend activation remain owner-action boundaries. Optional email verification/reset is disabled until delivery is configured. Built-in avatars only; no upload/storage service. Backup domains are not authoritative proof, CV/history/snapshot reserved models are not fully wired, and new First Shift evidence remains local. Imported completed lessons are not independent server-earned league proof. There is no WebSocket presence, permanent abandoned-match cancellation policy, full account management UI or complete offline authoritative-command replay. Retention/background maintenance and high-load benchmarks are future work.

Final local gates: `npm run check` passed lint, typecheck, all 423 tests (404 original + 19 new) in 56 files, and the production build. Isolated PostgreSQL API QA passed 72 checks; browser QA passed 50 checks in both languages at 1920x1080, 1440x900 and 390x844. A separate empty PostgreSQL database was constructed using all three migrations and its foreign keys/unique indexes checked without seed users. A prior concurrent run hit an existing UI test's timeout; the final isolated regression run passed without changing or removing that test.

The delivery report and exact file/commit inventory are in [BACKEND-PHASE-1-DELIVERY.md](BACKEND-PHASE-1-DELIVERY.md). Do not infer live-provider success from fixture tests. All existing accounting tests and the 197-account / 19-skill / 12-role catalog boundaries are preserved.
