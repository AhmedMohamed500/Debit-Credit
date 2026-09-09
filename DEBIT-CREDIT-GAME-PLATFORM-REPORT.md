# Debit & Credit

> التقرير العربي الموحد لأعمال First Shift وطبيعة الحسابات والربط والـResponsive والنشر: [DEBIT-CREDIT-COMPLETE-WORK-REPORT.md](DEBIT-CREDIT-COMPLETE-WORK-REPORT.md)

## Nature of Accounts — 2026-09-09

Responsive correction: short desktop viewports now fit the complete manual scene into the available browser height. The verified 1850×850 and 1366×768 layouts retain the top navigation, compact the title and selectors, keep the whole book visible, and scroll long content inside its paper pages. Widths from 821px through 1050px use a single-page tablet layout with horizontal category selection. The existing 390px mobile list/detail flow remains intact. Opening the manual also resets stale browser scroll position to the top.

Rebuilt the accounting manual presentation around a realistic open book in a bright office. The book begins directly under six physical category selectors; readable account details and the entry example fit within the 1920×1080 review viewport. Mobile uses one paper page with list/detail navigation.

All 197 accounting records, codes, rules and detailed content remain unchanged. Added visible manual access in the navigation, cinematic entry, desk and document workspace. Opening the manual from First Shift preserves the source tab and its live draft; language switching keeps the return context.

The full accounting reference is downloadable from `/docs/nature-of-accounts.md`, generated from the same data as the UI. A repository copy is [NATURE-OF-ACCOUNTS.md](NATURE-OF-ACCOUNTS.md); implementation details and screenshots are in [NATURE-OF-ACCOUNTS-REPORT.md](NATURE-OF-ACCOUNTS-REPORT.md).

Validation: 182 tests across 23 files, ESLint, TypeScript and production build passed. Browser checks cover AR/EN at 1920×1080, 390px with zero horizontal overflow, search/filter/selection, compatibility routes, MD content, and an actual unsent journal draft preserved across a manual visit and language change. No game rewards, accounting data, chapter progression or balances were modified.

Publication remains on `codex/first-day-cinematic` through PR #1 and Vercel Preview. No merge into main or user visual approval is implied.

