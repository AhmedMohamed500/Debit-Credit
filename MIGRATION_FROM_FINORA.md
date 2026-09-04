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

## Legacy cleanup and technical debt

The new repository contains only the education product. Removal from the FINORA source is intentionally performed only after this project passes all gates and is pushed. Compatibility URLs under `/academy` may be removed in a future major version after saved links have aged out. A real multiplayer leaderboard and cloud synchronization remain future backend work; current progress is local only.
