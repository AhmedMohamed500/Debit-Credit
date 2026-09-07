# Chapter 1 — First Day

## Delivery status

The first playable office experience has been implemented inside the existing Debit & Credit project. This release is intentionally limited to **Chapter 1 — First Day** so the cinematic accounting-game direction can be reviewed before any later chapter is produced.

The internal **Nature of Accounts / طبيعة الحسابات** module was not modified.

## Experience delivered

- A bright, cinematic Mizan Trading office scene with the recurring Finance Manager character.
- A visible five-step chapter journey: Welcome, Meet the Manager, Today's Tasks, Solve & Record, and Complete Day.
- Three playable accounting documents:
  1. Supplier Invoice — EGP 100,000
  2. Customer Receipt — EGP 75,000
  3. Office Expense — EGP 2,500
- Company overview showing assets, liabilities, monthly revenue, and monthly profit.
- Mission preview, career progression, skill focus, XP, coins, and chapter completion state.
- Responsive English and Arabic layouts, including RTL support and a stacked mobile experience.

## Real gameplay loop

Each document follows the same real interaction loop:

1. Inspect the source document and its business context.
2. Select the relevant accounts.
3. Enter debit and credit amounts.
4. Submit the journal entry for validation.
5. Receive immediate accounting feedback.
6. Record a successful entry in the player's journal.
7. Update company state and chapter progress.

Incorrect entries do not change the journal, company state, or rewards. Completed documents cannot be rewarded twice.

## Accounting logic

| Document | Debit | Credit | Company impact |
| --- | --- | --- | --- |
| Supplier Invoice | Equipment 100,000 | Payables 100,000 | Assets +100,000; liabilities +100,000 |
| Customer Receipt | Bank 75,000 | Receivables 75,000 | Asset reclassification; no net change to total assets |
| Office Expense | Office supplies expense 2,500 | Cash 2,500 | Assets -2,500; profit -2,500 |

After all three correct entries:

- Total assets: **EGP 1,347,500**
- Total liabilities: **EGP 830,000**
- Monthly revenue: **EGP 420,000**
- Monthly profit: **EGP 82,500**

## Progress and rewards

- Chapter mission reward: **+100 XP**
- Chapter mission reward: **+50 Coins**
- Rewards are recorded once after all three documents are completed correctly.
- Chapter 2 remains locked and has not been implemented in this release.

Progress is persisted through the project's existing game-state storage rather than through a separate demo state.

## Main implementation files

- `components/campaign/first-day-screen.tsx`
- `app/first-day.css`
- `lib/campaign/first-day.ts`
- `components/campaign/game-app.tsx`
- `public/game/first-day-cinematic.png`
- `tests/first-day.test.ts`
- `tests/campaign-ui.test.tsx`

## Verification

The release passed the complete project verification command:

```text
npm run check
```

Results:

- ESLint: passed
- TypeScript: passed
- Tests: **176 passed across 22 test files**
- Protected Nature of Accounts regression test: passed
- Next.js production build: passed

## Review routes

- Arabic: `/ar`
- English: `/en`

## Published review

- GitHub branch: `codex/first-day-cinematic`
- GitHub pull request: <https://github.com/AhmedMohamed500/Debit-Credit/pull/1>
- Vercel Arabic preview: <https://debit-credit-git-codex-1cf0d2-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar>
- Vercel English preview: <https://debit-credit-git-codex-1cf0d2-ahmed-mohameds-projects-c51bc2cc.vercel.app/en>

The Vercel deployment completed successfully through the repository integration and the Arabic route was visually verified after publication.

## Scope boundary

This release proves the First Day gameplay and visual direction only. No Chapter 2 gameplay or wider platform redesign is included.
