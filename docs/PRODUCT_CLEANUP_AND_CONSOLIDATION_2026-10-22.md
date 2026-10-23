# Product cleanup and consolidation — 2026-10-23

This is the implementation record for the requested product cleanup. Historical documents describe earlier releases and must not be read as the current route contract.

## Git and delivery

| Item | Value |
| --- | --- |
| Starting Git SHA | `0b00455abf2b59a5be91459c41cb52aee5ad96d4` |
| Working branch | `codex/debit-credit-product-cleanup` |
| Final Git SHA | Pending final commit |
| Pull request | Pending push |
| Production deployment | Pending successful checks and merge |

## Audit classification

| Area | Classification | Decision |
| --- | --- | --- |
| Student Unit, First Shift, journal, ledger, trial balance, bank reconciliation | KEEP | Authoritative training/accounting behavior preserved. |
| Excel Foundations | IMPROVE | Preserved the approved UI and workbook behavior; inserted its five accepted stages into the canonical student journey and added a compact completion result. |
| Standalone Accounting Arena | REMOVE + REDIRECT | Removed the independent UI/component/CSS. The old URL redirects to learning-competition settings in Account Settings. |
| Seeded Local Career League UI | REMOVE + REDIRECT | Removed the fake/seeded leaderboard surface and local public comparison repository. Old leaderboard URLs redirect to server competition. |
| Cloud Competition | KEEP | Server-owned lobby, matches, scoring, records and API remain the optional Professional Challenges surface. |
| Excel learning ranking | MERGE | Server-accepted results and ranking remain; opt-in/name moved to Account Settings and own progress/rank appears compactly in the student journey. |
| Game Hub | IMPROVE | Kept next mission, company, cases, progress, skills and accounting tools. Removed Employer Preview demo, local league card and unfinished zones from primary display. |
| Academy and Bootcamp | KEEP + CONSOLIDATE ENTRY | Unique resources and all Bootcamp/Student Unit work remain; the student journey is the primary entry rather than parallel start CTAs. |
| `/profile` | PRESERVE FOR COMPATIBILITY | Game identity/data remains available to old bookmarks; primary navigation now uses Career Profile and Account Settings. |
| Career Hub / Career Map / Gap | MERGE ENTRY + PRESERVE SPECIALISTS | Career Hub is the main career destination. Gap analysis and existing specialized deep links remain without being duplicated in primary navigation. |
| Planned/locked company worlds and Corporate Bridge | HIDE FROM PRIMARY UX | Definitions/routes remain for compatibility/future work; they are no longer promoted from Game Hub/Career Hub primary surfaces. |
| Employer Discovery, Career Profile, Skill Passport and CV | KEEP | Existing data, permissions and export behavior preserved. |

## Routes audited

The audit covered the localized public, auth, learning, practice, career and compatibility route groups, including:

- `/`, `/signup`, `/login`, `/auth/continue`, `/student`, `/student-profile`
- `/academy`, `/bootcamp`, `/bootcamp/excel-foundations`, `/game`, `/game/student`, `/game/first-shift`
- `/journal`, `/ledger`, `/trial-balance`, `/financial-statements`, `/account-guide`
- `/accounting-arena`, `/leaderboard`, `/arena/leaderboard`, `/competition`
- `/career`, `/career-league/map`, `/career-league/gap`, `/career-profile`, `/career-profile/skills`, `/career-profile/cv`, `/profile`, `/account`
- `/employers`, `/employers/talent`, `/portfolio/<token>`
- `/api/v1/me/excel-foundations`, `/api/v1/competition/excel-foundations`, and the existing cloud competition APIs

## Duplicate systems identified and outcome

### Competition

Before cleanup the product exposed a seeded browser leaderboard, a standalone Excel arena, cloud matches and career-league progression as parallel competition destinations. After cleanup:

- `/competition` is the single standalone user-facing Professional Challenges page.
- Excel learning completion is a separate, opt-in learning-progress ranking because its data is not equivalent to match results.
- No localStorage score is promoted as a server rank.
- No fake names, seeded rows, fixed winners or duplicate replay points are shown.
- Existing cloud match and Excel outcome records were not deleted or migrated.

### Learning

The student sequence is now:

1. Complete private personal details.
2. Complete the five server-backed Excel Foundations stages.
3. Complete the 11 accepted Student Unit tasks.
4. Complete First Shift, including posting and ledger review.
5. Review Skill Passport evidence.
6. Review/download the factual English CV.
7. Continue to the next evidence-based career recommendation.

The signed-in student home displays the current stage, completed core stages, last completion, true progress and one primary `Continue my journey` action. Optional tools remain inside a disclosure instead of competing with the main action.

### Profile and career

- Account Settings owns sign-in identity, preferences, sync state and learning-ranking privacy.
- Career Profile owns professional identity, skills, courses, certificates, practical work and CV.
- Legacy game identity remains compatible but is not a duplicate primary navigation destination.
- Career Hub is the main career entry; specialized gap/role evidence views remain available where useful.

## Pages and code removed

