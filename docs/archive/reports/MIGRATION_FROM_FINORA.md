# Migration from FINORA

## Source and destination

- Source: local `accounting-journal-generator` repository (FINORA), branch `main`.
- Destination: this repository root, `Debit & Credit`.

The extraction copied the original educational content and engines. It did not recreate missions, cases, lessons, or scenarios as placeholders.

## Modules moved

| Old location | New location / route | Treatment |
| --- | --- | --- |
| `app/[locale]/academy` | `/[locale]/learn` and compatibility Academy routes | Reorganized as the learning journey |
| `academy/account-guide` | `/[locale]/account-guide` | Promoted to a primary module |
| `academy/practice` | `/[locale]/journal-entry` | Promoted to journal training |
| `money-flow` | `/[locale]/money-flow` | Moved with engine, scenarios, and progress |
| `missions` | `/[locale]/missions` | Moved with real scenarios, scoring, hints, and storage |
| `academy/detective` | `/[locale]/detective` | Moved with cases, evidence workflow, scoring, and drafts |
| `arena` | `/[locale]/arena` | Moved with career, daily, profile, scoring, CFO messages, and tasks |
| Arena profile/leaderboard | `/[locale]/arena/profile`, `/[locale]/leaderboard` | Rebranded and retained |
| Separate progress stores | `/[locale]/profile` | Added a read-only aggregation layer |

## Extracted dependencies

Only education-facing accounting primitives were extracted: journal totals, balance validation, posting-account selection, and account types. Operational journals, customer/supplier records, invoices, bank reconciliation, tax, workspaces, POS, documents, closing, and reporting were not copied.

## Storage migration

The browser runs `lib/migration/finora-education.ts` once. It copies a recognized old value only when the corresponding new value does not exist, then records `debit-credit-storage-migration-v1`.

| Old key | New key |
| --- | --- |
| `finora-training-arena-v2` | `debit-credit-arena-v1` |
| `finora-training-missions-v1` | `debit-credit-missions-v1` |
| `finora-training-detective-v1` | `debit-credit-detective-v1` |
| `finora-training-money-flow-v1` | `debit-credit-money-flow-v1` |
| `finora-academy-progress` | `debit-credit-progress-v1` |

Migration never removes old keys and never reads or writes operational FINORA keys.

## FINORA cleanup completed

After this project passed lint, typecheck, 115 tests, production build, and manual route checks—and after it was pushed—the source repository was cleaned in commit `5d977c8841871fdde400ef030726776e9f0a864f`.

Removed from FINORA: Academy and training routes, Arena and career routes, Missions, Money Flow, Accounting Detective, learning components, education engines and storage adapters, scenario data, education domain types, tests, Arena assets, educational CSS, sitemap entries, and navigation links. Shared operational accounting primitives and the operational chart of accounts remained because FINORA still uses them. FINORA then passed lint, typecheck, 265 operational tests, and a production build with 65 generated pages.

The source's pre-existing untracked `PROJECT_DOCUMENTATION_AR.md` was preserved and was not included in the cleanup commit.

## Remaining technical debt

Compatibility URLs under `/academy` in Debit & Credit may be removed in a future major version after saved links have aged out. A real multiplayer leaderboard and cloud synchronization remain future backend work; current progress is local only.
