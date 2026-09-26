# Player Profile and Career Identity

## Game competition versus professional profile (2026-09-26)

The Career League hub shows local league, weekly rank, ranked cases, streak, recent attempts, deterministic game awards and offline comparison. This is unverified game identity. Professional Skill Passport, Career Gap and ATS CV remain separate and derive only from qualifying underlying case evidence; wins and rank never upgrade them.

Debit & Credit keeps two related identities clear:

- the **game identity** contains level, XP, Coins, badges and local challenge titles;
- the **career identity** contains the target role, evidence-backed skills, simulated career level, case history, development areas, Skill Passport and CV.

Game rewards can motivate play but cannot become professional evidence. The career profile projection explicitly excludes XP, Coins and streaks.

## Existing profile experience

The current Career Profile already supports bilingual identity editing, target role, education, experience, preferences, privacy, Skill Passport, Accounting DNA, role readiness, professional simulation records, Auto CV and employer preview. Local gameplay can create Practiced or Demonstrated evidence. Verified remains unavailable.

## Career identity projection

`buildPlayerCareerIdentity` combines the saved Career Profile, Skill Passport, evidence records and optional placement gaps into:

- target role;
- simulation level;
- professional strengths;
- development areas;
- unique completed cases;
- an explicit local-simulation label.

The simulation level describes in-game responsibility and never asserts a real employment title.

## Local profiles

The multi-profile repository isolates the full player save on shared devices. Switching a local player changes the entire saved experience rather than only changing a display name.
