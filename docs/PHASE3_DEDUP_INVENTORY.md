# Phase 3 — real duplicate-UX usage inventory

Starting branch: `codex/phase3-remove-redundant-ux`
Starting SHA: `578879bfe732115bb789a0ba8d8b2a048cecf7c7`
Stacked base: `codex/phase2-product-cleanup` (PR #50), which includes PR #49
Inventory date: 2026-10-27

This inventory was completed before behavior changes. It traces route pages,
component imports, data-driven links, tests, CSS and public-asset references.
Compatibility redirects are classified separately from active interfaces.

## Classification rules

- **KEEP** — unique, active behavior or a canonical destination.
- **MERGE** — useful behavior currently presented inside a duplicate shell; move
  it into an existing canonical destination.
- **REMOVE** — redundant implementation that can be deleted only after its
  unique behavior, persistence and tests have replacements.
- **REDIRECT** — compatibility bookmark; retain even when it has no standalone
  interface.
- **FUTURE/HIDE** — honest planned content; do not advertise as playable.

## Active entry and identity routes

| Route | Audience | Owner | Classification | Notes |
| --- | --- | --- | --- | --- |
| `/{locale}` | guest and signed-in | marketing landing or `GameHub` | KEEP | Server chooses the public landing for guests and the account-owned home for signed-in users. |
| `/{locale}/login` | guest | Better Auth form | KEEP | Separate sign-in step. |
| `/{locale}/signup` | guest | Better Auth form | KEEP | Separate account creation step. |
| `/{locale}/auth/continue` | signed-in | safe internal handoff | KEEP | Preserves locale-safe `next` and required personal setup. |
| `/{locale}/onboarding` | guest/legacy local persona | platform onboarding | KEEP | Persona and career starting point; not a replacement for account CV setup. |
| `/{locale}/student-profile` | new signed-in user | private personal setup | KEEP | Required account-owned setup. |
| `/{locale}/account` | signed-in | account settings | KEEP | Identity, preferences and privacy. |
| `/{locale}/pricing` | all | pricing | KEEP | Current public plan description; payments remain outside this cleanup. |

## Active learning and practice routes

| Route | Primary role | Classification | Deduplication decision |
| --- | --- | --- | --- |
| `/{locale}/bootcamp/excel-foundations` | five server-assessed Excel stages | KEEP | Approved design and workbook are out of scope for visual changes. |
| `/{locale}/bootcamp` | distinct lesson/exercise set | KEEP/IMPROVE | Keep lessons; remove only repeated overview/entry calls if proven redundant. |
| `/{locale}/academy` | learning catalog/library | KEEP/IMPROVE | Keep as a catalog, not a second primary journey roadmap. Only working destinations are promoted; planned lessons stay out of the playable catalog. |
| `/{locale}/academy/account-guide` | academy account guide | KEEP | Unique reference surface. |
| `/{locale}/game/student` | 11 server-graded Student Unit tasks | KEEP | IDs, accepted progress and CV outputs are protected. |
| `/{locale}/game/first-shift` | connected source-document shift | KEEP | Unique saved company workflow and evidence. |
| `/{locale}/game` | practical Game Hub | KEEP/IMPROVE | Becomes the single non-guided practical hub; no second giant beginner city. |
| `/{locale}/game/inbox` | current source-document queue | KEEP | Contextual accounting shortcut. |
| `/{locale}/game/suppliers` | supplier work | KEEP | Real workflow remains reachable. |
| `/{locale}/game/customers` | customer work | KEEP | Real workflow remains reachable. |
| `/{locale}/game/bank-reconciliation` | bank reconciliation case | KEEP | Unique accounting workflow. |
| `/{locale}/game/logistics` | logistics zone | KEEP | Honest locked/available behavior remains. |
| `/{locale}/game/month-end` | month-end zone | KEEP | Planned/locked behavior remains explicit. |
| `/{locale}/journal` | accepted-entry journal | KEEP | Contextual accounting tool. |
| `/{locale}/ledger` | accepted-entry ledger | KEEP | Contextual accounting tool. |
| `/{locale}/trial-balance` | accepted-entry trial balance | KEEP | Contextual accounting tool. |
| `/{locale}/financial-statements` | available statement projection | KEEP | Full close remains honestly locked. |
| `/{locale}/account-guide` | nature-of-accounts reference | KEEP | Shared reference, not duplicate account data. |
| `/{locale}/campaign` | retained combined legacy learning content | KEEP | Existing redirects land here; no removal in this PR. |
| `/{locale}/arena` | accounting challenge entry | KEEP | Separate from server competition. |
| `/{locale}/competition` | server-owned official competition | KEEP | Single official match/leaderboard destination. |

## Active career and employer routes

| Route family | Classification | Notes |
| --- | --- | --- |
| `/{locale}/career` | KEEP | Canonical Career Hub. |
| `/{locale}/career-league/placement` | KEEP | Saved placement result; grants no verified evidence. |
| `/{locale}/career-league/map` | KEEP | Canonical career map. |
| `/{locale}/career-league/companies` | KEEP | Canonical company ladder and honest unlock state. |
| `/{locale}/career-league/gap` | KEEP | Career gap based on Skill Passport evidence. |
| `/{locale}/career-league/jobs` and `/jobs/[jobId]` | KEEP | Fictional training opportunities, not real vacancies. |
| `/{locale}/career-league/promotion` | KEEP | Local demonstrated simulation evidence only. |
| `/{locale}/career-league/corporate-bridge` | FUTURE/HIDE | Existing playable opening steps stay; later weeks stay planned. |
| `/{locale}/career-profile` | KEEP | Canonical professional profile. |
| `/{locale}/career-profile/skills` and `/skills/[skillId]` | KEEP | Canonical Skill Passport. |
| `/{locale}/career-profile/cv` | KEEP | Factual English CV. |
| `/{locale}/career-profile/edit` | KEEP | Account-owned profile editing. |
| `/{locale}/career-profile/employer-preview` | KEEP | Consent-aware preview. |
| `/{locale}/portfolio/[token]` | KEEP | Controlled shared portfolio. |
| `/{locale}/employer/*` | KEEP | Canonical employer company, candidate, shortlist and communication surfaces. |
| `/{locale}/companies` | KEEP | Public company entry. |

## Compatibility redirect routes — retain

These pages are not duplicate shipped interfaces. They preserve bookmarks or
old links and must remain redirect-only.

| Old route | Current destination |
| --- | --- |
| `/academy/[course]`, `/academy/[course]/[lesson]` | `/campaign` |
| `/academy/practice`, `/academy/detective`, `/academy/detective/[slug]` | `/campaign` |
| `/detective`, `/detective/[slug]` | `/campaign` |
| `/journal-entry`, `/learn`, `/learning-map`, `/practice` | `/campaign` |
| `/missions`, `/missions/[slug]`, `/money-flow`, `/money-flow/[slug]` | `/campaign` |
| `/arena/account-guide` | `/account-guide` |
| `/arena/detective` | `/detective` |
| `/arena/missions` | `/missions` |
| `/arena/money-flow` | `/money-flow` |
| `/arena/profile` | `/profile` |
| `/arena/daily`, `/daily`, `/missions/daily` | `/arena` |
| `/arena/career` | localized home |
| `/leaderboard`, `/arena/leaderboard` | `/competition` |
| `/accounting-arena` | `/account#learning-competition` |
| `/game/bank` | `/game/bank-reconciliation` |
| `/skills` | `/career-profile/skills` |
| `/missions/progress` | `/career-profile` |
| `/companies/talent`, `/employers`, `/employers/talent` | canonical employer routes |
| `/companies/candidate/[id]`, `/employers/candidate/[id]` | `/employer/candidates/[id]` |
| `/student` | account-aware Student Unit compatibility handoff |

## Duplicate component and behavior inventory

| Existing implementation | Consumers | Visible behavior | Classification | Replacement / proof required |
| --- | --- | --- | --- | --- |
| `components/platform/beginner-career-world.tsx` | conditional branch in `GameHub`; `tests/beginner-career-world.test.tsx` | second full header, mobile nav, rail roadmap, five-company city, second company track, identity, skills, tools, dialogs | MERGE then REMOVE | Move unique owner-capital practice and calculator to canonical Game Hub. Replace city with one compact link to `/career-league/companies`. Tests must prove saved activity, retry score, RTL/LTR, account scoping and honest planned status. |
| `navItems` inside Beginner Career World | same file | duplicates `PlatformNav` links on desktop and mobile | REMOVE | Shared `PlatformNav` remains the global navigation. |
| `roadmap` inside Beginner Career World | same file | eight-step second learning roadmap | REMOVE | `StudentJourneyHome` owns the guided three-stage path; Academy remains catalog; Career Hub owns career progression. |
| `.bcw-city` and `.bcw-map-track` | same file and CSS | two representations of the same five company tiers | REMOVE | One compact career progression card links to canonical company ladder, which continues to use `companyUnlocked`. |
| owner-capital four-question case | same file; activity key `practice:beginner-owner-capital` | unique real beginner accounting practice | MERGE/KEEP | Extract to `components/practice/owner-capital-case.tsx`; preserve key, score formula, attempts, feedback and absence of professional evidence. |
| Beginner calculator | same file | unique two-number optional calculator in this shell | MERGE/KEEP | Extract a small optional utility into canonical Game Hub. |
| Beginner company dialogs | same file | repeat canonical company ladder requirements | REMOVE | `/career-league/companies` remains source of truth. |
| `command-rail` in Game Hub | `GameHub` and `app/platform.css` | repeats global career/profile destinations | IMPROVE | Retain contextual accounting shortcuts only: inbox, journal, ledger, trial balance, statements and account guide. |
| `hub-next-mission` | `GameHub` | primary current-task CTA | KEEP | Remains the only dominant next-task action in Game Hub. |
| `company-world` + `operations-deck` | `GameHub` | zone shortcuts plus detailed First Shift work | KEEP/IMPROVE | Keep real zones and cases; eliminate repeated First Shift CTA inside the same viewport where safe. |
| `command-dossier` | `GameHub` | full profile/XP/passport/readiness dashboard copy | IMPROVE | Replace with concise account/skills summary links. No fabricated rank or evidence. |
| floating notification button | `GameHub` | decorative button with no supported action | REMOVE | Pending-document count remains on the real Inbox link. |
| `StudentGameLink` | `GameHub` only | second large CTA to the server-backed 11-task desk, above the hub's own recommended action | REMOVE UI ONLY | Delete the duplicate CTA component after confirming `/game/student`, its 11 tasks and the canonical journey action remain intact. The server-backed desk itself is retained. |
| `StudentJourneyProvider` / `StudentJourneyHome` | signed-in account context | account-bound current stage and one CTA | KEEP | Canonical guided journey. |
| `PlatformNav` | platform pages | shared responsive global nav | KEEP | Only global navigation for canonical platform surfaces. |

## CSS and assets

| File/asset | Classification | Evidence |
| --- | --- | --- |
| `app/beginner-career-world.css` | REMOVE after migration | Loaded only by `app/layout.tsx`; selectors are exclusively `.beginner-world`/`.bcw-*`. Delete only after the component and replacement tests no longer use them. |
| `app/platform.css` Game Hub selectors | IMPROVE | Shared platform stylesheet; remove only selectors proven unused after Game Hub simplification. |
| city-only public artwork | NOT YET REMOVED | The current Beginner Career World city is CSS/component markup and does not reference a unique public bitmap. No public image is deleted on name alone. |
| historical screenshots under `artifacts/` | RETAIN | QA evidence, not runtime assets. New before/after captures use a Phase 3 directory. |

## State and data contracts that must not change

- `practice:beginner-owner-capital` remains the exact local activity identity.
- A perfect run remains score 100; one wrong attempt followed by correct answers
  remains score 80 with two attempts.
- The practice never writes `debit-credit-skill-evidence-v1` or claims Verified.
- `CAREER_LEAGUE_KEY`, company unlock data and assessment results remain valid.
- Server-backed Excel, Student Unit and First Shift progress are unchanged.
- Compatibility redirects remain present.
- Prisma schema, migrations, Better Auth and production data are untouched.

## Baseline screenshot plan

Before and after captures use a local Next server and deterministic localStorage
fixtures, never Production:

- Arabic, 1440 px, light.
- English, 1440 px, dark.
- Arabic, 390 px, light.
- The same beginner persona and placement recommendation for both states.
- The after set also opens the owner-capital case and checks the compact company
  progression link.

The final report records exact screenshot paths and the browser checks that
created them.
