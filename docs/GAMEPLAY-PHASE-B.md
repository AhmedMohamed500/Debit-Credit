# Gameplay Phase B — Accounting Work Simulation

Status: **implemented and tested locally** on branch `codex/gameplay-phase-b`. The experience is frontend-only and local-only. Chapter 2 remains planned and locked. Current gameplay can produce conservatively calibrated **Practiced** or **Demonstrated** skill states, never Verified.

## Gameplay philosophy

First Shift now treats the player as a junior accountant at Mizan Trading. Each work item arrives as a business case with a request from Kareem, a source document, supporting evidence, an action decision, an optional journal entry, and a consequence derived from accepted accounting state. The learning loop is:

`Case received → inspect evidence → choose a defensible action → prepare/post when required → see company impact → generate professional evidence`

XP and Coins remain for save compatibility and game progression, but they are secondary in the case result and are excluded from professional evidence and CV output.

## Accounting Case model

Implemented in `lib/cases/`:

- `AccountingCaseDefinition` contains business context, manager request, source/supporting documents, possible actions, journal requirement, accounting reference, guidance, and optional connected-case/consequence/account-state fields.
- `AccountingCaseRuntime` stores deterministic case status, stable attempt ID, reviewed documents, decisions, submission count, manager help count, and resolution time.
- `CaseDocumentDefinition`, `CaseMessageDefinition`, `CaseInvestigationStep`, `CaseActionDefinition`, and `CaseConsequenceDefinition` form reusable scenario data.
- Supported statuses are `new`, `opened`, `investigating`, `waiting`, `ready`, `resolved`, and `escalated`.
- The action vocabulary supports posting, holding, rejecting, requesting information, contacting business parties, inspecting controls, escalating, deferring, and reconciling. First Shift exposes only the actions that make sense for each introductory case.

The three implemented cases preserve the existing protected accounting results:

| Case | Required review | Accepted accounting |
|---|---|---|
| Supplier invoice | Invoice, PO-771, GRN-771 | Dr Office Equipment / Cr Accounts Payable — EGP 100,000 |
| Customer receipt | Receipt, BA-312, SI-2041 | Dr Bank / Cr Accounts Receivable — EGP 75,000 |
| Office expense | Voucher, petty-cash support, expense policy | Dr Office Supplies Expense / Cr Cash — EGP 2,500 |

A Post decision is blocked until every required document is reviewed. Hold and request/contact choices are meaningful recorded decisions and never mutate the approved ledger. The existing semantic validator still rejects a balanced entry with the wrong accounts.

## Event architecture and attempts

`GameState.casework.events` is an append-only, versioned stream. Every meaningful event includes a stable event ID, schema/scenario/rubric versions, timestamp, chapter, case, attempt, local candidate, payload, outcome, and accounting reference.

Current event types cover shift start, case receipt/open, document review, action selection, entry submission, manager help, accepted posting, case resolution, delayed consequence scheduling/reveal, and shift completion. Duplicate document review, help, resolution, reward, and double-submit callbacks use stable IDs or existing guards and remain idempotent.

One stable attempt currently represents one First Shift case: `first-shift/{caseId}/attempt-1`. Individual entry submissions are events inside that attempt. This separates actual submissions from document clicks and allows a later retry policy without rewriting existing evidence.

## Performance projection

`lib/cases/performance.ts` derives results from recorded behavior rather than UI counters:

- Accuracy: accepted semantic posting and the number of submissions.
- Independence: manager assistance requests.
- Investigation: required supporting evidence reviewed before the first Post decision.
- Documentation: supporting evidence reviewed during the case.
- Risk awareness: required evidence inspected before the first Post decision, limited credit for a professionally appropriate protective action while evidence is missing, and a penalty for every recorded blocked Post decision. Unsafe attempts never add credit, and repeats cannot improve the score.
- Accounting judgment: accepted resolution with penalties for premature or alternate actions.
- Overall: 30% accuracy, 25% judgment, 20% investigation, 10% documentation, 10% risk awareness, and 5% independence.

Scores are deterministic, clamped to 0–100, and projected per case and for the full shift. Kareem's end-of-day response is selected from the same performance projection.

## Skill Passport evidence projection

Resolved Phase B cases create one stable resolution evidence record per related skill. The projection includes the case/attempt IDs, scenario/rubric versions, inspected supporting documents, decision trace, performance dimensions, submissions, help usage, first-attempt status, and a bilingual rationale explaining why the skill changed.

The Career Profile detail view displays that rationale and reviewed evidence. New case projection replaces the earlier per-submit evidence for the same candidate/activity/skill. Historical records remain readable; missing historical first-attempt data migrates to `Unknown` rather than being misreported as failure. Legacy saves without Phase B events continue through the original attempt projection.

The introductory First Shift is calibrated conservatively. One or two successful guided cases remain **Practiced**. **Demonstrated** requires three distinct qualifying introductory cases for the same skill, each completed correctly on the first attempt with at most one manager-assistance request and at least 80% investigation and accounting judgment. Multiple attempts, significant help, or insufficient pre-decision investigation keep that evidence at Practiced. Existing projection-version-1 evidence keeps its historical calculation, so saved evidence is not destructively downgraded. `Verified` remains impossible for local-only gameplay and reserved for future trusted assessment sources.

