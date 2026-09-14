# Debit & Credit — Career League

## Product concept

Career League is an accounting career game: **Start small. Prove your skills. Move up.** Players enter fictional companies, perform accounting work, create auditable evidence, and use that evidence to unlock roles, assessments, and larger simulated companies.

## Audiences and loop

- **Accounting Student:** builds foundations through transactions and business problems before the first job.
- **Fresh Graduate:** converts academic knowledge into document, posting, AP, AR, bank, reconciliation, and close practice.
- **Working Accountant:** finds gaps and prepares for structured corporate workflows.

The shared loop is: current level → target job → missing skills → career missions → company work → performance → evidence → Skill Passport → readiness → promotion assessment → new role/company.

## Implemented vertical slice

- Persona onboarding, work environment and career goal selection.
- Local Placement Challenge; it recommends a start and never grants Verified.
- Five-tier Company Career Ladder with evidence, missions, and assessment gates. XP alone cannot unlock a company.
- Fictional Career Simulation Job Market, Career Gap Report, and role-targeted training plans.
- Promotion Assessment eligibility and result architecture.
- Demo Career League score based on professional quality, with no direct speed reward.
- Game-only Career Reputation: manager trust, books health, audit risk, independence, and reliability.
- Small Company → Corporate 90-day track architecture with a Week 1 vertical slice.
- Automatic target-role sync to Career Profile and Auto CV; selecting a goal grants no skills.

## Evidence and consequences

Gameplay events remain the source of professional evidence. Skill Passport keeps Unassessed, Practiced, Demonstrated, and Verified semantics; local play cannot produce Verified. Delayed accounting consequences remain event-auditable and can affect later reconciliations, books health, trust, and audit risk.

## Access architecture

Access rules are centralized as Free/Pro metadata. The current UI describes future paid value—advanced simulations, corporate preparation, assessments, evidence, and role targeting—without payments or fake billing.

## Demo, local-only, and planned

- **DEMO / LOCAL-ONLY:** ranking, seasons, competitors, job market, employer discovery.
- **PLANNED:** real cross-device leagues, identity verification, employer accounts, live jobs, payments, and the full 90-day simulation. These require backend infrastructure.

