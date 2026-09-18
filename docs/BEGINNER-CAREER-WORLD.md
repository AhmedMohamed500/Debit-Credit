# Beginner Career World

## Scope and entry

The new game home is rendered on `/[locale]/game` only when the saved Career League persona is `student` with beginner placement (tier 1). Graduates and working accountants keep the existing Game Hub. It is a career starting point for Mizan Trading, not a second accounting engine or a new professional qualification.

## Visual architecture

The desktop view has one top navigation, a left eight-stage career journey, a dominant waterfront company world, and four compact work panels beneath it. The city background is original scenery only; company markers, text, locks, navigation, progress, mentor guidance, documents, and controls are real HTML/React elements. Dark mode follows the supplied navy/cyan reference. Light and System remain available through the existing theme provider.

The new visual assets are `public/platform/beginner-career-city.png` and `public/platform/beginner-student-avatar.png`. The existing Kareem artwork is cropped into the mentor portrait. Generated city art contains no embedded interface or text.

## Student journey and roadmap

The roadmap shows Accounting Foundations, Journal Entries, General Ledger, Trial Balance, Accounting Cycle, Financial Statements, Accounting Standards, and Certification Preparation Tracks. The starting state is Accounting Foundations. Only completion of every existing Accounting Foundations lesson moves the current roadmap marker to Journal Entries. Later stages remain locked; Standards and certification-preparation nodes are planned. No official certification is claimed.

The identity card uses the existing player level, XP, and next-level progress. These game values do not determine Skill Passport status or company unlocks. The next milestone panel is progress wording, not an award.

## Company progression

The five destinations come directly from `companyTiers`: Mizan Trading, Delta Commerce, Horizon Industries, Orbit Regional Group, and Atlas Global Simulation. Unlocks use `companyUnlocked` with saved First Shift completion, Skill Passport results, and saved promotion assessments. Mizan opens the playable First Shift. Future companies open a locked preview showing their environment, learning characteristics, required skills, promotion gate, and unmet requirements. The map line reflects actual unlock state; hover/focus supplies compact requirement details. There is no Chapter 2 route added.

## Current mission

`Understand the Transaction` is a beginner-first Mizan case built around an owner capital receipt. The player identifies the event, affected accounts, increases, and whether anything decreased. It intentionally stops before journal posting. Correct completion records `practice:beginner-owner-capital` through the existing game progress store; it grants only the existing practice reward and game skill practice. It does not create professional Skill Passport evidence. Replay does not re-award the first completion.

## Skills, tools, and competition

The skills panel computes the real Skill Passport projection from stored evidence and First Shift case evidence. Skills without sufficient evidence display **Unassessed**, without a fabricated mastery percentage. Ledger, Trial Balance, Financial Statements, Nature of Accounts, and Documents link to their existing routes. Calculator is a working local arithmetic popover. The competition panel labels its rank **Demo League** and uses the existing deterministic local leaderboard and performance score. Its practice route shows the existing practice reward, and never implies live competitors.

## Responsive behavior and future curriculum

At phone widths the interface becomes a vertical game flow: player status, horizontally swipable companies/current world, milestone, mission, skills, tools, competition, and roadmap, with a fixed five-destination bottom nav. Company progression scrolls within the world rather than widening the whole page. The verified 390px capture has zero page-wide overflow. AR/RTL and EN/LTR are both rendered and tested.

The long-term beginner curriculum can expand from business/accounting basics through transactions, the equation, account categories, nature, increases/decreases, journal, ledger, reports, standards, and career tracks. This change implements the roadmap shell and one introductory transaction case only.

## Validation and review

Focused UI tests cover persona routing, honest roadmap and Skill Passport states, company unlock preview, Mizan navigation, tool routes, bilingual direction, demo labeling, and practice persistence. The full `npm run check` gate passed: ESLint, TypeScript, 256 Vitest tests across 31 files, and production build. Four captures are stored under `artifacts/career-league/beginner-game-home-*.png` for Arabic/English dark desktop, Arabic light desktop, and Arabic 390px phone.
