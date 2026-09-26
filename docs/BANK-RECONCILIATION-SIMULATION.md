# Bank Reconciliation Simulation

`/[locale]/game/bank-reconciliation` is a local Mizan Trading workpaper. It has statement, matching/investigation, cash-book and adjustment/summary zones. Desktop rows support drag to ledger; clicking the statement row then ledger row provides the touch/keyboard equivalent. On mobile, the same zones become four steps. The draft persists in `debit-credit-bank-reconciliation-v1`, a profile-scoped key.

## Deterministic source data (EGP)

| Item | Bank statement | Cash book |
| --- | ---: | ---: |
| Opening | 100,000 | 100,000 |
| Delta customer receipt | +40,000 | +40,000 |
| Atlas supplier payment | −18,000 | −18,000 |
| Bank fee | −250 | — |
| Direct customer deposit | +4,000 | — |
| Deposit in transit | — | +6,000 |
| Outstanding cheque | — | −3,000 |
| Closing | **125,750** | **125,000** |

The correct statement-side timing adjustment is +6,000 −3,000 = 128,750. The book requires Dr bank charges expense / Cr bank 250 and Dr bank / Cr accounts receivable 4,000, reaching 128,750. The workpaper does not reveal timing classification in the summary before the player makes it. A numeric zero difference is not sufficient: matching, all classifications and both exact balanced entries must also be correct. Incorrect attempts remain unresolved, with no posting to the company ledger.

`lib/bank-reconciliation/engine.ts` holds the deterministic rules. `tests/bank-reconciliation.test.ts` checks source arithmetic, failed resolution, wrong adjustments, persistence and the evidence boundary. This is an introductory guided case, not a bank-produced statement or a verified professional assessment.
