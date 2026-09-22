# Account City / مدينة الحسابات

## Purpose and route

`/[locale]/account-guide` now renders a playable accounting city instead of the open-book presentation. The legacy `/[locale]/academy/account-guide` entry renders the same city. All existing bookmarks and First Shift links still resolve. The city is for discovery and beginner practice; accepted company postings still happen in First Shift and the canonical Journal.

## Visual and district architecture

The reference-matched desktop layout has a game navigation bar, an eight-stage career rail, a large central city, Kareem guidance, and mission, recommendation, tool, and challenge panels. `public/platform/account-city-world.png` is environment art only, and `public/platform/account-city-kareem.png` is a transparent mentor portrait. The six district markers, central hub, progress, buttons, account buildings, search, dialogs, and text are React/HTML. Keyboard focus and Escape work for overlays; reduced-motion preferences disable movement animation.

| District | Authoritative count | Visual area |
| --- | ---: | --- |
| Assets | 62 | Blue bank and vault |
| Liabilities | 40 | Amber supplier area |
| Equity | 10 | Gold capital tower |
| Revenue | 23 | Green sales towers |
| Expenses and Costs | 54 | Coral operations area |
| Contra Accounts | 8 | Violet reflective area |

All 197 account records come from `data/account-learning-guide.ts`. That file and the accounting engine were not changed. The city derives each district count from the actual records. Featured buildings show at most six accounts; the collection pages through the remainder in groups of 24. Search matches Arabic and English names, code, category, and district, then opens the result as a city location. No 197-building DOM or image set is loaded on entry.

## Discovery and Account Inspector

`debit-credit-account-city-v1` stores a versioned, validated local record of visited districts, answered district examples, discovered account codes, practiced account codes, and completed quests. Invalid codes or unknown IDs are discarded when reading. Discovery starts at the actual local count; it is not fabricated from a reference screenshot. Visiting a district and opening an account update only this game collection state.

The Account Inspector reads the existing account fields: code, names, category, normal balance, increase/decrease sides and effects, financial-statement placement, supporting documents, document cycle, and example. The seven-step flow reveals account meaning, statement placement, animated value movement, documents, then a transaction story. The approved journal example is revealed after completing the account's short decision mission. Related-account links are extracted only from account names explicitly present in the approved example text. Game location names such as Cash Vault are UI labels, not alterations to account names or codes.

For records whose detailed explanations have no approved English translation, the English interface keeps the original Arabic source text rather than inventing accounting explanations.

## Quests and practice boundary

- **The Six Families:** enter each of the six districts and answer its account-nature example. Completion awards game XP only.
- **Follow the Money:** trace a credit sale, receivable, bank collection, unpaid office-supplies bill, expense, and cash payment using existing account codes.
- **Debit or Credit?:** analyze rent paid from Cash in account-pair, direction, then side decisions.
- **Build the Transaction:** the beginner boss asks for the equipment/payables pair and its debit/credit directions before revealing the entry.
- **Account mini mission:** decide the increase side for the open account. Wrong answers lower the deterministic game-practice score and increase attempts.

All missions reuse the existing game activity engine, with the city's coin award removed so rewards are XP-only. First completion is idempotent. Visits, reading, and missions do not write Skill Passport evidence or grant Demonstrated/Verified status. Professional competence still comes from the existing case/evidence engine.

## First Shift and tools

The First Shift workbench opens Account City in a separate tab with `return=first-day`, the document ID, and the selected account code. Direct links such as `?account=cash` and `?account=accounts-payable` also focus the relevant account. The city reads and writes only its own discovery key and player game-practice progress; it never writes the First Shift game/case/draft store. Returning to First Shift uses its existing persisted case restoration. Ledger, Trial Balance, Financial Statements, Journal, Inbox/Documents, and Account City keep their canonical routes; the calculator is local arithmetic.

## Responsive, accessibility, and validation

At 390px and 430px, the city becomes a horizontally swipable district strip followed by mission, recommendations, tools, challenges, discovery, and career journey, with bottom navigation. Account Inspector occupies the phone width. Semantic buttons and links support mouse, touch, keyboard, focus, Escape, and reduced motion. The browser QA matrix covers Arabic RTL dark desktop, English LTR dark desktop, Arabic light desktop, and Arabic dark 390px/430px mobile with zero horizontal overflow and no page errors. Captures are under `artifacts/account-city/`.

The focused tests protect the 197-record count and each category count, a fingerprint of codes/names/category/nature/movement/statement placement, the preserved source-file hash, the new active UI fingerprint, city interactions, persistence, contextual First Shift entry, evidence boundaries, quests, search, routes, language, and theme. On 2026-09-19, the full `npm run check` passed with zero ESLint warnings, a clean TypeScript check, 270 passing tests in 32 files, and a successful Next.js production build.

## Known limits

Discovery and quests are local to this browser. The city offers short introductory examples and one beginner boss; it does not create company journal entries, a backend leaderboard, employer verification, or Chapter 2. Detailed English account explanations await approved translations. The original Markdown account reference remains downloadable at `/docs/nature-of-accounts.md` for users who need a file, while the website route is now the playable city.
