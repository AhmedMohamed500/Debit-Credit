# Gamified Accounting Academy Platform

## Product vision

Debit & Credit connects accounting learning, professional simulation, quality-based competition, explainable evidence, career planning, and a clearly labeled employer demo. The player learns concepts, applies them through existing mechanics, works in Mizan Trading, and sees qualifying behavior flow into the Skill Passport and Auto CV.

The integrity rules remain strict: XP controls game progression only; league rank is not employability; Mizan Trading is simulation rather than employment; local evidence never becomes `Verified`.

## Interactive company-world correction

The Game Hub now follows the intended management-game composition. Its center is a new original Mizan Trading port campus with clickable operational zones for Suppliers, Customers, Bank, and Logistics. Month End remains visibly locked. The visual is an environment layer only; labels, status, links, locks, progress, and accessibility remain live React controls.

A persistent game rail opens the real inbox, First Shift, journal, ledger reference, Money Flow, Skill Passport, and Career Hub. The surrounding operations deck reads the three real First Shift documents and their saved completion state. Company impact uses processed cases, projected accuracy, handled document value, and ledger issues from the existing game state. The player dossier and Skill Passport use existing local projections and keep Game Level separate from professional rank.

Desktop uses the full command-center layout. Tablet collapses the dossier beneath the world, and mobile turns the rail into a horizontal game menu, keeps the map touch targets inside the viewport, and stacks the operations and evidence panels. Chapter 2 was not implemented or unlocked.

## Implemented platform layer

- Premium bilingual public landing page with product journey, Mizan Trading preview, career path, competition preview, and employer demo entry.
- Local onboarding for experience and goal, with foundations kept mandatory.
- Light, Dark, and System themes using semantic CSS tokens and local persistence. An early boot script prevents a saved theme from flashing incorrectly.
- Game Hub with a large interactive Mizan Trading company world, state-derived player dossier, company impact, First Shift work queue, and professional evidence panels.
- Functional Mizan Trading zones: Suppliers and Customers open First Shift, Bank opens Money Flow, Logistics opens the account reference, and Month End remains visibly locked.
- Academy overview for Phases 0–6 and the Learn → Practice → Simulate → Compete model.
- Daily, weekly, and locked boss challenge samples that reuse existing mechanics.
- Deterministic local demo leaderboard with Weekly, Season, and All Time modes.
- Career Hub with target role, role coverage, Demonstrated, Practiced, missing skills, and a missing-skill mission recommendation.
- Evidence-driven Auto CV categories and structured simulation bullets.
- Employer demo with filtering, shortlist comparison, candidate evidence metrics, and explainable role fit.

## Architecture

`lib/platform/index.ts` contains Academy metadata, challenge metadata, scoring, leagues, professional rank, placement recommendation, role groups, and mission recommendation. `lib/platform/repository.ts` provides versioned local state for onboarding, streaks, and badges. `components/platform/` contains the shared navigation and each new product surface.

The implementation reuses the existing Phase B event stream, performance projection, Skill Passport, career repositories, player store, Mizan Trading state, account catalog, First Shift, Journal Practice, Money Flow, and employer demo data. It does not replace the accounting or Case engines.

## Theme system

Semantic variables include `--background`, `--surface`, `--surface-muted`, `--surface-elevated`, `--border`, `--text-primary`, `--text-secondary`, `--brand-primary`, `--brand-secondary`, `--success`, `--warning`, `--danger`, `--xp`, `--league`, and `--evidence`.

Preference is stored under `debit-credit-theme-v1`. `System` follows `prefers-color-scheme`. Default remains Light. The boot script applies saved preference before the page paints.

## Competition

The repository seam is `LeaderboardRepository`; the current implementation is `DemoLeaderboardRepository`. Seeded names are marked Demo and remain deterministic. There is no remote leaderboard or multiplayer.

Competition score is capped at 1,000 and uses:

`Accuracy × 3 + Judgment × 2.5 + Investigation × 1.8 + Risk Awareness × 1.8 + First Attempt × 0.6 + Difficulty × 10`

Unsafe rushing receives no special speed reward. Existing Phase B risk projection reduces or withholds Risk Awareness when the player attempts unsafe posting.

Leagues are Bronze, Silver, Gold, Platinum, Diamond, and Elite. They are game competition labels, separate from professional rank.

## Career and CV pipeline

`Gameplay → Professional Evidence → Skill Passport → Role Mapping → Role Readiness → Career Profile → Auto CV → Employer Preview`

Practiced skills appear under accounting practice and skills in development. Demonstrated skills appear under core accounting skills. CV bullets are emitted only when structured evidence supports the exact claim. Each generated bullet retains its source `evidenceId`. Mizan Trading is labeled `Accounting Career Simulation` and is never described as employment.

Professional rank is derived from Skill Passport coverage and remains separate from Game Level. Role readiness uses the existing weighted role catalog and does not use XP, Coins, badges, streak, or leaderboard position.

## Storage and migrations

- `debit-credit-theme-v1`: Light/Dark/System preference.
- `debit-credit-platform-v1`: versioned onboarding, goal, activity dates, current/best streak, and badge IDs.
- Existing game, campaign, evidence, profile, CV, and module keys are unchanged.

Migration accepts partial older platform objects, restores missing defaults, and deduplicates dates/badges. Streaks and badges are motivational only and cannot reduce professional evidence.

## Routes

| Route | Purpose |
| --- | --- |
| `/[locale]` | Public landing |
| `/[locale]/onboarding` | Player setup |
| `/[locale]/game` | Game Hub |
| `/[locale]/game/first-shift` | Existing First Shift |
| `/[locale]/academy` | Academy progression |
| `/[locale]/challenges` | Challenge catalog |
| `/[locale]/leaderboard` | Local demo competition |
| `/[locale]/career` | Career Hub |
| `/[locale]/career-profile/skills` | Skill Passport |
| `/[locale]/career-profile/cv` | Evidence-driven Auto CV |
| `/[locale]/employers` | Employer demo landing |
| `/[locale]/employers/talent` | Demo talent explorer/comparison |
| `/[locale]/employers/candidate/[id]` | Demo candidate evidence |

## QA and limitations

Automated tests cover themes, Academy locks, score determinism, leaderboard order, league/placement thresholds, professional rank separation, career recommendations, platform migration, streak/badge idempotency, bilingual UI, onboarding, mobile navigation, and Auto CV evidence behavior.

Browser QA covers Arabic and English, Light and Dark, refresh persistence, console/page errors, and widths 390, 430, 768, 1024, 1280, 1440, and 1920. Captures are stored in `artifacts/gamified-academy-platform/`.

Employer candidates and competition competitors are deterministic sample data. Authentication, remote seasons, real candidate discovery, employer accounts, trusted assessments, server verification, cross-device sync, and Chapter 2 remain future backend work. Closing stays locked.
