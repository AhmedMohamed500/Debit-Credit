# Skill Passport → Role → ATS CV Engine

## Evidence flow

Accepted gameplay events project into professional evidence. Evidence projects into Skill Passport states. The selected target role supplies ordering weights. The CV then rebuilds from the same facts.

Changing the target role can change ordering, supported keywords and evidence priority. It cannot create a new fact, skill status or work experience claim.

## Supported outputs

- browser print / Save PDF;
- selectable Plain Text CV;
- versioned JSON career-data export.

The CV remains single-column and uses standard headings. Simulation bullets are deduplicated by evidence-backed text and remain explicitly under Accounting Simulation Experience.

## ATS format check

The deterministic check reports pass/fail for:

- single-column layout;
- standard headings;
- required contact details;
- duplicate bullets;
- bullet length;
- selectable text;
- supported keywords.

It is a format check, not an ATS score and not a prediction of employer behavior.

## Local revision history

`BrowserCvVersionRepository` owns `debit-credit-cv-history-v1`. Opening an evidence-based CV saves a new local revision only when its role, skills, evidence bullets or text changed. **What Changed** compares added/removed core skills and evidence IDs.

Version history is local to the active local profile. Remote sync remains a future repository boundary.

## Integrity rules

- XP, Coins, streaks and game titles do not appear as professional evidence.
- A keyword appears only when backed by professional evidence or user-entered real work experience.
- Local play cannot create Verified.
- The CV describes simulations as simulations and does not convert them into employment.