## Storage and migration

The canonical key remains `debit-credit-world-v2`; no destructive key migration was introduced. `casework` is an optional additive field in `GameState`, so old saves remain valid. On read:

1. a valid Phase B casework snapshot is merged with current defaults;
2. an old save without casework receives a new empty casework structure;
3. previously completed First Shift documents are projected as resolved runtime cases without changing journals, balances, rewards, or old evidence;
4. missing arrays such as scheduled consequences default safely to empty.

Career evidence continues under `debit-credit-skill-evidence-v1` with a projection version field and non-destructive normalization.

## Manager assistance and consequences

Each case offers two progressive, context-specific Kareem guidance messages. Requests are event-tracked, capped, saved, and reflected in Independence and the final review. Guidance does not reveal or change the ledger directly.

Accepted postings continue through the existing accounting engine and therefore drive real Mizan Trading balances, pending document/entry counts, journal entries, Processed Tray state, and shift rewards. Rejected submissions create attempt evidence and feedback while leaving the approved ledger unchanged.

`lib/cases/consequences.ts` provides a tested local foundation for scheduling a consequence now and revealing it after a connected case or at shift end. First Shift does not inject a fake delayed error. A future intentionally posted mistake must be represented by explicit posting and consequence events before it can affect balances.

## First Shift experience

Implemented changes include:

- dynamic 09:00–16:30 workday clock and incoming case count;
- realistic file review with physical source/supporting documents;
- professional action decision before journal preparation;
- progressive manager guidance and saved workpaper draft;
- protected posting feedback and actual company-state refresh;
- professional case metrics and reduced visual emphasis on rewards;
- end-of-day review for accuracy, investigation, judgment, independence, and cases handled;
- direct explanation link to Skill Passport evidence;
- subtle optional Web Audio feedback for paper/open, rejected posting, and accepted posting, muted by default with an accessible control;
- Arabic RTL, English LTR, keyboard dialog trapping, Escape close, reduced-motion support, and 390px layout.

## Chapter 2 seam

`lib/cases/chapter-two.ts` defines locked, non-routable metadata for **Closing Week — The Month-End Crisis** and the planned month-end workstreams: bank reconciliation, AP review, AR review, adjustments, accruals, prepayments, trial balance, and close readiness. The general case model supports connected case IDs and delayed consequences.

Chapter 2 has no playable route, fabricated tasks, unlock action, or claimed completion in this phase.

## Verification and artifacts

Automated coverage is in `tests/casework.test.ts`, `tests/campaign-ui.test.tsx`, `tests/career-profile.test.ts`, `tests/career-ui.test.tsx`, and the existing accounting regression suites. Focused regressions compare careful and rushed posting behavior, cover conservative Practiced/Demonstrated thresholds and historical evidence compatibility, and verify that the Skill Passport explains attempts, manager assistance, inspected evidence, and the classification reason without game economy values. Browser automation is recorded in `artifacts/verify-first-shift.mjs` and `artifacts/gameplay-phase-b-qa.json`.

Screenshots:

- `artifacts/gameplay-phase-b-desk-ar.png`
- `artifacts/gameplay-phase-b-case-ar.png`
- `artifacts/gameplay-phase-b-mobile-desk-ar.png`
- `artifacts/gameplay-phase-b-mobile-case-ar.png`
- `artifacts/gameplay-phase-b-posting-result-en.png`
- `artifacts/gameplay-phase-b-shift-complete-en.png`

Browser QA passed at 1672×941, 1366×768, 1440×900, and 390×844 with zero page errors and zero page-wide horizontal overflow.

Final local quality gate: ESLint passed with zero warnings, TypeScript passed, Vitest passed **218 tests across 26 files**, and the Next.js 16.3.4 production build completed successfully.

## Known limitations and next recommendation

- State and evidence are local-only; there is no authentication, server validation, cross-device sync, or verified assessment.
- The introductory cases use one stable attempt per case; multi-run case policies are planned.
- The audio foundation uses short generated Web Audio tones and depends on user activation/browser support.
- Delayed consequences are implemented as a tested engine seam but are intentionally unused in First Shift.
- Chapter 2 is architecture-ready metadata only and remains locked.

The recommended next milestone is a focused First Shift playtest and tuning pass using actual player behavior: observe where players miss evidence, misuse Hold/Request actions, or misunderstand company impact. Stabilize scoring thresholds and case copy from those findings before implementing any full Chapter 2 content.

## Review and preview

- Branch: `codex/gameplay-phase-b`
- Architecture commit: `43bc76f`
- Skill evidence commit: `751ecc0`
- First Shift experience commit: `1f69465`
- QA/documentation commit: `7d8a659`
- Risk and Skill Passport calibration commit: `74b6bcc`
- Pull Request: <https://github.com/AhmedMohamed500/Debit-Credit/pull/2>
- Stable Vercel branch preview: <https://debit-credit-git-codex-788967-ahmed-mohameds-projects-c51bc2cc.vercel.app>
- Exact deployment status is verified against the current PR head through the Vercel commit check; the stable branch URL above follows that head.
