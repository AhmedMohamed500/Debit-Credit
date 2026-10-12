# Approved-reference implementation — candidate portfolio and employer search

Date: 2026-10-12. Starting commit: `3baa1852f2b23d07eac4c2306f3b1141058194f5`.
Branch: `codex/reference-implementation`.

This delivery changes the existing presentation and reuses the existing authenticated PostgreSQL-backed talent service. It does not replace Better Auth, Prisma, personal records, accounting rules, evidence, photo storage, public QR sharing, or CV derivation. No production fixtures, database reset, schema migration, paid services, analytics dashboard, jobs engine, or ATS pipeline were introduced.

## Routes

- `/ar/career-profile`, `/en/career-profile`: approved candidate composition, no student sidebar or duplicate journey banner.
- `/ar/employer/candidates`, `/en/employer/candidates`: approved search/results/selected-preview composition.
- Existing protected `/ar/employer/candidates/[id]`, `/en/employer/candidates/[id]` remain the employer-visible full-profile destination, not the owner's private editor.
- Existing `/ar/employer/company`, `/en/employer/company` and `/ar/employer/shortlist`, `/en/employer/shortlist` remain available.
- Owner CV and activated public-share routes remain `/[locale]/career-profile/cv` and `/[locale]/portfolio/[token]`.

## Candidate composition

Thin horizontal navigation; dark office hero with large current-account portrait on the physical left, identity in the center, and the existing activated Career ID/QR on the right. Six visible tabs: Overview, Skills, Practical Work, Courses, Certificates, Career Journey. Private editing, photo/discovery controls, and logout are in the menu. Arabic content uses RTL without swapping the required desktop major-column composition.

Overview has About/Basic Information/Professional Links on the left. The main column has five real metrics, adjacent Career Target/Next Steps, a compact six-skill grid, three practical-work cards, and three certificate tiles. Existing pinned-work order is respected. The first next-action link uses the saved student journey rather than restarting a completed stage. Counts, evidence scores, and profile completeness are real; completeness is explicitly not job readiness. Uploaded courses/certificates remain self-reported. Accounting work remains training simulation, not employment.

The uploaded portrait fills its frame. The existing 512×512 ownership-isolated photo pipeline is unchanged. Public sharing and employer discovery remain separate opt-ins.

## Search/service

Existing router: `app/api/v1/[...path]/route.ts` (unchanged).
Service: `lib/server/talent/service.ts`.

- `GET /api/v1/employer/candidates?q=Ahmed&page=1`
- Filters: `role`, `skill`, `location`, `availability`, `education`, `level`.
- Fixed server page size: 20. Response: `items`, `total`, `page`, `pageSize`.
- `GET /api/v1/employer/candidates/{discoveryId}` for the current consent-filtered preview.
- `GET /api/v1/employer/candidates/{discoveryId}/cv` for separately consented CV blocks.
- Existing `GET /api/v1/me/discovery` and `PUT /api/v1/me/discovery` control discoverability.

Search uses a parameterized PostgreSQL query over opted-in server-derived projections in existing `cloud_progress`. It does not download all users and filter in the browser. Name matching is partial and case-insensitive, trims surrounding query whitespace, and preserves Arabic spelling. Current professional headline is now included in the safe projection and search text, alongside target role. Work type is included; graduation year requires education consent.

Canonical profile, personal-data, photo, portfolio, evidence, and sharing saves refresh the existing projection through the existing transactional derivation path. No disconnected candidate database was added. No per-result profile queries are needed for the results list. Opening a candidate rechecks permission and derives the current preview.

The search button and Enter both submit server requests. Loading/error/empty states remain real. Selection changes are version-gated to prevent stale responses overwriting the next candidate's preview. Recruiter changes clear prior selection/results. Jobs and Analytics are disabled, not implemented or falsely linked.

## Privacy and shortlist

Discovery defaults OFF. Photo, location, education, languages, links, courses, certificate metadata, CV, and contact requests have separate flags. Enabling discovery does not activate the public QR. Safe DTOs omit private email, phone, internal user IDs, auth/session fields, private certificate images, and private revision records.

Opt-out removes the candidate from search, preview, CV access, and visible shortlist entries. Re-enabling rotates the opaque discovery identifier. The existing revision and authenticated-owner checks remain in place.

- `GET /api/v1/employer/shortlist`
- `PUT /api/v1/employer/shortlist` with `{ candidate: discoveryId, action: "add" | "remove" }`

