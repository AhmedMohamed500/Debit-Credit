# Chapter 1 — First Day

## Current delivery

The existing Debit & Credit project now opens Chapter 1 as a **cinematic accounting game**, not as a dashboard or course page. This release deliberately stops at **Chapter 1 — First Day**. Chapter 2 is represented by a locked teaser only.

Arabic is the default route. English remains available from the compact player HUD.

The internal **Nature of Accounts / طبيعة الحسابات** implementation was not modified. It is available only as an optional Accounting Manual opened from the active document without losing the mission state.

## Cinematic intro

The first visit is a full-screen, five-scene story sequence lasting approximately 11.6 seconds:

1. Arrival at Mizan Trading
2. Meeting Mr. Kareem, the Finance Manager
3. Revealing the three unrecorded transactions
4. Explaining the first shift
5. Handing control of the desk to the player

The scene player supports:

- Automatic scene progression
- Play and pause
- Previous and next scene
- Replay
- Skip intro
- Scene timeline and elapsed time
- Arabic RTL and English LTR
- Reduced-motion preferences
- Sound-ready browser events without requiring audio files

`CinematicChapterIntro` accepts both `mode: "scene"` and `mode: "video"`. A future MP4/WebM can therefore replace the current scene sequence without rebuilding the chapter flow.

## Story and character system

Reusable story data supports chapter ID, chapter title, scenes, character, dialogue, background, duration, and completion sequence.

Reusable character definitions currently include:

- Finance Manager
- Player
- CFO
- Senior Accountant
- Cashier
- Storekeeper

Chapter 1 uses the same Finance Manager and Mizan Trading office throughout the intro, live mission, feedback, and end-of-day scene.

## First shift gameplay

The cinematic reveals a light professional accounting workspace. The player chooses which document to inspect first:

1. Supplier Invoice — EGP 100,000
2. Customer Receipt — EGP 75,000
3. Office Expense — EGP 2,500

The documents appear as physical work items on a desk with a document tray, sticky note, journal, calculator, pen, and paper treatment rather than a generic card grid.

Each document follows this playable loop:

1. Inspect the source document and all transaction details.
2. Decide whether to record it, consult the Accounting Manual, or ask Mr. Kareem for a hint.
3. Select an active journal line.
4. Choose an account token.
5. Place it on the Debit or Credit side.
6. Enter the amount.
7. Add the second journal line.
8. Submit the entry.
9. See a company consequence or a recorded-entry sequence.
10. Choose the next document.

## Accounting and consequence logic

| Document | Debit | Credit | Accepted company impact |
| --- | --- | --- | --- |
| Supplier Invoice | Equipment 100,000 | Payables 100,000 | Assets +100,000; supplier balance +100,000 |
| Customer Receipt | Bank 75,000 | Receivables 75,000 | Bank +75,000; customer balance -75,000 |
| Office Expense | Office supplies expense 2,500 | Cash 2,500 | Cash -2,500; profit -2,500 |

Wrong entries are not written into the accepted journal, but they now create a visible and persisted story consequence:

- Ledger error count increases.
- The unreconciled amount is shown.
- The document is marked as needing correction.
- The relevant balance problem is explained.
- Mr. Kareem reacts with a short contextual line.
- The issue disappears when that document is recorded correctly.

The live company panel is derived from game state and includes:

- Pending documents
- Pending entries
- Cash balance
- Bank balance
- Supplier balance
- Customer balance
- Month-end progress
- Ledger errors and unreconciled amount

After all three correct entries:

- Total assets: **EGP 1,347,500**
- Total liabilities: **EGP 830,000**
- Monthly revenue: **EGP 420,000**
- Monthly profit: **EGP 82,500**
- Cash: **EGP 247,500**
- Bank: **EGP 555,000**
- Supplier balance: **EGP 830,000**
- Customer balance: **EGP 245,000**
- Pending entries: **0**
- Ledger errors: **0**

## Rewards and evidence

- Every uniquely completed document: **+25 XP and +10 Coins**
- Final Chapter 1 mission: **+100 XP and +50 Coins**
- Total available for the chapter: **175 XP and 80 Coins**
- Duplicate submissions cannot grant duplicate rewards.
- Attempts, mistakes, correctness, and hint usage are recorded in the existing evidence system.
- Skill growth is shown quietly after gameplay rather than as a dominant dashboard.

## End-of-day cinematic

Completing all three documents triggers a second full-screen cinematic sequence:

1. The books are balanced.
2. Mr. Kareem reviews the player's first day.
3. Chapter 2 — The First Shift is teased.

The teaser mentions customer payments, supplier invoices, cash expenses, and a first investigation. Chapter 2 remains locked and no Chapter 2 gameplay was implemented.

## Mobile and accessibility

- The layout has dedicated breakpoints down to 390px.
- Mobile order prioritizes cinematic, mission, document, gameplay, consequence, reward, then progress.
- Documents stack vertically on small screens.
- Journal account tokens remain horizontally scrollable and touch-friendly.
- Primary mobile copy and controls use approximately 16px or larger text.
- Focus styles, semantic dialogs, accessible names, keyboard Escape, and reduced-motion behavior are included.
- No horizontal desktop workspace grid is forced on mobile.

## Main implementation files

- `components/campaign/cinematic-chapter-intro.tsx`
- `components/campaign/first-day-screen.tsx`
- `lib/campaign/first-day-story.ts`
- `lib/campaign/first-day.ts`
- `app/first-day.css`
- `public/game/first-day-cinematic.png`
- `tests/first-day.test.ts`
- `tests/campaign-ui.test.tsx`

## Verification

The complete project verification command passed:

```text
npm run check
```

Results:

- ESLint: passed with zero warnings
- TypeScript: passed
- Tests: **178 passed across 22 test files**
- Protected Nature of Accounts regression: passed
- Next.js production build: passed

## Routes

- Arabic: `/ar`
- English: `/en`
- Root `/` redirects to Arabic.

## Published review

- GitHub branch: `codex/first-day-cinematic`
- GitHub pull request: <https://github.com/AhmedMohamed500/Debit-Credit/pull/1>
- Vercel Arabic preview: <https://debit-credit-git-codex-1cf0d2-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar>
- Vercel English preview: <https://debit-credit-git-codex-1cf0d2-ahmed-mohameds-projects-c51bc2cc.vercel.app/en>

The Vercel links above follow the branch alias and will point to the latest successful deployment after this update is published.

## Scope boundary

No wider platform redesign and no full Chapter 2 implementation are included. This delivery refines Chapter 1 only.
