# Landing Page V2 — Career League

**Project:** Debit & Credit — by Money Coder  
**Branch:** `codex/career-league`  
**Pull Request:** [#4](https://github.com/AhmedMohamed500/Debit-Credit/pull/4)  
**Implemented:** 20 September 2026

## Product direction

Landing Page V2 presents Debit & Credit as an accounting career game. It tells one continuous story: enter Career League, understand the five-stage professional journey, connect competition and evidence to career growth, see disclosed fictional player journeys, and finish at a city-scale career goal.

The page does not present the product as an LMS, recruitment platform, or guaranteed route to employment.

## Page structure

### Career League hero

- Cinematic two-player scene with real HTML mission panels for Sara and Ahmed.
- Central VS moment and five-company simulation path.
- Primary onboarding CTA and secondary journey anchor.
- Current facts: 9 career levels, 5 simulated company tiers, 197 Account City accounts, and local demo competition.
- Competition is explicitly labeled local/demo.

### Professional journey world

Five floating islands are connected by a glowing route. Arabic progression reads right to left and English reads left to right.

| Stage | Destination | State |
| --- | --- | --- |
| Accounting Bootcamp | `/{locale}/bootcamp` | Available |
| Mizan Trading | `/{locale}/game` | Playable |
| Bigger Companies | `/{locale}/career-league/companies` | Progress-based |
| Month-End | `/{locale}/game/month-end` | Locked preview |
| Finance Leadership | `/{locale}/career-league/promotion` | Career target |

Month-End and Finance Leadership remain previews or targets. No Chapter 2 gameplay was added.

### Three feature worlds

- **Competition:** links to the existing local leaderboard without claiming live multiplayer.
- **Evidence-based CV:** uses the real Auto CV preview and links to the existing CV route.
- **Skills:** shows current and roadmap states instead of implying every skill is playable.

### Player journey examples

The three stories are explicitly labeled illustrative examples. No star ratings, invented learner totals, or fake success claims are shown.

### Career future CTA

The final world combines a Cairo-inspired skyline, an Accountant → Senior Accountant → Chief Accountant → Finance Manager responsibility path, onboarding and company-path CTAs, and a trust strip describing the local bilingual demo and device-local progress.

## Navigation

The public navigation is limited to Home, How it works, Career journey, Companies, Competition, and Career tools, plus language, theme, demo access, and start actions. All internal routes preserve the active locale.

## Responsive behavior

Desktop uses cinematic compositions with HTML overlays. At 640px and below the structure changes for mobile:

- Player mission panels become compact.
- The five-company path keeps its sequence without page overflow.
- Career islands become a horizontally scrollable, snap-aligned path.
- Feature worlds and illustrative stories stack vertically.
- The final role path remains visible above the trust strip.

Automated browser QA covered Arabic and English at 1920×1080, 1600×900, 1440×900, 1366×768, 430×932, and 390×844.

| Check | Result |
| --- | --- |
| Horizontal page overflow | `0px` on every viewport |
| Arabic / English direction | RTL / LTR |
| Career stages / feature worlds | 5 / 3 |
| Broken images | 0 |
| Browser console/page errors | 0 |
| Desktop page height | 3,828–4,156px |
| Mobile page height | 5,269–5,474px |

## Truth and claim boundaries

The page does not claim live online multiplayer, live learner counts, employer partners, vacancies, job offers, guaranteed interviews, salary outcomes, certification from local gameplay, Verified evidence from local play, or real published reviews. Mizan Trading and the company ladder are simulation worlds. Future skills and locked stages show their current state.

## Visual assets

| Asset | Purpose |
| --- | --- |
| `public/landing/career-league-hero-v2.png` | Hero competition world |
| `public/landing/career-journey-world-v2.webp` | Five-stage floating-island journey |
| `public/landing/competition-world-v2.webp` | Local competition feature |
| `public/marketing/auto-cv.png` | Existing evidence-based CV preview |
| `public/landing/skills-world-v2.webp` | Financial skill world |
| `public/landing/career-future-v2.webp` | Final city and responsibility path |

New bitmap assets are clean, text-free compositions. Product claims, labels, links, and states remain HTML so they are responsive, accessible, localizable, and testable.

## Implementation files

- `components/platform/landing-career-v4.tsx`
- `components/platform/platform-nav.tsx`
- `app/landing-v4.css`
- `tests/platform-ui.test.tsx`
- `artifacts/verify-landing-v2.mjs`

No accounting engine, First Shift behavior, saved-game schema, or Skill Passport evidence rule was changed.

## Verification

- Focused landing/platform UI tests: **10 passed**.
- ESLint: passed with zero warnings.
- TypeScript: passed.
- Vitest: **330 tests passed across 47 test files**.
- Production build: passed.
- Browser matrix: passed with zero overflow, broken images, or console/page errors.

## Review screenshots

- `artifacts/landing-v2/01-hero-ar-1920.png`
- `artifacts/landing-v2/02-career-journey-ar.png`
- `artifacts/landing-v2/03-feature-worlds-ar.png`
- `artifacts/landing-v2/04-player-journeys-ar.png`
- `artifacts/landing-v2/05-final-cta-ar.png`
- `artifacts/landing-v2/landing-full-ar-1440.png`
- `artifacts/landing-v2/landing-full-en-1440.png`
- `artifacts/landing-v2/landing-mobile-ar-390.png`

## Image generation record

The source images used text-free prompts so all user-facing language stays in HTML:

- **Journey:** five floating career islands over a bright Cairo-inspired sky, from academy to finance leadership, connected by one glowing route; no words, brands, or logos.
- **Competition:** two young Middle Eastern accounting learners in blue/orange challenge circles with a central gold trophy; no words or logos.
- **Skills:** a polished purple/blue 3D financial-skill universe with abstract spreadsheet, analysis, controls, reporting, and database symbols; no words or logos.
- **Final CTA:** a wide sunset/night Cairo-inspired skyline, a professional with a briefcase, four blank glowing responsibility steps, and clear space for HTML copy; no words, brands, or logos.

The optimized WebP files are committed in `public/landing/`.
