# Game Hub Layout and Routing Correction

Date: September 13, 2026

Branch: `codex/gamified-academy-platform`

Scope: Mizan Trading Game Hub shell, canonical accounting navigation, and company-zone destinations

## Problem and root cause

The desktop Game Hub inherited page-oriented shell rules: a centered `max-width` container, outer vertical margins, `min-height: 100vh`, and content rows that did not consume the remaining viewport. The combination left unused bands around the game and allowed the old application shell to influence newer nested game routes.

Several Game Hub links also reused legacy destinations. Most critically, Ledger opened the Nature of Accounts reference, while world markers opened unrelated practice or theory routes.

## Full-screen shell correction

Desktop Game Hub now uses a dedicated full-bleed flex shell:

- one 72px primary game header;
- `height: 100dvh` for the desktop game surface;
- the command shell flexes into the exact remaining height;
- the outer centered width and vertical margins are removed;
- the Mizan Trading world consumes the flexible center row;
- command rails use internal scrolling when their content exceeds the available height.

At widths up to 1220px the fixed desktop composition is released. Tablet and mobile use natural document height and browser scrolling. The 390px and 430px checks produced zero page-level horizontal overflow. The compact command navigation remains horizontally usable with its visual scrollbar hidden.

## Canonical navigation map

The shared source of truth is `lib/platform/navigation.ts`.

| Destination | Canonical route |
| --- | --- |
| Game Hub | `/[locale]/game` |
| Inbox | `/[locale]/game/inbox` |
| Missions | `/[locale]/challenges` |
| Journal | `/[locale]/journal` |
| Ledger | `/[locale]/ledger` |
| Trial Balance | `/[locale]/trial-balance` |
| Financial Statements | `/[locale]/financial-statements` |
| Nature of Accounts | `/[locale]/account-guide` |
| Skill Passport | `/[locale]/career-profile/skills` |
| Career Hub | `/[locale]/career` |
| Leaderboard | `/[locale]/leaderboard` |
| Academy | `/[locale]/academy` |

The Platform header and Game Hub sidebar consume this mapping. Compatibility routes remain available for historical URLs, but the current interface links directly to canonical destinations.

## Accounting tool correction

Ledger no longer opens Nature of Accounts. The dedicated Ledger reads accepted entries from `state.journal`, groups movements by account, and shows account code/name, debit, credit, running balance, journal reference, and source document reference. Nature of Accounts remains available only as a secondary account-behavior reference.

Journal shows accepted journal entries only. Trial Balance is projected from accepted Ledger balances. Failed attempts live in professional evidence and never appear as posted movements. Financial Statements show the currently supportable accepted-entry snapshot and explicitly keep the complete reporting package locked until Closing Week; Chapter 2 was not implemented.

## Mizan Trading zone map

| Zone | Route | Current state |
| --- | --- | --- |
| Suppliers | `/[locale]/game/suppliers` | Supplier Invoice case and AP context |
| Customers | `/[locale]/game/customers` | Customer Receipt and AR context |
| Bank | `/[locale]/game/bank` | Customer Receipt, Bank movement access, reconciliation locked |
| Logistics | `/[locale]/game/logistics` | Polished locked Inventory & Receiving zone; no fabricated case |
| Month End | `/[locale]/game/month-end` | Closing Week locked; requirements and topics preview only |

Each zone has a predictable breadcrumb back to Mizan Trading. The map markers consume the same centralized zone configuration, including status, route, relevant skills, and real case IDs.

## Tests and browser QA

Automated coverage verifies canonical Arabic and English localization, Ledger/Nature separation, every zone route, the Month End lock, accepted-entry Ledger projection, balanced Trial Balance projection, the full-screen shell class, and a single game header.

`npm run check` passed through the system npm CLI:

- ESLint: clean with zero warnings;
- TypeScript: passed;
- Vitest: 240 tests passed across 29 files;
- production build: passed and collected all new routes.

Real browser QA passed in Arabic RTL at 1920×1080, 1920×900, 1672×941, 1440×900, 1366×768, 430×932, and 390×844. Every desktop measurement had the header at 0–72px, the game shell immediately after it, and the shell ending at the viewport edge. Page-level horizontal overflow was zero. English LTR and Dark Mode were also checked. Interactive navigation verified Ledger, Bank, Suppliers, Customers, Logistics, Month End, and the Mizan Trading back path.

## Review captures

- `artifacts/game-hub-fix/game-hub-ar-1920x1080.png`
- `artifacts/game-hub-fix/game-hub-ar-1366x768.png`
- `artifacts/game-hub-fix/game-hub-dark.png`
- `artifacts/game-hub-fix/ledger-ar.png`
- `artifacts/game-hub-fix/bank-zone-ar.png`
- `artifacts/game-hub-fix/game-hub-mobile-ar.png`
- Machine-readable browser measurements: `artifacts/game-hub-fix/qa.json`
