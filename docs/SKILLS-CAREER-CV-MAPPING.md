# Skills, Career Roles, and Auto CV Mapping

## Evidence pipeline

`Gameplay → Evidence → Skill Passport → Job Role → Career Profile → Auto CV → Employer Preview`

Every professional claim retains its case/activity source, attempts, assistance, inspected evidence, performance dimensions, and classification rationale. XP, Coins, streaks, badges, Game Level, and league rank are excluded.

## State and CV rules

- **Unassessed:** no qualifying evidence; omitted from the CV.
- **Practiced:** introductory/guided evidence, one case, multiple attempts, significant assistance, or evidence below Demonstrated strength. Appears under Accounting Practice / Skills in Development.
- **Demonstrated:** sufficient distinct, successful, investigated, low-assistance evidence under the conservative Skill Passport rules. May appear under Core Accounting Skills.
- **Verified:** reserved for a future trusted server assessment source. Local gameplay cannot grant it.

Historical evidence remains readable and is not destructively downgraded. Target-role changes reorder supported skills, evidence, and bullets; they never invent experience.

## Skill mapping

| Skill | Main related roles | CV behavior | Recommended current/future mission |
| --- | --- | --- | --- |
| Accounting Fundamentals | Junior Accountant | Practiced/Core by state | Accounting Foundations |
| Account Classification | Junior, Cost, Junior Auditor | Practiced/Core by state | Nature of Accounts |
| Debit & Credit | Junior Accountant | Practiced/Core by state | Money Flow / Journal Practice |
| Document Analysis | Junior, AP, AR, Treasury, Inventory, Junior Auditor | Evidence-backed case bullet where specific documents were inspected | First Shift / Detective |
| Journal Entries | Junior, General, AP, AR, Treasury, Cost, Inventory, GL, Junior Auditor | Core only when Demonstrated | Journal Entry Challenge / First Shift |
| Ledger Posting | General, Inventory, GL | Practiced/Core by state | Ledger missions |
| Trial Balance | Junior, General, GL, Junior Auditor | Practiced/Core by state | Trial Balance practice; Closing later |
| Error Detection | Junior, AR, Cost, Inventory, Junior Auditor | Practiced/Core by state | Accounting Detective |
| Bank Reconciliation | Junior, General, AP, AR, Treasury, Junior Auditor | Omitted until evidence exists | Closing Week; locked |
| Accounts Payable | AP, Treasury | Supplier case bullet only with supporting evidence | Supplier Invoice Investigation |
| Accounts Receivable | AR, Treasury | Receipt case bullet only with supporting evidence | Customer Receipt Investigation |
| Cash & Treasury | AR, Treasury | Practiced/Core by state | Money Flow and receipt/payment cases |
| Adjusting Entries | General, GL | Omitted until evidence exists | Closing Week; locked |
| Financial Statements | General, Cost, GL, Junior Auditor | Practiced/Core by state | Reporting missions |
| Month-End Closing | General, GL | Omitted until evidence exists | Month-End Crisis; locked |
| Inventory Accounting | Cost, Inventory | Omitted until evidence exists | Logistics department cases; planned |
| Cost Accounting | Cost, Inventory | Omitted until evidence exists | Cost track; planned |
| Expense Recognition | AP | Office-expense bullet only when evidence supports it | Office Expense case |
| Supplier Documents | AP | Supplier review bullet only when PO/receiving evidence was inspected | Supplier Invoice Investigation |

## Role requirements

Role readiness uses normalized weights in `lib/career/catalog.ts`. Junior emphasizes journal entries, classification, debit/credit, and documents. General and GL emphasize journal, ledger, trial balance, adjustments, reports, and close. AP emphasizes supplier obligations/documents. AR emphasizes customer balances, receipts, and cash. Treasury emphasizes cash and bank reconciliation. Cost and Inventory emphasize their specialist evidence. Junior Auditor emphasizes error detection and document analysis.

Readiness remains unavailable until coverage is credible. Missing required skills drive the next recommended mission. If the best recommendation belongs to Closing, the Career Hub shows it as locked rather than pretending it is playable.

## Simulation bullets

The CV generator currently supports specific claims for reviewed supplier evidence, investigated customer receipts, reviewed office expense documents, and protective actions when evidence was insufficient. Each bullet references a real `evidenceId`. `Mizan Trading — Accounting Career Simulation` is always labeled as simulation and never as employment.

## Employer explanation

The local player Employer Preview reads the same evidence pipeline. The separate Talent portal uses clearly labeled deterministic demo profiles for filtering and comparison. Candidate drilldown shows target role, role coverage, attempts, case complexity, investigation, accounting judgment, risk awareness, strong skills, and development needs. There are no real employer accounts or discovered candidates.
