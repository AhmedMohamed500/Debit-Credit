# Professional Career Content Engine

## Responsibility before difficulty

Career content is indexed by simulated professional responsibility. Arithmetic difficulty alone cannot move a case to a higher level.

| Level | Simulation level | Primary responsibility |
| --- | --- | --- |
| 0 | Accounting Beginner | Understand |
| 1 | Accounting Student | Record |
| 2 | Graduate / Trainee | Process |
| 3 | Junior Accountant | Process and investigate |
| 4 | Accountant / Functional Accountant | Reconcile and own a process |
| 5 | General / GL Accountant | Review and substantiate the close |
| 6 | Senior Accountant | Control and review other accountants’ work |
| 7 | Chief Accountant / Supervisor | Manage accounting control |
| 8 | Finance Manager | Decide and support the business |

These are simulation levels. They do not grant real-world job titles.

## Case contract

Every case declares a stable ID and version, level, responsibility, persona, company tier, specialist track, prerequisites, accounting objective, game mechanic, case type, skills, evidence rule, role relevance, CV behavior, competition eligibility, content status and review requirements.

The playable boundary includes only `approved` cases. `review-required` content can be shown as a preview but cannot create assessment evidence. `draft` content is excluded from play. This keeps future IFRS, tax, finance leadership and policy content out of professional assessment until reviewed.

## Evidence and repeat control

A case may be `practice-only`, `eligible-practiced` or `eligible-demonstrated`. Eligibility is not an automatic award: the existing performance and evidence projection still decides the final status. Attempt IDs are idempotent. The first successful completion may be reward-eligible; repeating a completed case cannot farm rewards or duplicate professional evidence.

## Adaptive practice

Recommendations filter by level, accessible company tier and specialist track. Within that boundary, unfinished cases and weaker attempts appear before already completed strong cases. Selection is deterministic and explainable.

## Storage

`BrowserCareerContentRepository` owns `debit-credit-career-content-v1`. Its migration drops unknown case IDs and keeps previous valid attempts readable.
