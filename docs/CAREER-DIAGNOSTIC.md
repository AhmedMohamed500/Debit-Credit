# Career Diagnostic

Phase A/B integration: the Game Hub recommends this diagnostic when a career persona/goal is saved but no placement result exists. Its self-reported strengths never create professional evidence. See [PRODUCT-USER-FLOW.md](PRODUCT-USER-FLOW.md).

## Bank Reconciliation follow-through (2026-09-26)

The diagnostic establishes a starting gap; it does not grant a skill. General Accounting, GL and Treasury players can now follow the bank recommendation into a workpaper. After a qualifying case, stored evidence becomes Practiced and the gap is recalculated. One introductory attempt never becomes Verified or a hiring claim.

## Persona-specific cases

| Persona | Cases | Focus |
| --- | ---: | --- |
| Accounting Student | 4 | Classification, debit/credit, journal basics, document support |
| Fresh Graduate | 9 | Practical posting chain, AP, AR, bank and trial-balance judgment |
| Working Accountant | 10 | AP/AR exceptions, bank, accruals, prepayments, cut-off, close and review |
| Experienced Accountant | 6 | Leading review, close ownership, control independence, analysis, cut-off and risk |

Cases are drawn from the existing `lib/placement` architecture, which uses the same accounting subjects as the playable product. One case is shown at a time with a visible progress meter and a decision before advancing. A player may go back and revise an answer.

`evaluatePlacement` produces a score, diagnostic-only strengths and gaps, and a recommended starting track. The result is saved under `debit-credit-placement-v1` with `localOnly: true` and `grantsEvidence: false`. The diagnostic never writes to `debit-credit-skill-evidence-v1`, never marks a skill Verified, and never awards a role. Replaying overwrites only the local placement result.

The result screen combines the diagnostic with the *separate* Skill Passport projection. “Current strengths” means correct diagnostic decisions; “Practiced skills” means saved gameplay evidence; “Skills to develop” means missing evidence for the selected target role. The next mission is selected from the role-specific map and links to an existing route.
