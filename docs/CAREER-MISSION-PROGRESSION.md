# Career Mission Progression

## Mizan Trading responsibility path

Mizan Trading now has an explicit progression projection over the existing game routes:

1. **First Shift** — inspect and post supported documents.
2. **Supplier Control** — own invoice matching and supplier exceptions.
3. **Customer Control** — investigate receipts and protect allocation.
4. **Bank Control** — reconcile the movements created upstream.
5. **Close Readiness** — resolve remaining risks before month-end.

First Shift is the implemented opening chapter. Supplier and Customer routes are available foundations. Bank Control and Close Readiness remain locked previews until their connected playable case sets are approved.

## Unlock rules

Progress uses mission completion and professional outcomes rather than XP. Completing First Shift opens Supplier and Customer Control. Both must be resolved before Bank Control opens. Bank Control must be resolved before Close Readiness opens.

`Hold` and `Escalate` remain legitimate case outcomes, but they do not falsely mark processing work complete. Mission recording is idempotent, so a saved outcome cannot be replayed for progression.

## Storage compatibility

`BrowserCompanyProgressionRepository` owns `debit-credit-company-progression-v1`. The migration can project the existing `first-shift` completion into the new company path without changing the original game save, journal, ledger, Account City, Skill Passport or Career League records.
