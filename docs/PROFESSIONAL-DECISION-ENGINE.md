# Professional decision rules — First Shift

The case definition lists actions; the shared `lib/cases/engine.ts` records them in append-only casework events. The UI never treats a button label as an accounting posting. `post` is a two-gate operation: all required sources must be inspected and all required field comparisons must have the expected verdict; then the journal workpaper must be complete and balanced. Finally the existing First Shift semantic validator accepts or rejects its account/amount treatment.

| Action | State and accounting effect | Feedback |
| --- | --- | --- |
| Post with missing source or comparison | Remains investigating; no accepted journal mutation | Names the missing inspection/comparison count. |
| Post with incomplete/unbalanced workpaper | Draft remains editable; no accepted journal mutation | Explains account and balance requirement. |
| Post balanced but wrong treatment | Rejected attempt; no accepted journal mutation | Protected-ledger consequence and retry. |
| Post fully supported and correct | Case resolved; one accepted journal entry through the existing campaign engine | Accounting effect, control effect, Kareem feedback and next file. |
| Hold / request information / escalate | Case waiting; no accepted journal mutation | Protective decision and who/what is pending. |

Every source inspection, match verdict, selected action and submission is saved in the versioned local casework state. Match events contain field ID, verdict and supporting source IDs; wrong verdicts are not silently converted to success. Older local saves are filled with empty matching decisions without rewriting accepted accounting. Repeating a successful resolution does not create a second ledger entry.

The accepted ledger is the authority, not XP. Professional evidence is derived by the existing `lib/career/evidence.ts` projector from resolved case events, investigation and attempts, with the existing conservative thresholds. A protective decision is a meaningful simulation consequence but is not automatically a completed-case skill credential. Local evidence is unverified. Company status reports deterministic open-file count and accepted-ledger error state, never a fabricated percentage.

Future senior/chief/manager actions should be introduced as case metadata and engine policies with explicit authority tests. Do not expose approval buttons by changing copy alone.