| Removed file | Reason | Replacement |
| --- | --- | --- |
| `components/foundations/accounting-arena.tsx` | Standalone empty/duplicate learning leaderboard UI | Compact journey summary + Account Settings privacy controls |
| `components/platform/leaderboard-platform.tsx` | Seeded local leaderboard duplicated real cloud competition | `/competition` |
| `app/competition-v2.css` | Styles belonged only to removed leaderboard UI | Existing cloud competition styles |
| `lib/local-competition/v2-repository.ts` | Local public result storage was no longer consumed | Server competition/Excel progress repositories |
| `lib/local-competition/contracts.ts` | Unreferenced placeholder contract | Existing server competition service |
| `components/progress/progress-dashboard.tsx` | Unreferenced duplicate player/profile dashboard | Career Profile + journey progress |
| `tests/local-competition.test.ts` | Tested the removed obsolete local UI repository | Cloud competition, Excel engine and cleanup regression tests |

The old route files were intentionally not deleted: they are small locale-safe redirects for bookmarks. The protected Account City implementation, accounting chart, database schema and migrations were not modified.

## CSS and asset cleanup

- Removed `app/competition-v2.css` completely.
- Removed standalone `.xf-arena-*` rules from `app/excel-foundations.css`.
- Removed obsolete beginner-world league and Game Hub employer-preview selectors.
- Updated the beginner dashboard grid from four panels to the three retained panels.
- No image was deleted without proving it had no runtime/reference consumer; no speculative asset deletion was performed.

## Navigation consolidation

Primary signed-in navigation is limited to:

1. My journey
2. Practical training
3. Professional challenges
4. My skills
5. Career profile
6. Account/settings

Legacy `/leaderboard` and `/arena/leaderboard` redirect to `/competition`. Legacy `/accounting-arena` redirects to `/account#learning-competition`. `/skills` redirects to `/career-profile/skills`, while `/missions/progress` redirects to `/career-profile`.

## Data and security preservation

- No Prisma schema or migration changed.
- No production database command, reset or destructive write was executed.
- No user, accepted outcome, evidence, CV, XP or competition result was deleted.
- Better Auth, separate signup/login, safe redirect validation and profile-completion gate remain unchanged.
- Learning ranking still requires explicit opt-in; opting out hides the public row without deleting progress.
- Server-approved Excel completion remains the only source used for learning stages/ranking.
- Local game progress remains separate from accepted professional evidence and server competition.

## Tests added or updated

- Student journey ordering and Excel gate coverage.
- Student UI loading/account-switch coverage with a single Excel progress fetch.
- Account Settings opt-in, display name, rank and accepted-score preservation coverage.
- Mobile/global navigation and Game Hub duplicate-removal coverage.
- New `tests/product-cleanup.test.ts` guards redirects, deleted duplicate files, primary navigation and preserved server engines.
- Existing Excel workbook, accounting, CV, profile, auth, competition, Account City and First Shift suites remain part of the full run.

## Validation results

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed after final changes |
| Focused cleanup tests | Passed |
| Full `npm run test` | Passed: 86 test files, 716 tests |
| `npm run build` | Passed: production Next.js build and Prisma generation |
| Browser QA AR/EN at 1536/1024/390 | Passed: desktop, tablet and mobile without horizontal overflow |
| Excel interaction QA | Passed: tabs, worksheet selection/input, Enter/Shift+Enter navigation, font size, bold, five-stage flow and legacy redirect |
| Theme QA | Passed: stored dark preference applied in Arabic and English browser runs; approved Excel visual remains intact |
| Production read-only verification | Pending deployment |

## Before / after

| Before | After |
| --- | --- |
| Three user-facing leaderboard/arena destinations plus cloud matches | One Professional Challenges page plus a compact, clearly separate opt-in learning-rank summary |
| Student desk could appear before Excel Foundations | Excel's five accepted stages are an explicit prerequisite in the guided path |
| Multiple profile, map and league links in primary surfaces | Career Profile, Career Hub and Account Settings have distinct primary responsibilities |
| Game Hub promoted demo employer/league and locked worlds | Game Hub focuses on the next real task, current company, available cases, progress and accounting tools |
| Empty public learning board for non-participants | No large empty board; own status/rank is shown only when applicable |

## Performance and bundle notes

The cleanup removes client components and CSS that were reachable only through duplicate UI. The Student Journey provider now reuses its loaded Excel payload for the journey summary instead of issuing a second request for the same resource. No defensible before-build trace was captured on the exact starting SHA, so this report does not claim an invented percentage reduction; final build output is recorded after validation.

Browser evidence is stored locally in `artifacts/excel-foundations-qa/` for Arabic and English desktop, tablet, mobile and dark-preference runs. These generated QA artifacts are not committed as product assets.

## Remaining technical debt and known limitations

- Historical `/arena` gameplay and `/profile` remain for compatibility; they are not primary navigation. A future data migration would be required before deleting their local game identity.
- Academy still contains a roadmap for future curriculum. Locked/planned definitions remain but are not promoted as completed product capabilities.
- Professional cloud matches and learning progression intentionally use separate scoring; they are not combined into one misleading score.
- Full authenticated production writes are not part of read-only production QA.
- Final commit, PR, deployment SHA and production verification will be filled after checks and release.
