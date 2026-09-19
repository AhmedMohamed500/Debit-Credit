# Chapter 2 — Closing Week

## Current status

The Month-End engine and workstream contract are implemented. The visual Mizan route remains locked until the connected supplier, customer and bank prerequisites have approved playable cases. This avoids exposing a decorative chapter that cannot preserve accounting consequences.

## Workstreams

- Bank Reconciliation
- AP Review
- AR Review
- Accruals
- Prepayments
- Fixed Assets and Depreciation
- Adjusting Entries
- Trial Balance Review and substantiation

Each workstream declares required supporting evidence and whether it is a critical close blocker. A task marked resolved without all evidence and approval is stored as blocked.

## Boss rule

**Close the Month** checks every workstream. Any unresolved workstream returns `CLOSE BLOCKED` with named critical blockers. Only a fully supported set returns `MONTH CLOSED` and records the close time.

The engine does not create entries itself. Accepted adjustments must continue through the existing journal, ledger and evidence systems.
