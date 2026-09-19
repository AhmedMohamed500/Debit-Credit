# Persona and Placement System

## Entry personas

The onboarding keeps three self-selected starting contexts:

- Accounting Student
- Fresh Graduate
- Working Accountant

Persona selection only changes recommendations and diagnostic content. It never grants a skill, job title, evidence status, company unlock or CV claim.

## Student route

The default foundation route opens Accounting Bootcamp. A student may choose a four-decision basics check when they already know the foundation. A weak result recommends **Foundation Refresh**.

## Graduate route

The graduate placement contains nine practical decisions covering classification, Debit/Credit, journal entries, source documents, ledger, trial balance, AP, AR and bank reconciliation. A supported result recommends **Graduate Practical Track**; otherwise it recommends **Foundation Refresh**.

## Working Accountant route

The same placement route becomes a ten-case **Career Diagnostic**. It covers supplier and customer exceptions, bank reconciliation, classification, accruals, prepayments, cut-off, month-end sign-off, journal control and review of junior work.

Its output contains:

- current strengths by assessed area;
- corporate skill gaps;
- a recommended starting track;
- an explanation of the recommendation.

The result never declares that the player owns a senior job title. Strong results recommend **General Accounting Practice**. Results with gaps recommend **Corporate Bridge — Foundation**.

## Storage and integrity

`BrowserPlacementRepository` owns `debit-credit-placement-v1`. The saved result is local-only and explicitly stores `grantsEvidence: false`. The migration rejects a result that claims remote status or professional evidence. Existing Career League state continues to store the numeric placement score for backward compatibility.