Shortlists use existing persistent company-scoped storage. Adding twice is idempotent. Company A cannot view/change company B's list. No browser-only shortlist or hiring pipeline was added.

## CV

Recruiter preview/export reuses the owner's `CvBlockView`, existing typesetting, and measured `paginateCv` two-page engine. It consumes only server-consented blocks, not the private profile object. English/LTR, single-column, maximum two A4 pages; no photo or QR; simulation is separate from employment. Private account email/phone are not exposed. Export uses the browser's Print/Save PDF workflow, not a second CV format or external export service.

## Verification

Final measured results and screenshots are recorded by the local QA harnesses:

- `npm run check`: ESLint with zero warnings, TypeScript, 638 tests across 75 files, and optimized Next.js build.
- `npm run build`: optimized production route table includes both localized portfolio and employer candidate route families.
- `node scripts/talent-platform-qa.mjs`: **219 checks passed**. Authenticated candidate/recruiter accounts, isolated local UTF-8 PostgreSQL, full/partial/case/whitespace/Arabic names, unknown-name empty state, all supported filters, real pagination, live updates, distinct photos, shortlist isolation, opt-out, safe CV export, desktop/mobile/RTL screenshots. Added geometry checks for a readable mobile candidate-name column and non-overlapping skill icons/scores in both directions.
- `node scripts/student-cv-browser-qa.mjs`: 672 regression checks for onboarding, personal records, photo ownership/cropping, game tasks, accepted evidence, QR revocation/sharing, course/certificate CRUD and private images, CV synchronization, real one/two-page PDF exports, logout and cross-account isolation.

QA writes only to isolated localhost databases with generated test identities. Candidate A and B use distinct solid-color uploaded fixture photos for byte-level isolation assertions; these are intentional test photos, not missing production portraits. Pagination-only fixtures are local and are not production seed data. Arabic coverage uses a legacy canonical Arabic record plus the normal save/derivation path; the existing English-only policy for newly entered CV data was not weakened.

## Screenshots

Local directory: `artifacts/reference-implementation/` (ignored by Git, does not publish test data).

- `candidate-ar-1920.png`
- `candidate-ar-1440.png`
- `candidate-en-1440.png`
- `employer-ar-1920.png`
- `employer-ar-1440.png`
- `employer-en-1440.png`
- `candidate-mobile-390.png`
- `employer-mobile-390.png`
- `employer-search-name-result.png`
- `employer-search-selected-candidate.png`
- `employer-search-empty-state.png`

Desktop targets: 1920×1080 and 1440×900; mobile: 390×844, with additional 1024px/320px regression coverage. Screenshots are full-page captures at those viewport sizes. The employer mobile preview replaces the list rather than squeezing both columns together.

## Exact changed-file manifest

1. `app/reference-implementation.css`
2. `components/career/candidate-portfolio.tsx`
3. `components/career/compact-cv-view.tsx`
4. `components/career/discovery-settings.tsx`
5. `components/career/member-profile.tsx`
6. `components/career/shared-cv-view.tsx`
7. `components/cloud/session-boundary.tsx`
8. `components/employer/talent-search.tsx`
9. `lib/server/talent/service.ts`
10. `lib/talent/model.ts`
11. `scripts/career-showcase-qa.mjs`
12. `scripts/member-profile-qa.mjs`
13. `scripts/talent-platform-qa.mjs`
14. `tests/member-profile-ui.test.tsx`
15. `tests/reference-talent-ui.test.tsx`
16. `tests/talent-platform.test.ts`
17. `docs/REFERENCE-IMPLEMENTATION.md`

## Reference differences and release boundary

The screenshot's example people, counts, fake match percentages, stock cutout portrait, and background are not production data/assets. Real account counts and supported-skill badges occupy the same UI positions instead of inventing 78% matching. Certificates are labeled self-reported. Private/off fields are omitted, and QR appears only with an activated real share token. Real uploaded photos retain their rectangular crop rather than substituting the reference person or silently removing the user's background. The existing office asset is reused under the navy overlay because the reference's original editable stock assets were not supplied. Mobile sections reflow to fit the phone. These differences do not add or rearrange desktop sections.

This branch is a local implementation delivery. This request did not authorize a new production deployment; no new push, merge, Vercel deployment, or production database changes are implied by this report. Unrelated pre-existing untracked files are left untouched.
