# Career Profile & Accounting Skill Passport

**Product:** Debit & Credit — by Money Coder

**Phase:** Professional identity foundation (frontend-first beta)

**Review branch:** `codex/first-day-cinematic`
**Date:** 10 September 2026

## Product purpose

This foundation connects meaningful accounting gameplay to a professional candidate record:

`Player → Accounting activity → Skill evidence → Career profile → Role-based CV → future verified assessment → future employer workflow`

It is a candidate-side foundation, not a social network, job board, or claim of accreditation. Every computed professional result traces back to an evidence record. Current game activity can be **Practiced** or **Demonstrated**, never **Verified**.

## Game Profile vs Career Profile

| Game Profile | Career Profile |
| --- | --- |
| XP, coins, game progress, chapters, streaks and game achievements | Professional identity, accounting evidence, Skill Passport, role readiness, CV and work preferences |
| Measures progress inside the game | Presents evidence-backed professional capability |
| Available at `/[locale]/profile` | Available at `/[locale]/career-profile` |
| Links to the professional profile | Excludes XP, coins, streaks and decorative game scores from the CV |

## Career identity

`CareerProfile` stores a stable `localCandidateId`, share-preview slug, full name, headline, target role, location, optional contact and links, education, graduation year, experience, languages, employment status, work preferences, professional summary, privacy settings and onboarding progress.

The five-step editor covers identity, target role, education and experience, preferences, then Skill Passport and privacy. Every change is saved in the browser so setup can continue later.

Implemented role IDs:

- `junior-accountant`
- `general-accountant`
- `ap-accountant`
- `ar-accountant`
- `treasury-accountant`
- `cost-accountant`
- `inventory-accountant`
- `gl-accountant`
- `junior-auditor`

Labels are localized separately from IDs, so future roles can be added without changing stored profiles.

## Accounting Skill Passport

The catalog currently defines 19 skills: Accounting Fundamentals, Account Classification, Debit & Credit, Document Analysis, Journal Entries, Ledger Posting, Trial Balance, Error Detection, Bank Reconciliation, Accounts Payable, Accounts Receivable, Cash & Treasury, Adjusting Entries, Financial Statements, Month-End Closing, Inventory Accounting, Cost Accounting, Expense Recognition and Supplier Documents.

Each skill has one of four states:

- **Unassessed:** no meaningful evidence.
- **Practiced:** activity exists, but it does not meet the diversity and success threshold.
- **Demonstrated:** at least two distinct successful activities and a computed score of at least 70.
- **Verified:** reserved for an explicit `verified_assessment` record with `verified_local_beta` or `verified_server` integrity.

A single activity shows **Insufficient Evidence** and no percentage. Repeating the same activity does not satisfy the diversity threshold.

## Skill Evidence model

Each `SkillEvidence` record contains:

- evidence, local candidate, activity, mission and chapter IDs
- activity type, skill ID and relevant role IDs
- difficulty, score and accuracy
- first-attempt result, attempt count and hints
- independent completion and critical errors
- completion time, bilingual activity title and source
- assessment integrity: `practice`, `demonstrated`, `verified_local_beta` or `verified_server`

Supported sources are `game`, `mission`, `boss_case`, `arena` and `verified_assessment`. Current First Shift records use `mission` and never claim server verification.

## First Shift evidence mapping

| First Shift document | Evidence skills |
| --- | --- |
| Supplier Invoice | Document Analysis, Account Classification, Debit & Credit, Journal Entries, Accounts Payable, Supplier Documents |
| Customer Receipt | Document Analysis, Debit & Credit, Journal Entries, Accounts Receivable, Cash & Treasury |
| Office Expense | Accounting Fundamentals, Account Classification, Debit & Credit, Journal Entries, Expense Recognition, Cash & Treasury |

Incorrect submissions create practice evidence. Correct submissions create demonstrated-integrity records. The final First Shift result adds a small “Professional Evidence Added” transition and a link to the Skill Passport without interrupting the mission with profile forms.

## Deterministic skill scoring

For each evidence record:

```text
weight = 1 + (difficulty - 1) × 0.25

record value =
  accuracy × 0.55
  + activity score × 0.20
  + 10 if completed independently
  + 10 if correct on the first attempt
  + difficulty × 2.5
  - critical errors × 12
  - hints used × 3
```

The record value is clamped to 0–100 and difficulty-weighted. The final score is the weighted mean plus a diversity bonus of two points for each additional distinct activity, capped at six points and 100 overall.

No percentage is shown until there are at least two distinct activities. Confidence is **Insufficient** below two activities, **Developing** from two to three, **Strong** from four to six, and **Extensive** at seven or more.

## Skill detail

`/[locale]/career-profile/skills/[skillId]` shows status, score or insufficient evidence, confidence, evidence count and the full evidence timeline. Each record exposes accuracy, difficulty, first-attempt status, hints and date. The Verified Assessments area remains empty and explicitly says no standardized verified assessment exists.

## Accounting DNA

Accounting DNA is an evidence summary, not a personality or scientific classification. It appears only after three distinct successful activities and three Demonstrated or Verified skills. Archetypes are selected from actual leading skills: Transaction Specialist, Error Investigator, Reconciliation Specialist, Closing Specialist or Accounting Generalist. Until the threshold is met, the UI asks the player to complete more professional cases.

## Role competency and readiness

Each of the nine roles has a separate normalized skill-weight map in `lib/career/catalog.ts`. Readiness uses only skills with sufficient scores. It stays **Not Enough Evidence** until at least three role skills are scored and weighted coverage reaches 40%.

