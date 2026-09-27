# First Shift V2 — Mizan Trading

## Accounting Case Workspace update — 2026-09-27

The approved accounting-workspace visual direction is now an interactive First Shift case shell: physical work inbox, structured document tabs/viewer, explicit four-field supplier matching, persistent journal workpaper, Kareem's instructions, company policy, protective decisions and consequence-first result. Alpha Supplies invoice `INV-1048` reconciles to PO `PO-771` and GRN `GRN-771` for EGP 100,000; this introductory source bills no VAT or freight. Required sources and matching verdicts gate posting. The existing semantic entry validator and accepted-ledger boundary remain authoritative; incomplete, unbalanced and incorrect entries cannot corrupt the ledger. See [workspace design](ACCOUNTING-CASE-WORKSPACE.md) and [decision rules](PROFESSIONAL-DECISION-ENGINE.md).

The next proposed case is a *not-yet-playable* supplier quantity mismatch (50 invoiced versus 45 received). Bank Reconciliation remains its own existing workpaper, linked from the inbox rather than duplicated.

The existing accounting engine and three approved cases remain the authoritative source. The playable finance-office desk at `/[locale]/game/first-shift` presents an inbox, physical source documents, Mizan OS, the journal, ledger, company status, manager Kareem and a processed tray. Opening a case leads through inspection, professional decision, protected journal posting and consequence feedback. The supplier invoice requires invoice/PO/GRN inspection; customer receipt requires receipt/bank advice/sales-invoice matching; office expense requires voucher/receipt/policy review. An unsupported post is blocked and never silently changes accepted books. Hold/request/escalate actions remain part of the case event trace.

The workbench stores drafts, inspected evidence, guidance count and resolution through the existing `lib/cases` and `lib/campaign` state; reload restores them. The completion view distinguishes professional performance from game XP/Coins. Bank Reconciliation is the next playable professional workpaper; the full Month-End chapter remains locked.

Arabic RTL and English LTR copy, keyboard buttons, focus trapping, reduced-motion CSS and mobile document navigation are retained. Phase 2 adds the direct Bank Reconciliation continuation without replacing the case engine.

Limits: the desktop desk is a stylized simulation, not an ERP. The next mission is available from Game Hub and the career map even before shift completion for practice; a future chapter gate can make role-based sequencing stricter without blocking learning.
