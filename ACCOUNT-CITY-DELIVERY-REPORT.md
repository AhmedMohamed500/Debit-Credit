# Account City Delivery Report

## Project

- **Product:** Debit & Credit — by Money Coder
- **Game world:** Mizan Trading
- **Feature:** Account City / مدينة الحسابات
- **Route:** `/[locale]/account-guide`
- **Branch:** `codex/career-league`
- **Pull Request:** [PR #4 — Career League](https://github.com/AhmedMohamed500/Debit-Credit/pull/4)

## Delivered experience

The former Nature of Accounts open-book screen was intentionally replaced by a full-screen playable accounting world. The player now enters a cinematic city, explores real accounting districts, discovers approved accounts, inspects account behavior, follows supporting documents and transaction stories, then completes short practice missions.

The city follows the supplied visual direction with a dark premium game shell, a large central environment, Kareem guidance, a career journey, current mission, recommended accounts, accounting tools, challenges, discovery progress, and a dedicated mobile flow. The environment image is only an artwork layer; all districts, buttons, text, progress, dialogs, search results, account locations, and missions are real React/HTML interactions.

## Six accounting districts

| District | Arabic | Accounts | Visual identity |
| --- | --- | ---: | --- |
| Assets | حي الأصول | 62 | Blue bank, vault, inventory and property area |
| Liabilities | حي الالتزامات | 40 | Amber supplier, tax and loan area |
| Equity | حي حقوق الملكية | 10 | Gold capital and ownership towers |
| Revenue | حي الإيرادات | 23 | Green sales and income district |
| Expenses and Costs | حي المصروفات والتكاليف | 54 | Coral operations and cost centers |
| Contra Accounts | منطقة الحسابات المقابلة | 8 | Violet reflective district |
| **Total** |  | **197** | One connected accounting system |

## Accounting-data protection

The implementation reuses `data/account-learning-guide.ts` as the authoritative source. No account was removed, renamed, or replaced with a smaller demo set. Account code, category, normal balance, increase/decrease behavior, statement placement, documents, cycle, and approved journal example remain sourced from the existing data.

Regression tests protect:

- 197 total accounts.
- The six exact category totals.
- Account IDs and codes.
- Arabic and English names.
- Normal balance and movement rules.
- Financial-statement placement.
- The authoritative data-source fingerprint.
- The active Account City component, model, route, and visual fingerprint.

## Account discovery

Each district is a semantic interactive location inside the city. Entering a district reveals featured account buildings and a paginated collection rather than loading 197 animated buildings at once. Opening an account adds it to the local discovery collection.

Progress is stored under the validated, versioned key `debit-credit-account-city-v1`. Unknown district IDs, quest IDs, or account codes are discarded while loading. Discovery is a game metric only and does not affect Career Readiness or professional evidence.

## Account Inspector

The Account Inspector uses a seven-step progressive flow:

1. Identify the account and what it represents.
2. Show its approved statement placement.
3. Visualize what happens when its value increases.
4. Visualize what happens when its value decreases.
5. Reveal its normal debit or credit nature.
6. Inspect supporting documents and the document cycle.
7. Complete a short decision mission and reveal the approved journal example.

The movement view uses animated direction and value feedback. Reduced-motion preferences remove nonessential movement without removing information.

## Search and navigation

City search supports:

- Arabic account names.
- English account names.
- Account codes.
- Categories and districts.

Search results open the actual account as a city destination. Contextual aliases such as `?account=cash` and `?account=accounts-payable` focus the correct account. Ledger, Trial Balance, Financial Statements, Journal, Documents, and Account City preserve their canonical routes.

## Quests and missions

- **The Six Families:** visit all six districts and answer one nature example per family.
- **Follow the Money:** trace a credit sale, receivable, bank collection, unpaid expense, expense recognition, and cash payment.
- **Debit or Credit?:** determine the account pair, movement, and posting side for rent paid in cash.
- **Build the Transaction:** a beginner boss mission for equipment purchased on credit.
- **Account mini missions:** identify the increase side of the inspected account.

Scoring is deterministic. Wrong answers increase attempts and reduce the practice score. Rewards are idempotent and XP-only; no Coins are granted by Account City.

## First Shift integration

First Shift opens Account City in a separate tab with the current document and selected account. The city reads only its own discovery state and the existing game-practice state. It does not overwrite the active case, inspected documents, current decision, journal draft, or workday state. Returning to First Shift restores the saved case through the existing storage architecture.

## Skill Passport boundary

- Visiting districts creates no professional evidence.
- Reading or discovering accounts creates no professional evidence.
- Beginner mini missions remain local practice and cannot grant Demonstrated or Verified.
- Professional evidence continues to come from the existing case/evidence engine.
- Verified remains impossible through local-only Account City gameplay.

## Languages, themes, and responsive behavior

- Arabic-first RTL interface.
- Complete English LTR interface.
- Dark, Light, and System themes.
- Desktop city-dominant composition.
- Dedicated 390px and 430px mobile flow.
- Horizontally swipable mobile district strip.
- Mobile bottom navigation.
- Full-width mobile Account Inspector.
- No page-wide horizontal overflow.

Keyboard focus, Escape, screen-reader labels, touch targets, visible focus states, and reduced-motion preferences are supported. Color is accompanied by names, icons, and accounting labels.

## Validation result

`npm run check` passed on 2026-09-19:

- **ESLint:** passed with zero warnings.
- **TypeScript:** passed.
- **Vitest:** 270 tests passed in 32 files.
- **Next.js production build:** passed.
- **Focused Account City and First Shift tests:** 21 passed.
- **Browser QA:** no page errors.
- **390px horizontal overflow:** 0px.
- **430px horizontal overflow:** 0px.
- **Arabic RTL:** verified.
- **English LTR:** verified.
- **Light and Dark modes:** verified.

## Visual QA artifacts

- `artifacts/account-city/account-city-ar-dark-1920.png`
- `artifacts/account-city/account-city-en-dark-1920.png`
- `artifacts/account-city/account-city-ar-light-1440.png`
- `artifacts/account-city/assets-district-ar.png`
- `artifacts/account-city/cash-account-inspector-ar.png`
- `artifacts/account-city/cash-mini-mission-ar.png`
- `artifacts/account-city/account-city-mobile-ar-390.png`
- `artifacts/account-city/account-city-mobile-ar-430.png`

## Main implementation files

- `components/academy/account-city.tsx`
- `lib/account-city.ts`
- `app/account-city.css`
- `app/[locale]/account-guide/page.tsx`
- `app/[locale]/academy/account-guide/page.tsx`
- `components/campaign/first-day-case-workbench.tsx`
- `components/game/student-world.tsx`
- `tests/account-city.test.tsx`
- `tests/protected-account-nature.test.ts`
- `tests/campaign-ui.test.tsx`
- `artifacts/verify-account-city.mjs`

## Related documentation

- `docs/ACCOUNT-CITY.md`
- `NATURE-OF-ACCOUNTS-REPORT.md`
- `CAREER-LEAGUE-IMPLEMENTATION-REPORT.md`
- `DEBIT-CREDIT-GAME-PLATFORM-REPORT.md`

## GitHub and Vercel delivery

- **Implementation commit:** `15ccc336152a4126120073ac9b12db5b7b7637df`
- **Commit message:** `feat: transform nature of accounts into account city`
- **PR:** https://github.com/AhmedMohamed500/Debit-Credit/pull/4
- **Vercel deployment state:** successful through the existing GitHub integration.
- **Exact implementation preview:** https://debit-credit-fyr4w05w0-ahmed-mohameds-projects-c51bc2cc.vercel.app
- **Arabic Account City:** https://debit-credit-fyr4w05w0-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/account-guide
- **English Account City:** https://debit-credit-fyr4w05w0-ahmed-mohameds-projects-c51bc2cc.vercel.app/en/account-guide
- **Exact deployed implementation commit:** `15ccc336152a4126120073ac9b12db5b7b7637df`

Vercel Deployment Protection is currently enabled, so the preview may request the project owner's Vercel login. The GitHub/Vercel deployment itself completed successfully. The local Vercel CLI session requires a fresh login before a direct CLI redeploy can be issued.

## Known limitations

- Discovery and quests are stored locally in the current browser.
- Competition is Demo/Local and does not contain online players.
- Account City does not create employer verification or professional evidence.
- Some detailed English explanations retain the approved Arabic source until translations are formally approved.
- The city contains introductory missions and one beginner boss; it does not implement Chapter 2.
- Vercel preview access remains subject to the project's Deployment Protection setting.

