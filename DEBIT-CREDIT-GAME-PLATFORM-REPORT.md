# Debit & Credit

## by Money Coder

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
