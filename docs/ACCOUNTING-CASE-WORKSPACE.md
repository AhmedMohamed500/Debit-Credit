# Accounting Case Workspace — First Shift vertical slice

## What shipped

`/[locale]/game/first-shift` opens a full-screen `AccountingCaseWorkspace` inside the existing Mizan Trading shift. It is a React workspace, not a rasterized mockup. The player receives assigned work in an inbox, inspects structured sources, records field comparisons, prepares a journal workpaper, chooses a professional action and sees its accounting/control consequence. The three original First Shift cases and their accepted ledger logic remain in place. Bank reconciliation links to its existing workpaper; it was not reimplemented here.

The workspace has a dark Mizan top bar, a physical left inbox, a dominant case/document surface, Kareem/policy/decision area on the right, and a lower matching/journal workbench. Arabic RTL and English LTR share the same component. On narrow screens the five-step navigation progressively exposes documents, matching, journal, decision and result instead of shrinking the desktop grid. Styles are in `app/accounting-workspace.css`.

## Architecture and data flow

| Layer | Responsibility |
| --- | --- |
| `components/campaign/first-day-case-workbench.tsx` | `AccountingCaseWorkspace`, document viewer, inbox, stepper, journal builder, manager/policy panels and result. Props are derived from the existing case definition/runtime rather than a separate gameplay store. |
| `components/campaign/first-day-screen.tsx` | Connects workspace callbacks to the First Shift campaign state and local persistence. |
| `lib/cases/first-shift-cases.ts` | Case metadata, document facts, required evidence, comparison fields and available actions. |
| `lib/cases/supplier-invoice-work.ts` | Structured Alpha Supplies invoice/PO/receipt scenario and arithmetic helpers. |
| `lib/cases/engine.ts` | Append-only inspection, field-match, action, submission and resolution events; old-save migration. |
| `lib/campaign/first-day.ts` | Existing semantic entry validation, accepted ledger mutation and game reward. |
| `lib/career/evidence.ts` | Existing conservative projection into local professional evidence; no XP-to-skill shortcut. |

The current component is a reusable **First Shift case shell** with case-definition-driven document/action content. Its journal account catalog and specialized supplier paper are still First Shift-specific; supporting additional transaction families should extract these into case-type adapters rather than copying the whole screen.

## Supplier invoice control file

Alpha Supplies invoice `INV-1048`, PO `PO-771` and GRN `GRN-771` describe 3 office desks × EGP 30,000 and 5 chairs × EGP 2,000: subtotal and payable **EGP 100,000**. The introductory source explicitly has **zero billed VAT and zero freight**; no tax or delivery amount is silently omitted from the treatment. The receipt quantities match the order and invoice. Company policy requires both PO and receipt before posting. The accepted entry is Dr Equipment EGP 100,000 / Cr Suppliers EGP 100,000. VAT/freight scenarios need explicit source terms and separate treatment tests when introduced.

Opening the invoice records its inspection. PO and GRN must be opened. Four source comparisons require the player's explicit verdict; a wrong verdict is recorded but does not satisfy the post gate. The workpaper totals debit, credit and difference, supports up to six rows, and preserves local draft values. An incomplete or unbalanced workpaper cannot post. A balanced but semantically wrong entry is rejected by the existing accounting engine; accepted books remain untouched. Posting is idempotent and uses the existing journal, company status and reward path.

Hold, request information and escalate move the case to waiting without posting. The result shows reviewed documents, decision, accounting and control effects, Kareem's feedback, separate game XP, and links to Skill Passport, Career Gap and ATS CV when posting succeeds. Links are not claims of an earned professional credential: the existing evidence projector decides qualification from case events and performance.

## Verification and limits

Tests cover inspection/matching gates, source math, rejected comparison, save/restore, protective actions, invalid/unbalanced posting, accepted journal and bilingual UI. `npm run check` passed on 2026-09-27: zero-warning ESLint, TypeScript, 372 Vitest tests across 53 files, and the Next.js production build. Browser QA found no horizontal page overflow at 1920×1080, 1440×900, 1366×768, 430×932 and 390×844. Visual QA artifacts are under `artifacts/accounting-workspace/`.

This release does **not** introduce a backend, employer verification, a real supplier system, role-specific approval powers, or the proposed quantity-mismatch follow-up case. Existing local profile and evidence boundaries are unchanged. The next vertical slice should be a 50-invoiced/45-received supplier discrepancy requiring hold/investigation before any liability is accepted.