When eligible, readiness is the role-weighted skill average multiplied by a coverage reliability factor. The result is deterministic and becomes more reliable as evidence coverage grows.

## Auto CV and role-based CV

`/[locale]/career-profile/cv` builds a professional CV from the profile, passport and relevant successful evidence. Changing the target role changes the summary, reorders real skills by that role's competency weights and filters evidence for the role. It never fabricates experience.

The default CV includes contact information, professional summary, target role, optional education and experience, accounting skills, the Mizan Trading First Shift practical simulation, and languages. Game XP, coins, streaks and random badges are excluded.

The browser's **Print / Save PDF** workflow uses A4 print CSS, hides application navigation and controls, keeps readable margins and prevents section clipping. **Export CV Data** downloads a versioned JSON record for future integrations.

## Public talent profile and privacy

`/[locale]/talent/[slug]` is a local/demo share preview. It is shown only when visibility is `link` and the slug matches the current browser profile. This phase does not claim global publishing, company discovery, authentication or server persistence.

Privacy controls cover profile visibility and whether an employer preview may show email, phone, location, education, experience, skill scores and simulation results. “Discoverable by Companies” stores a future preference and clearly states that discovery is not live.

`/[locale]/career-profile/employer-preview` uses the same `CareerProfile`, evidence and readiness calculations as the candidate view. It shows the current practical simulation and an honest empty state for verified assessments.

## Repository abstraction and persistence

Interfaces:

- `CareerProfileRepository`
- `SkillEvidenceRepository`
- `CvPreferencesRepository`

Current implementations:

- `BrowserCareerProfileRepository`
- `BrowserSkillEvidenceRepository`
- `BrowserCvPreferencesRepository`

These isolate browser storage from product logic and leave a direct path to future server repositories.

Storage keys:

- `debit-credit-career-profile-v1`
- `debit-credit-skill-evidence-v1`
- `debit-credit-cv-preferences-v1`
- `debit-credit-local-candidate-id-v1`

The existing `debit-credit-world-v2` game state remains unchanged. First Shift evidence is projected idempotently into the new evidence repository. Names and emails are never used as primary IDs.

## Routes

- `/[locale]/career-profile`
- `/[locale]/career-profile/edit`
- `/[locale]/career-profile/skills`
- `/[locale]/career-profile/skills/[skillId]`
- `/[locale]/career-profile/cv`
- `/[locale]/career-profile/employer-preview`
- `/[locale]/talent/[slug]`
- `/[locale]/career` redirects to the new professional profile

The primary site navigation exposes Career Profile and separately labels the existing Game Profile.

## Future integration contracts

`FutureAssessmentReference` reserves assessment ID/version, attempt ID, Verified Accounting Score, critical errors, independent accuracy, time and verification integrity. `FutureHiringReference` reserves candidate, company, job, application, challenge and assessment relationships plus shortlist and interview status.

These are contracts and placeholders only. No assessment engine, real company discovery, application workflow or server verification is claimed as implemented.

## Verification

Automated tests cover profile persistence, stable local ID, repository separation and idempotent evidence merging, First Shift mapping, practice versus demonstrated evidence, the minimum score threshold, diversity, verified-source restrictions, Accounting DNA, normalized role weights, readiness coverage, role-based CV prioritization, game-stat exclusion, Arabic RTL, English LTR, privacy behavior and the Game Profile/Career Profile separation.

Browser QA covers dashboard, skill drill-down, role-based CV, print styles, employer preview, local public profile privacy, Arabic RTL and 390px with zero horizontal overflow. Captures and the executable QA record are stored under `artifacts/career-profile-*`.

Final verification: ESLint and TypeScript passed, 198 Vitest tests passed across 25 files, and the Next.js production build completed successfully. Existing First Shift and Nature of Accounts browser regression flows also passed after the integration.

## GitHub and Vercel Preview

- Implementation commit: `d48cd2e19b9238a94d7723f315e35d3e677309bd`
- Review branch: `codex/first-day-cinematic`
- Open review: https://github.com/AhmedMohamed500/Debit-Credit/pull/1
- Vercel Preview: https://debit-credit-bp7p2tful-ahmed-mohameds-projects-c51bc2cc.vercel.app
- Arabic Career Profile: https://debit-credit-bp7p2tful-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar/career-profile
- English Career Profile: https://debit-credit-bp7p2tful-ahmed-mohameds-projects-c51bc2cc.vercel.app/en/career-profile
- Skill Passport: https://debit-credit-bp7p2tful-ahmed-mohameds-projects-c51bc2cc.vercel.app/en/career-profile/skills
- Auto CV: https://debit-credit-bp7p2tful-ahmed-mohameds-projects-c51bc2cc.vercel.app/en/career-profile/cv
- Employer Preview: https://debit-credit-bp7p2tful-ahmed-mohameds-projects-c51bc2cc.vercel.app/en/career-profile/employer-preview
- GitHub deployment record: `6373295410`, successful for the exact implementation commit.
- Vercel deployment: https://vercel.com/ahmed-mohameds-projects-c51bc2cc/debit-credit/F3dXHi7Qntavhg5rAAU3BvMhotrS

The hosted Preview is protected by the project's existing Vercel SSO setting. Anonymous requests redirect to `vercel.com/sso-api`; use an account authorized for the project. The publication record is successful, while all page interactions were verified against the same code in the local production build.