Published implementation: `50437eafab34cd47487440db10b8582a8b860f42`. Vercel deployment `6338264780` succeeded: [Arabic manual](https://debit-credit-79xpe3yjx-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/account-guide), [English manual](https://debit-credit-79xpe3yjx-ahmed-mohameds-projects-c51bc2cc.vercel.app/en/account-guide), [MD download](https://debit-credit-79xpe3yjx-ahmed-mohameds-projects-c51bc2cc.vercel.app/docs/nature-of-accounts.md).

## by Money Coder

## Real Accounting Game Platform — 2026-09-07 release

This section supersedes the historical report below. It documents the implementation actually shipped, not the complete long-term product vision.

### Product Philosophy / Game vs Academy

The player enters Mizan Trading as an accounting trainee. The home screen is an interactive office, not a course catalog. The loop is: receive a manager request → inspect source documents → decide or assemble a journal → receive accounting consequences → correct the draft → update accepted company records → complete the shift → earn a one-time reward → unlock the next responsibility.

### First five minutes

Start the first shift, open CAP-001 / INV-014 / RENT-01, sort the documents, distinguish owner capital from revenue, and assemble a balanced EGP 20,000 cash investment entry. The accepted entry updates cash. Finishing the mission awards 80 XP and 25 coins. The desk-clearance boss unlocks when the preceding mission reaches 70% mastery. Drafts, document inspection, hints, failures and stage position survive navigation and reload.

### Game World / Company State

Interactive desk objects: incoming documents, journal, ledger balances, cash drawer, bank and calculator. Short manager messages introduce cases. The company chart includes cash, bank, inventory, equipment, receivables, payables, capital, revenue, rent, salaries, accruals and depreciation. Some account types are available in the chart but are not transacted in the initial campaign.

Company figures derive from accepted journal lines. Failed drafts are held for correction rather than silently corrupting the accepted books. Replaying an accepted journal does not duplicate its financial effect. INV-014 persists across document inspection, journal entry, posting, supplier verification and later reports.

The full campaign test finishes with cash 18,300; bank 7,600; inventory 6,000; liabilities 6,800; loss 2,700; net assets 34,100; and zero trial-balance difference (EGP).

### Chapters / Missions / Boss Missions

| Chapter | Playable work | Boss |
| --- | --- | --- |
| First Day | Three papers; sort; capital effect; first entry | Desk clearance: supplier invoice, rent, cash control |
| The First Shift | Trace and post INV-014; verify supplier debt | First shift review |
| The Missing Money | Inspect missing salary voucher; correct cash | Save the drawer |
| The Messy Ledger | Identify duplicate supplier posting | Ledger sign-off |
| Month-End Is Coming | Record unpaid salary accrual | Deadline review |
| The Numbers Don't Match | Investigate a copied balance error | Trial balance rescue |
| The CFO Wants Reports | Derive loss and financial position | CFO review |
| The Promotion | Full month-end document and accounting chain | The Month-End File |

There are 15 campaign missions, including eight bosses. The final file has document review, capital and equipment journals, posting, bank reconciliation, trial balance, depreciation, financial statements and final review. Boss assessment scores preserve first-run performance separately from best-run results.

### Mini Games / Daily Play

Ten playable Arena modes: Document Sort, Debit/Credit Rush, Build the Entry, Find the Error, Bank Match, Trial Balance Rescue, Month-End Rush, Account Classification, Memory Match and Accounting Chain. These use tap/select controls, journal assembly, numeric controls and memory reveal/hide interactions. Sessions last 90–180 seconds with accuracy, combos, personal bests and stored responses. Daily rewards require at least 70% accuracy and are awarded once per mode/date. Weekly boss practice selects an unlocked campaign boss; it is not a live multiplayer competition.

### Journey Director / Progression / Rewards

`lib/campaign/model.ts`, `content.ts`, `director.ts`, `arcade.ts` and `store.ts` define the active game. Stable mission/stage IDs identify campaign evidence; Arena has its own explicit activity IDs. The director chooses the next eligible mission, validates stage submissions, saves consequences, calculates mastery and records rewards. Mission completion and 70% mastery gate subsequent missions; XP alone never unlocks chapters. Existing active drafts are retained when a different mission is requested.

Campaign rewards are one-time per mission; Arena rewards are one-time per mode/date. Stars reflect run performance. Coins buy desk lighting and a document organizer; upgrades cannot be purchased twice. Streaks are calculated from active dates and expire. The UI exposes a sound-ready state-change event; no audio files or external sound service were added.

### Skill Evidence / Career Readiness

Each submission stores activityId, missionId, chapterId, skillId, difficulty, accuracy, attempts, hintsUsed, completionTime, independentCompletion, criticalErrors, score, completedAt, mode, response and correctness. Mission results retain firstScore, bestScore, runs and stars. Opening the manual from an active mission counts as assistance without changing the manual itself.

The career card reports seven skill families using first-attempt evidence, independent accuracy, difficulty coverage, mastered bosses and final-file performance. Arcade evidence is practice-only and does not inflate readiness. Readiness is capped below 80 until the final first-run score reaches 70. The in-game ready status requires readiness ≥80 and a qualifying final file. This is a transparent game indicator, not validated employment eligibility or accredited certification.

### Future Real Employer Architecture / Company Challenges

The separate `/companies` preview shows the actual local player's evidence, explicitly labeled local and unverified. Evidence can be exported as JSON. The domain includes company identity, challenge origin, assessment policy, difficulty and required skills for future employer-authored cases. Real accounts, consent-based discovery, server-side validation, anti-cheat controls, recruitment and contact services remain future work; none is simulated as live functionality.

### Nature of Accounts Protection

The internal component, data and route remain unchanged. A regression test verifies normalized SHA-256 fingerprints for all three protected files. An external return link restores the office context. The original internal Return to game route also redirects to the office.

### Arabic / English / Mobile

New game content and controls support Arabic RTL and English LTR. The office uses touch controls, compact active-mission layout, visible focus styles, modal focus handling, and reduced-motion CSS. Prior local UI checks exercised the English first mission, a deliberately incorrect capital decision, document inspection, saved journal draft after manual navigation, and Arabic office at 390px without horizontal overflow. Final production checks are recorded in the publication addendum.

### Storage / Compatibility / Known Limits

- Active gameplay uses `debit-credit-world-v2` with same-tab and cross-tab notifications and a visible storage-failure warning.
- Existing educational progress is archived without granting unsupported mastery. The allowlisted FINORA educational migration remains; operational/business keys are not accessed.
- Four primary destinations: Office, Campaign, Arena, Profile. Employer preview is separate.
- Old course, mission, Money Flow, Detective and practice URLs redirect to Campaign; skills/career redirect to Profile; daily/leaderboard redirect to Arena. Original engine source remains in the repository, but this release replaces their route-level experiences rather than fully embedding every old engine.
- Legacy `practice?track=...` does not automatically open a track-specific stage; it reaches Campaign. Mapping every legacy deep link to an exact new stage remains future integration work.
- Campaign content is a finite scripted company case, not a general ERP simulator. Replays retain accepted books and do not create duplicate transactions. Some later controls are numeric puzzles rather than fully editable ledgers or financial statement workpapers.
- Browser storage and exported evidence can be edited by the user and must not be treated as verified professional assessment data.

### Tests / Build

`npm run check` passed: ESLint (zero warnings), TypeScript, **169 tests across 21 files**, and Next.js production build. New tests cover first-desk UI, canonical IDs, progression, company totals, exact resume, first attempts, hints, mastery gates, rewards, all ten Arena modes, memory inspection, timeouts and employer evidence mapping. Nature of Accounts regression protection passes.

### Publication

Repository: https://github.com/AhmedMohamed500/Debit-Credit — branch `main`.
Production: https://debit-credit-nine.vercel.app.
This release is published through the repository's existing Vercel integration.

### Publication addendum — verified 2026-09-07

- Implementation commit: `0225188` — `feat: ship Mizan accounting campaign and playable arcade`.
- GitHub push: successful to `origin/main`.
- Vercel implementation deployment: **success**, provider status “Deployment has completed”.
- Deployment record: https://vercel.com/ahmed-mohameds-projects-c51bc2cc/debit-credit/7f34hTNVVvpYgdptvd1ezCxJAaB3.
- Production Arabic homepage visibly displays the new Mizan office and Start Shift controls.
- Production 390px checks passed on `/ar`, `/en`, `/ar/arena`, `/en/arena`, `/ar/campaign`, `/en/profile`: document width 375px within a 390px viewport; no horizontal overflow.
- Browser error/warning log for these checks: empty.
- The documentation-only follow-up commit records this evidence and is also pushed to `main`; it does not change the tested application code.

---

## Historical report — previous release (not the current architecture)

## Game-Based Accounting Learning Platform Final Report

### Project Audit

The existing product contained strong educational content, but the user experience was fragmented in several concrete ways:

- The localized home page was a marketing landing page with no player level, current objective, rewards, or route back into unfinished work.
- The main header presented Learn, Money Flow, Missions, Detective, Arena, and Progress as peer destinations, so they read as separate products rather than stages in one journey.
- Arena had its own navigation and profile surfaces, while Academy and Detective linked back to separate Academy paths.
- Academy, Missions, Detective, Money Flow, and Arena each retained a separate progress store. The old profile assembled a snapshot at render time, but there was no canonical player state.
- XP on the old profile was an ad-hoc sum of unrelated scores rather than a consistent reward currency.
- Arena professional score, module scores, lesson progress, and the overall profile percentage had no shared level or objective model.
- `/arena/missions`, `/arena/detective`, `/arena/money-flow`, `/arena/profile`, and `/arena/leaderboard` duplicated or competed with canonical routes.
- `/learn` opened the legacy Academy presentation rather than a product-level learning sequence.
- `/journal-entry` displayed the old account-nature drill instead of a journal-entry construction challenge.
- `/career` was an alias for an Arena mission and did not explain career readiness.
- There was no employer experience, talent discovery route, or shareable skills profile.

The educational engines and content themselves were valuable and were retained. The refactor changed the product frame, progression, route hierarchy, and shared state instead of rebuilding or discarding the modules.

### Product Architecture

The product now uses one game architecture:

```text
Player
  → Current Level
  → Current Objective
  → Lesson / Activity
  → Practice
  → Mission / Case
  → Assessment
  → Reward
  → Skill Evidence
  → Next Level
  → Career Readiness
```

The canonical player state lives in `debit-credit-player-v1`. Detailed module stores remain as evidence and for feature-specific state, but each completed activity now updates the same player model.

The shared player model includes:

- XP and coins
- Player level and level progress
- Current objective
- Activity evidence and personal best scores
- Daily streak
- Badges and certificates
- Thirteen accounting skill scores
- Career Readiness

A persistent status bar exposes current level, XP, coins, streak, and current objective throughout the student product. A five-item mobile bottom navigation keeps Home, Map, Mission, Arena, and Profile available at 390px.

### Product Journey

```text
PLAY → LEARN → PRACTICE → SOLVE → LEVEL UP → GET VERIFIED → GET HIRED
```

```text
العب → اتعلم → تدرب → حل → ارفع مستواك → اثبت مهاراتك → اتوظف
```

“Get hired” is presented as a product direction and talent-discovery opportunity, not a guarantee of employment.

### Learning Map

1. **Accounting Foundations** — accounting equation, classification, protected Nature of Accounts, Money Flow, and a foundation mission.
2. **Journal Entries** — debit/credit reasoning, journal construction, balancing, and an unbalanced-entry mission.
3. **Ledger & Posting** — journal-to-ledger flow, T-account thinking, and posting practice.
4. **Trial Balance** — trial balance review, balance differences, and Detective cases.
5. **Adjusting Entries** — accruals, prepayments, depreciation, and adjustment practice.
6. **Financial Statements** — income statement, statement of financial position, and statement relationships.
7. **Real-World Accounting** — mixed Missions, Detective, Money Flow, and business cases.
8. **Professional Mode** — Arena, Career Mode, professional simulations, and readiness assessment.

Each level lists its learning activities, mode, skills, reward, completion state, and lock state. The current level is visually identified and the player always receives a next objective.

### Nature of Accounts

**Protected existing module. Internal functionality was not changed.**

The following protected files remained unchanged:

- `components/academy/account-guide.tsx`
- `data/account-learning-guide.ts`
- `app/[locale]/account-guide/page.tsx`

The module is linked into Level 1 as a “Protected Classic Module.” Completion can be recorded externally after returning to the Learning Map. A regression test normalizes line endings and verifies SHA-256 hashes for the route, data, and internal UI files.

### Game Engine

#### XP

| Activity | First completion |
| --- | ---: |
| Lesson | 20 XP |
| Journal practice | 30 XP |
| Money Flow | 60 XP |
| Mission | 100 XP |
| Detective case | 160 XP |
| Arena challenge | 120 XP |
| Daily challenge | 75 XP |
| Assessment | 250 XP |

Repeated attempts do not grant the full reward. An unchanged retry grants no XP or coins. A new personal best grants only 10% of the base reward, preventing unlimited retry farming.

#### Coins

Coins are earned alongside meaningful first completions. The current journal engine allows a five-coin hint. Coins do not unlock correctness and are never pay-to-win.

#### Levels, objectives, badges, and unlocks

Eight XP thresholds control the player level. The current objective is derived from the first unfinished activity inside the current level. Badges are issued for real conditions such as the first activity, journal mastery, error-detection mastery, and a seven-day streak. Certificates require both progression and demonstrated skill scores.

### Existing Module Integration

- **Money Flow** records visual transaction performance into Transaction Analysis and Debit & Credit skills.
- **Journal Entry** is now a real construction engine with account selection, debit/credit selection, amount entry, balance totals, instant validation, explanations, four difficulty levels, rewards, hints, retry, and mobile-safe select controls.
- **Missions** remain real accounting jobs and now feed Business Cases, Journal Entries, Accuracy, XP, and coins.
- **Detective** retains evidence, notes, linking, conclusions, treatment, and scoring. Its canonical links now return to Detective and the Learning Map instead of the old Academy shell.
- **Arena** remains the competitive professional simulation. Ranked attempts feed the global skill and reward model while Arena-specific scoring remains performance evidence.
- **Career** now has a dedicated transparent readiness dashboard and links to the existing professional Arena simulation.
- **Daily Challenge** remains part of Arena and feeds the unified player when completed.
- **Profile** now reads the canonical player, skill matrix, badges, certificates, readiness, and current objective.
- **Leaderboard** remains a competitive mode. Seed/demo data remains distinguishable from real player evidence.

Old Arena integration URLs remain as compatibility redirects. Primary navigation no longer exposes them.

### Skills

The skill matrix contains:

- Accounting Fundamentals
- Account Classification
- Debit & Credit
- Transaction Analysis
- Journal Entries
- Ledger Posting
- Trial Balance
- Adjusting Entries
- Financial Statements
- Error Detection
- Business Cases
- Accounting Accuracy
- Accounting Speed

Scores are averages of recorded activity evidence attached to each skill. Mastery bands are Beginner, Intermediate, Advanced, and Mastered. A skill with no evidence stays at zero.

### Career Readiness

Career Readiness uses a transparent 100-point model:

- Level progress: 25%
- Skill evidence across all thirteen skills: 35%
- Mission evidence: 15%
- Detective evidence: 10%
- Arena evidence: 10%
- Consistency/streak: 5%

Unmeasured skills remain zero and lower the skill component. A single successful activity therefore cannot create unrealistic job readiness. The UI states clearly that the score is not a job guarantee.

### Employer Portal

Routes:

- `/[locale]/companies`
- `/[locale]/companies/talent`
- `/[locale]/companies/candidate/[id]`

The employer experience is separate from the student dashboard. It provides filters for skill, Career Readiness, accuracy, and level; comparable candidate cards; local shortlist/interview markers; and shareable profile previews.

All candidates and company interactions are explicitly marked **DEMO**, **SAMPLE**, or **SEEDED DATA**. Fictional names are used. No real company partnerships, live hiring backend, external verification, or guaranteed employment are claimed.

### Localization

All new navigation, game states, objectives, learning levels, rewards, skills, certificates, career content, and employer content support Arabic and English. Arabic renders through the existing RTL shell and English through LTR.

### Mobile

Manual browser verification used an explicit 390 × 844 viewport. Core pages had no horizontal overflow. The Learning Map, journal inputs, profile, Career dashboard, and employer talent cards collapse to touch-friendly layouts. The journal engine uses native selection and numeric inputs rather than drag-only interaction. A mobile bottom navigation keeps the main game loop accessible.

### Storage

Canonical state:

- `debit-credit-player-v1`
- synchronization marker: `debit-credit-player-sync-v1`

Detailed evidence stores retained:

- `debit-credit-progress-v1`
- `debit-credit-money-flow-v1`
- `debit-credit-missions-v1`
- `debit-credit-detective-v1`
- `debit-credit-arena-v1`

The original `debit-credit-storage-migration-v1` FINORA educational migration remains intact. It never reads, writes, or deletes FINORA operational data.

### Important Routes

- `/[locale]` — Player Command Center and product vision
- `/[locale]/learning-map` — eight-level journey
- `/[locale]/practice` — journal challenge engine
- `/[locale]/account-guide` — protected Nature of Accounts
- `/[locale]/money-flow` — Money Flow Lab
- `/[locale]/missions` — real accounting jobs
- `/[locale]/detective` — Accounting Detective
- `/[locale]/arena` — competitive professional simulation
- `/[locale]/arena/daily` — daily challenge
- `/[locale]/skills` — skill matrix and certificates
- `/[locale]/career` — transparent Career Readiness
- `/[locale]/profile` — unified player profile
- `/[locale]/leaderboard` — competitive ranking
- `/[locale]/companies` — employer introduction
- `/[locale]/companies/talent` — demo talent discovery
- `/[locale]/companies/candidate/[id]` — demo shareable skill profile

`/learn`, `/academy`, and old Arena integration routes remain compatibility routes or redirects and do not define primary information architecture.

### Testing

- Test files: **17 passed**
- Automated tests: **132 passed**
- ESLint: **Passed with zero warnings**
- TypeScript: **Passed**
- Production build: **Passed**
- Generated pages/routes: **50**
- Browser console errors/warnings: **0**
- HTTP route verification: **26 routes returned 200**
- Desktop Arabic and English audit: **Passed**
- 390px Arabic and English audit: **Passed, no horizontal overflow**
- Interactive journal completion and reward persistence: **Passed**
- Employer filtering and local shortlist action: **Passed**
- Protected Nature of Accounts regression: **Passed**

### Git

- Branch: `main`
- Implementation commit: `23dbc8d` (`feat: unify accounting game journey`)
- Repository: <https://github.com/AhmedMohamed500/Debit-Credit>
- Push status: Successful after final documentation update

### Vercel

- Deployment result: Production deployment completed after the final `main` push
- Production URL: <https://debit-credit-nine.vercel.app>
- Arabic: <https://debit-credit-nine.vercel.app/ar>
- English: <https://debit-credit-nine.vercel.app/en>

### Final Result

Debit & Credit now presents one accounting game journey: the learner has a current level, objective, mission, reward, measurable skills, competition path, career-readiness explanation, and a demo path for company discovery. Existing educational content remains available inside that journey rather than behaving like disconnected products.

## Chapter 1 — Cinematic Accounting Game Loop

### What was wrong before

The First Day route used a timed sequence over one static image, complete with simulated playback and progress controls. That made a poster look like a video and moved the player forward automatically. After it ended, the composition returned to a conventional dashboard: a wide status header, a large stepper, a mission banner, three persistent cards, and a company panel with similar visual weight to the actual work.

### Implemented game flow

Chapter 1 is now a deliberate, player-controlled sequence:

1. Cinematic entry poster; nothing auto-starts.
2. `Start Story` reveals the media state.
3. The repository contains no `.mp4` or `.webm`, so the component honestly displays `المقدمة السينمائية ستتوفر هنا` / `Cinematic introduction will be available here` and identifies the image as a static preview.
4. `Enter Company` is a separate manual action.
5. Mr. Kareem delivers the Finance Manager briefing.
6. `Show Me The Desk` enters the playable office.
7. The player chooses any remaining physical document, inspects it, builds a debit/credit entry, submits it, and receives immediate accounting and business feedback.
8. A correctly processed paper leaves the active desk and moves to the processed count, so the desk visibly cleans from 3 → 2 → 1 → 0.
9. Shift Complete calculates accuracy, attempts, and hints from stored evidence, shows Mr. Kareem's reaction, displays the earned total, and teases the locked Chapter 2: **THE MISSING MONEY**.

The media component is ready for real video sources and includes real play/pause, mute, replay, skip, and ended-state behavior only when an actual source exists. It does not render simulated video controls for the current poster fallback.

### Playable documents and accounting consequences

- Supplier Invoice: Dr Office Equipment / Cr Accounts Payable, EGP 100,000. Equipment and supplier balances each move from their real prior value to the updated value.
- Customer Receipt: Dr Bank / Cr Accounts Receivable, EGP 75,000. Bank rises and the customer balance falls.
- Office Expense: Dr Office Supplies Expense / Cr Cash, EGP 2,500. Cash and net profit both fall.

Incorrect entries are not posted to the journal and do not receive rewards. They record evidence and expose the specific business consequence, such as an unreconciled bank amount or an overstated profit. Correct unique submissions persist the journal entry, company state, evidence, reward key, XP, and coins in the existing game store.

Reward model: **+100 XP and +50 coins per unique document**, for an exact shift total of **+300 XP and +150 coins**. Re-submitting an already completed document cannot duplicate the reward.

### Composition and responsive behavior

The accounting desk is now the dominant play surface, while the live company panel is visually secondary. The chapter stepper was reduced to a compact story timeline. Desktop supports the full desk composition, and the existing responsive rules plus the Chapter 1 refinements stack documents and workbench actions at mobile widths down to 390px without horizontal document rows.

Arabic remains RTL-first and English remains LTR. The new entry, briefing, desk, journal interaction, consequences, rewards, completion screen, and teaser are localized in both languages.

### Protected module

The internal Nature of Accounts / طبيعة الحسابات implementation was not modified. Its protected regression test still passes. Chapter 1 only links to it as the existing accounting manual.

### Verification

- `npm run check`: **Passed**
- ESLint: **Passed with zero warnings**
- TypeScript: **Passed**
- Test files: **22 passed**
- Automated tests: **178 passed**
- Production build: **Passed**
- Protected Nature of Accounts regression: **Passed**
- Manual browser QA: Arabic cinematic entry, honest poster fallback, Finance Manager briefing, desk, and document inspection verified
- Intro auto-start: **Absent**
- Fake video controls on poster fallback: **Absent**
- Chapter 2 implementation: **Not started; teaser only**

### Screenshot-ready route

- Arabic: `/ar`
- English: `/en`

### First Shift Visual Target Pass — September 7, 2026

The First Shift desk was rebuilt around the supplied target composition instead of the earlier two-column dashboard composition.

- Added a dedicated photorealistic environment asset at `public/game/first-shift-desk-v2.png`.
- The asset was generated as a clean environment layer with no baked interface, documents, branding, people, or fake controls. All papers, buttons, state, and dialogue remain real accessible HTML.
- The office scene now fills the playable viewport: warm wooden desk, daylight skyline, laptop, books, plants, calculator, coffee, inbox, and processed tray.
- The three interactive documents sit physically on the central desk and keep their slight paper rotations, clips, stacked sheets, numbered badges, details, and real open actions.
- Company state is now a compact translucent HUD fixed to the physical left side.
- The First Shift briefing and Mr. Kareem dialogue are compact overlays fixed to the physical right side in both RTL and LTR.
- Story progress is a small floating cinematic strip rather than a page section.
- XP, coins, shift reward, pending work, and skill gain are compact overlays around the scene.
- Correct completion continues to remove the paper from the live desk and increment the processed tray, preserving the visible 3 → 2 → 1 → 0 game loop.
- At mobile widths, the environment becomes the opening game scene and the documents stack vertically with touch-sized actions and no horizontal document strip.

Scope remained limited to Chapter 1 First Shift visual composition. Arena, Career, Companies, Skills, other chapters, and the internal Nature of Accounts module were not modified.

Verification after this pass:

- `npm run check`: Passed
- ESLint: Passed with zero warnings
- TypeScript: Passed
- Automated tests: 178 passed across 22 files
- Production build: Passed
- Protected Nature of Accounts regression: Passed
- Arabic RTL visual browser review: Passed after fixing physical HUD placement
- English LTR behavior remains covered by the Chapter 1 UI suite

### First Shift Interaction Polish — September 8, 2026

This pass keeps the approved First Shift desk as the base and makes its objects behave more like one connected point-and-click accounting game:

- The laptop is now a live Mizan OS mission surface. It shows the current 0/3 shift progress, inbox count, the status of every document, and Mr. Kareem's current instruction.
- Mr. Kareem's instruction is presented as a compact in-world dialogue bubble: choose a document, verify the source, classify it, and record the correct entry.
- The three documents retain their real accounting interactions while using more natural paper angles, overlap, stacked-sheet depth, and hover lift.
- A correct submission now communicates the full consequence before leaving the workbench: pending documents and pending journal entries both move from 3 to 2, affected accounts show their before/after values, and +100 XP / +50 coins are recorded once.
- Returning to the desk removes the completed document from active work, animates a recorded paper toward the physical processed tray, and increments the tray count.
- The bottom HUD is grouped into skill gain, current mission, and total shift reward, so company state remains secondary to the active work.
- Shift completion now reports documents completed, accuracy, first-attempt completions, hints used, the exact reward, Mr. Kareem's reaction, and a locked Chapter 2 teaser.
- The document workbench follows the explicit gameplay sequence: Inspect → Build Entry → Consequence → Return to Desk.

No other chapter or product area was expanded. The internal Nature of Accounts / طبيعة الحسابات module remains unchanged and is referenced only through its existing manual link.

Verification for this polish:

- Targeted Chapter 1 tests: 12 passed
- Full verification: 178 tests passed across 22 files
- ESLint, TypeScript, and production build: Passed
- Protected Nature of Accounts regression: Passed
- Desktop Arabic visual capture: `artifacts/first-shift-polished-ar.png`
- Opened document interaction capture: `artifacts/first-shift-document-ar.png`
- 390px opened-document capture: `artifacts/first-shift-mobile-ar.png`
- 390px horizontal overflow check: Passed (0px overflow)

### First Shift — Playable Desk Rebuild | September 8, 2026

Replaced the First Shift presentation tree with a dedicated scene implementation in `app/first-shift-scene.css`. The previous two-column layout, company sidebar, document-card footers and decorative KPI sections are no longer rendered. The supplied reference guided the desk composition; the existing clean photographic desk asset was reused (no new generated raster asset was required).

- Full viewport accounting desk with source papers, paper clips, stacked edges, natural rotations and subtle inspection indicators.
- Live Mizan OS content aligned inside the physical laptop screen; compact story strip and manager notification.
- Company balances and month-end progress remain in a small bottom HUD. The ledger book opens the remaining company balances, pending entries and unresolved errors.
- Journal book reads the accepted First Shift entries from existing storage. The calculator performs addition, subtraction, multiplication and division, including zero-division handling.
- Source papers open a focused in-game mission layer over the same desk. Existing inspection, treatment decision, entry construction and consequence logic is preserved.
- Correct papers leave their original desk position, animate toward Processed, and accumulate visibly in the tray. The final paper transfer runs before the shift result appears.
- Mobile uses one paper at a time with previous/next buttons, swipe navigation, bottom inspection action, compact status and accessible desk tools.
- Modal focus is contained; Escape closes the layer; the background scene is inert while a document or tool is open. Reduced-motion preferences are honored.
- Existing accounting rules, amounts, rewards, company state, localization, storage and routes remain unchanged. No internal Nature of Accounts changes or work on Chapter 2, Arena, Career, Companies or Skills.

Validation:

- 181 tests passed across 22 files, including protected Nature of Accounts regression.
- ESLint passed with zero warnings; TypeScript and production build passed.
- Production browser verification: Arabic desktop 1672×941, English desktop 1366×768 and Arabic mobile 390×844.
- Horizontal overflow: 0px on desktop and mobile, including the mobile document layer.
- Browser flow checked wrong answer → correction → all three successful entries → final result → reload; final state is 3 journal entries, 300 XP and 150 coins.
- Processed count verified 0 → 1 → 2 → 3; saved progress verified after first and final documents.
- Mobile next/previous and swipe navigation, modal focus, Escape, and zero browser page errors checked.
- Browser verification script: `artifacts/verify-first-shift.mjs` (requires Playwright; optional `PLAYWRIGHT_MODULE` and `FIRST_SHIFT_URL` overrides).
- Detailed results: `artifacts/first-shift-scene-qa.json`.

Review captures:

- Desktop Arabic: `artifacts/first-shift-scene-desktop-ar.png`
- Mobile Arabic: `artifacts/first-shift-scene-mobile-ar.png`
- Open document Arabic: `artifacts/first-shift-scene-document-ar.png`
- Mobile open document: `artifacts/first-shift-scene-mobile-document-ar.png`
- Desktop English: `artifacts/first-shift-scene-desktop-en.png`
- Processed tray after one entry: `artifacts/first-shift-scene-processed-en.png`

Publication authorized by the user's subsequent instruction to publish to GitHub and Vercel. Continue on `codex/first-day-cinematic`; PR #1 remains the review destination and is not merged into main.

GitHub review: https://github.com/AhmedMohamed500/Debit-Credit/pull/1
Vercel Preview (Ready; source commit `6351c106125e6f3a52e3e1e41297a80f799d5a3c`):

- Arabic: https://debit-credit-5rvac1ch4-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar
- English: https://debit-credit-5rvac1ch4-ahmed-mohameds-projects-c51bc2cc.vercel.app/en
- Deployment: https://vercel.com/ahmed-mohameds-projects-c51bc2cc/debit-credit/CVPTcBsk9DgezaMn6PkjQZ8XdWzM

Published through the existing GitHub–Vercel integration. GitHub's deployment record `6332322160` and the exact source commit's Vercel status both report success. A direct CLI attempt returned Not authorized; the configured Git integration completed the deployment successfully.

Live browser verification: the deployment URL redirects unauthenticated visitors to the Vercel login page (deployment protection). The public browser flow therefore could not run against the hosted preview. Full interaction verification and screenshots were completed against the local production build; remote publication is verified by the successful exact-commit GitHub deployment status. Open the Preview while signed into the owning Vercel account. Existing access settings were preserved.

### Nature of Accounts — In-Game Accounting Manual Redesign | September 8, 2026

The intentionally approved redesign replaces the long Academy-style Nature of Accounts presentation with a professional open accounting manual inside the Debit & Credit game world.

- A generated clean office environment supplies the physical desk and blank open book. All account data, labels, search results and controls remain live accessible HTML.
- The primary desktop view keeps the important reference above the fold: compact navigation and search, title and finance-manager message, six category selectors, then the open book.
- Categories use the existing Assets, Liabilities, Equity, Revenue, Expenses and Contra groups. They show live counts calculated from `accountLearningGuide` and act as the sole category filter.
- The physical left page lists real account codes and bilingual account names. The right page updates immediately with the selected account's normal balance, increase and decrease direction/effect, financial-statement location, supporting documents, journal example and expandable document cycle.
- Search retains Arabic name, English name, code and category matching. Empty results provide an explicit reset action.
- The current 90+ account dataset, unique codes, accounting rules and lookup behavior remain unchanged. No accounting data file was edited.
- Existing Arabic, English, Academy compatibility and Arena redirect routes remain available. Return-to-game uses browser history so the source mission and stored draft remain intact.
- Missing approved English detail fields are not invented. The English frame uses existing English names and normal-balance values while clearly retaining the Arabic source explanation where the data model has only Arabic detail.
- Mobile becomes a manual with Accounts and Account Behavior tabs, horizontal touch category selection, automatic detail opening after account selection and zero horizontal overflow at 390px.
- The approved protected baseline now covers the rebuilt component, unchanged accounting data, unchanged primary route and the new manual stylesheet.

Review captures:

- Arabic desktop: `artifacts/account-manual-desktop-ar.png`
- English desktop: `artifacts/account-manual-desktop-en.png`
- Arabic mobile: `artifacts/account-manual-mobile-ar.png`

Browser verification covers Arabic and English rendering, search, six category filters, account selection, 390px mobile tabs, compatibility routes, return context and zero horizontal overflow. Detailed section documentation is in `NATURE-OF-ACCOUNTS-REPORT.md`.

Preview publication:

- Implementation commit: `55dc688bd8735134444fd95cadfc6d37b32cffdf`
- GitHub review: https://github.com/AhmedMohamed500/Debit-Credit/pull/1
- Vercel Preview: https://debit-credit-n0zc0sg3a-ahmed-mohameds-projects-c51bc2cc.vercel.app
- Vercel deployment record: https://vercel.com/ahmed-mohameds-projects-c51bc2cc/debit-credit/CL7i73SwBoqwccVYBd6dCgv9tJUA
- GitHub deployment `6335594071` reports success for the exact implementation commit.

## Career Profile & Skill Passport Foundation — September 10, 2026

The project now includes a separate professional identity layer that connects real accounting activity to an evidence-backed profile and CV while keeping game progression isolated.

- Added a five-step bilingual Career Profile with stable local candidate identity, education/experience, target role, work preferences, privacy and resume-later browser persistence.
- Added the Accounting Skill Passport with 19 accounting skills and the explicit states Unassessed, Practiced, Demonstrated and future-only Verified.
- Added a versioned Skill Evidence Engine. First Shift supplier invoice, customer receipt and office expense attempts are projected into exact related skills; incorrect attempts remain practice evidence and current gameplay never becomes Verified.
- Added deterministic skill scoring with difficulty, accuracy, activity score, independence, first attempt, hints, critical errors and evidence diversity. One activity never displays a percentage.
- Added evidence-thresholded Accounting DNA and separate weighted readiness definitions for nine accounting roles. Readiness stays “Not Enough Evidence” until role coverage is credible.
- Added a role-based Auto CV that changes emphasis from real skills/evidence, supports A4 Print/Save PDF and JSON export, and excludes XP, coins, streaks and game badges.
- Added a local/demo public talent profile, candidate-controlled privacy and an employer preview that uses the same real profile data. No live company discovery, authentication or server verification is claimed.
- Added browser repository abstractions and separate versioned keys for career profile, skill evidence, CV preferences and `localCandidateId`; `debit-credit-world-v2` remains intact.
- Added future-only assessment and hiring relationship interfaces without implementing Chapter 2, Verified Career Mode or company hiring infrastructure.
- Renamed the old player view to Game Profile in navigation and copy, and linked it to Career Profile. First Shift completion now provides a compact “Professional Evidence Added” transition to the Skill Passport.

Routes:

- `/[locale]/career-profile`
- `/[locale]/career-profile/edit`
- `/[locale]/career-profile/skills`
- `/[locale]/career-profile/skills/[skillId]`
- `/[locale]/career-profile/cv`
- `/[locale]/career-profile/employer-preview`
- `/[locale]/talent/[slug]`

Validation added in `tests/career-profile.test.ts`, `tests/career-ui.test.tsx` and `artifacts/verify-career-profile.mjs`. Browser verification passed Arabic RTL, English LTR, skill drill-down, CV print media, employer preview, link privacy, zero page errors and 390px with zero horizontal overflow. Full technical check and publication details are recorded after the final build and deployment. Detailed design and model documentation: `CAREER-PROFILE-SKILL-PASSPORT.md`.

Final local verification for this phase:

- `npm run check`: passed through the system npm CLI (the user's roaming npm shim is incomplete).
- ESLint: passed with zero warnings.
- TypeScript: passed.
- Vitest: 198 tests passed across 25 files.
- Next.js production build: passed; all new routes were collected successfully.
- Career browser QA: Arabic RTL, English LTR, dashboard, skill drill-down, CV, print media, employer preview, local share privacy and 390px passed with zero page errors and zero horizontal overflow.
- First Shift browser regression: both locales, mobile, entries, processed tray, persistence, focus and rewards passed.
- Nature of Accounts browser regression: Arabic/English desktop, 390px, search, categories, selection, compatibility routes and return context passed.
