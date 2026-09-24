# Debit & Credit — Career League Landing Page

## Landing Page V4 visual polish — 2026-09-24

This is a polish of the current artwork-led landing, not a return to the V2 composition documented below. The five existing sections, approved four-image artwork, localized routes, and truthful product status remain unchanged. The marketing header now has one 72px desktop / 62px mobile height token, a quieter translucent surface, and a mobile menu positioned immediately below it. Replacing scroll-container-forming `overflow:hidden` with `overflow:clip` restores sticky behavior; shared `scroll-margin-top` keeps the journey, companies, competition, and tools targets below the header.

The source artwork is 1672×941px. Next/Image continues to serve the approved files without recompression, with priority only for the hero. An extra hero scale transform was removed, hover glow was reduced, live explanatory copy was enlarged, and spacing now uses a shared section token. On narrow screens the clipped baked-in hero heading is covered by a readable localized heading; the five-island scroll panorama, three feature crops, compact fictional personas, and cinematic final scene remain intact. No gameplay or evidence logic changed.

Before/after captures, image dimensions, anchor positions, menu behavior, and browser diagnostics are recorded in `artifacts/landing-polish/`. The full quality gate is ESLint, TypeScript, Vitest (330 tests), and a Next.js production build. At 1920px the 1672px source is enlarged about 15% to retain the approved full-bleed composition; a higher-resolution source would be needed for native-scale 1920px rendering.

## Landing Page V2 cinematic rebuild — 2026-09-20

The current public Arabic/English landing page is the complete Career League V2 composition documented in [`LANDING-PAGE-V2.md`](LANDING-PAGE-V2.md). It combines a real HTML two-player hero, five linked career islands, local competition, evidence-based CV and skill worlds, explicitly illustrative player journeys, and a final professional city path. The navigation now contains only the six requested product anchors plus language, theme, demo access, and start actions.

The implementation preserves all existing gameplay and evidence behavior. Month-End remains a locked preview, Finance Leadership remains a career target, competition remains local/demo, and the page makes no claim of live players, real employers, certification, job offers, or guaranteed outcomes.

Final browser QA passed Arabic and English at 1920×1080, 1600×900, 1440×900, 1366×768, 430×932, and 390×844 with zero horizontal overflow, zero broken images, and zero console/page errors. `npm run check` passed: ESLint, TypeScript, 330 tests across 47 files, and the production build. The eight review captures are stored in `artifacts/landing-v2/`.

The reference-alignment follow-up keeps both Hero people unobstructed, restores the requested left-to-right physical order of the three feature cards in Arabic, adds visible fictional portraits to the player-story cards, and aligns the final city composition with its glowing responsibility path. The feature cards now include portrait/evidence strips and clearer icon-based states without inventing live users, employer partners, or published reviews.

## Current delivery snapshot

| Item | Value |
| --- | --- |
| Repository | `AhmedMohamed500/Debit-Credit` |
| Branch | `codex/career-league` |
| Pull Request | [PR #4 — Career League](https://github.com/AhmedMohamed500/Debit-Credit/pull/4) |
| Arabic Preview | [Open Arabic landing](https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar) |
| English Preview | [Open English landing](https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/en) |
| Vercel access | Ready; Deployment Protection may require project login |
| Current quality gate | 330 tests in 47 files, ESLint, TypeScript and production build passed |

## Product position

The public landing page presents **Debit & Credit — Career League** as a professional accounting career game. Its promise is direct:

> Your accounting career starts before the job offer.

> مسارك المحاسبي يبدأ قبل عرض العمل.

The page shows how the player moves from realistic accounting work to evidence, a Skill Passport, an evidence-based Auto CV, career readiness, and simulated promotion. It avoids presenting the product as an LMS, certification provider, employer, or job-placement service.

## Role inside the complete career game

The landing page is the public explanation of the product loop:

```text
LEARN → WORK → COMPETE → PROVE → BUILD PROFILE → BUILD CV → PREPARE FOR NEXT ROLE
```

It introduces the complete product without presenting roadmap foundations as finished gameplay. Accounting Bootcamp, Account City, First Shift, Placement, Career Profile, Skill Passport and Auto CV have playable routes. Corporate Bridge, Month-End, advanced companies, standards and certification preparation retain their current Foundation, Locked, Review Required or Planned labels inside the product documentation.

The strongest promise is evidence-based career progress. The page does not use XP, Coins, a self-selected persona or placement answers as proof of professional competence.

## Page architecture

### 1. Career hero

The first screen combines the product promise with a real Game Hub screenshot from Mizan Trading. Layered mission, current-level, readiness, and target-role panels make the product feel playable while remaining clearly labeled as a career simulation.

Primary routes:

- `/{locale}/onboarding`
- `#how`

### 2. Company world

Five fictional company simulations show how work becomes broader and more demanding:

1. Mizan Trading
2. Delta Commerce
3. Horizon Industries
4. Orbit Regional Group
5. Atlas Global Simulation

Each card communicates a different accounting environment and work mix. The page does not claim that any company is a real employer.

### 3. Persona paths

The visitor can start as:

- **Accounting Student:** Foundations → First Shift → Job Readiness
- **Fresh Graduate:** Placement → Company Work → Career Evidence
- **Working Accountant:** Career Gap → Advanced Missions → Promotion

The three CTAs preserve locale and pass the selected persona to onboarding.

### 4. Connected career journey

The landing page visualizes one eight-step system:

```text
Choose Your Target
→ Find Your Gaps
→ Complete Missions
→ Work in Companies
→ Earn Evidence
→ Build Your Skills
→ Generate Your CV
→ Get Promoted
```

### 5. Real accounting practice

The gameplay section uses the implemented First Shift screenshot. It explains the real work loop:

- Inspect source documents.
- Find missing evidence.
- Apply accounting judgment.
- Build the journal entry.
- Observe the business consequence.

The playable CTA opens `/{locale}/game/first-shift`.

### 6. Professional evidence

The page explains the shared evidence pipeline:

```text
GAMEPLAY → EVIDENCE → SKILL PASSPORT → AUTO CV → CAREER READINESS
```

The Skill Passport and Career Gap panels are explicitly labeled as sample views. Local gameplay does not create `Verified` professional evidence by default. XP and Coins are not presented as professional evidence.

Related routes:

- `/{locale}/career-profile/skills`
- `/{locale}/career-league/gap`
- `/{locale}/career-profile/cv`

### Career League competition preview

The approved `public/landing/career-league-competition.png` artwork is presented as the visual centerpiece of a real HTML marketing section between the accounting-work explanation and the evidence/career area. The surrounding bilingual copy deliberately labels the current competition as a **Demo Preview**. It does not claim live multiplayer, real students online, employer hiring, or real job offers. A visible caption also explains that the image is conceptual artwork.

The section includes four real HTML proof points:

- Realistic Accounting Cases
- Skill-Based Competition
- Career Progression
- Evidence-Based Skill Passport

The CTA preserves locale and opens `/{locale}/leaderboard`, which already identifies the league as local/demo. On mobile, the section follows the required order: headline, supporting copy, demo label, CTA, artwork, then proof points. The image uses `next/image`, preserves its 1536×1024 source, keeps both competitors and the central VS visible, and never acts as a CSS background.

### 7. Auto CV

The CV preview uses the real implemented Auto CV interface. It explains that supported skills can be ordered for the selected accounting role and that Mizan Trading appears as an **Accounting Career Simulation**, never as employment.

### 8. Simulated career ladder

The final progression scene shows six levels:

```text
Accounting Student
→ Junior Accountant
→ General Accountant
→ Senior Accountant
→ Chief Accountant
→ Finance Manager
```

The section is labeled as simulated career progression and ends with a localized onboarding CTA.

## Navigation

The marketing navigation contains:

- Home
- Career Paths
- Companies
- How It Works
- About
- Theme control
- Language control
- Start Now

No fake sign-in action is shown. Internal product navigation remains unchanged outside marketing mode.

## CTA and route map

| Landing action | Destination | Purpose |
| --- | --- | --- |
| Start Your Journey / ابدأ رحلتك الآن | `/{locale}/onboarding` | Start persona and entry-path selection |
| See How It Works / شاهد كيف يعمل | `#how` | Move to the connected career journey |
| Explore the company ladder | `/{locale}/career-league/companies` | Explain tier requirements and simulated companies |
| Student path | `/{locale}/onboarding?persona=student` | Recommend Bootcamp or placement without granting skill |
| Graduate path | `/{locale}/onboarding?persona=graduate` | Start practical placement |
| Working Accountant path | `/{locale}/onboarding?persona=working-accountant` | Start Career Diagnostic |
| Try the First Shift | `/{locale}/game/first-shift` | Open the real accounting work simulation |
| Explore Career League | `/{locale}/leaderboard` | Open the clearly labeled local/demo league |
| Open Skill Passport | `/{locale}/career-profile/skills` | Show explainable professional evidence |
| See my Career Gap | `/{locale}/career-league/gap` | Compare evidence with the target role |
| Preview Auto CV | `/{locale}/career-profile/cv` | Show the evidence-driven role-targeted CV |

Every route retains the active locale.

## Visual system

- White and soft-blue surfaces in Light Mode.
- Deep navy and controlled cyan accents in Dark Mode.
- Bright blue for the primary journey.
- Green for supported professional progress.
- Gold for promotion milestones.
- Large career-focused typography.
- Real product screenshots in layered game frames.
- CSS-built company scenes to avoid fake product screenshots.
- Restrained shadows and gradients.
- Reduced-motion behavior when requested by the operating system.

## Responsive and localization behavior

Desktop uses wide visual compositions. Mobile changes to a deliberate single-column journey with horizontal company and career-ladder exploration where appropriate.

Verified viewports:

- 1920×1080 English Light
- 1440×900 Arabic Dark
- 390×844 English Dark
- 430×932 Arabic Light

Results:

- Horizontal overflow: `0px` on every tested viewport.
- English shell: `ltr`.
- Arabic shell: `rtl`.
- Company cards rendered: `5`.
- Career journey steps rendered: `8`.
- Career ladder roles rendered: `6`.
- Browser console errors: `0`.
- All three production images loaded at their natural dimensions.

## Accessibility

- Real screenshots have localized descriptive alt text.
- CTA labels describe their action.
- Journey steps include visible numbers and text, rather than relying on color.
- Light and Dark themes preserve readable contrast.
- Locale remains present in every product destination.
- The layout respects `prefers-reduced-motion`.

## SEO and sharing metadata

The root metadata presents the product as a career simulation rather than an Academy or course catalog:

- Title: `Debit & Credit Career League | Build Your Accounting Career`
- Description: realistic simulated company work, professional evidence and preparation for the next accounting role.
- Open Graph title and description follow the same positioning.
- `metadataBase` remains the existing production domain.

The metadata avoids claims of employment, accreditation, live multiplayer or guaranteed career outcomes.

## Production assets

- `public/marketing/career-league-game-hub.png`
- `public/marketing/first-shift-work.png`
- `public/marketing/auto-cv.png`
- `public/landing/career-league-competition.png`

## Review screenshots

- `artifacts/career-league/landing-career-league-en-1920.png`
- `artifacts/career-league/landing-career-league-ar-1440.png`
- `artifacts/career-league/landing-career-league-en-mobile-390.png`
- `artifacts/career-league/landing-career-league-ar-mobile-430.png`
- `artifacts/career-league/landing-competition-ar-1920.png`
- `artifacts/career-league/landing-competition-en-1920.png`
- `artifacts/career-league/landing-competition-mobile-ar-390.png`

## Implementation files

- `components/platform/marketing-landing.tsx`
- `components/platform/landing-sections.tsx`
- `components/platform/platform-nav.tsx`
- `app/landing-v2.css`
- `app/landing-v3.css`
- `app/layout.tsx`
- `tests/platform-ui.test.tsx`
- `artifacts/verify-landing-v2.mjs`
- `artifacts/verify-career-league-competition.mjs`

## Verification

The latest full `npm run check` passed:

- ESLint: passed with zero warnings.
- TypeScript: passed.
- Vitest: **330 tests passed across 47 test files**.
- Production build: passed.
- Focused landing UI tests: **10 passed**.
- Historical landing QA passed at 1920×1080, 1440×900, 430×932 and 390×844 across Arabic/English and Light/Dark combinations.
- Latest delivery smoke check passed at 1440×900 and 390×844 with zero page-wide overflow.

## GitHub and preview

- Branch: `codex/career-league`
- Pull Request: <https://github.com/AhmedMohamed500/Debit-Credit/pull/4>
- English branch preview: <https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/en>
- Arabic branch preview: <https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar>

## Claim boundaries

The landing page does not claim:

- Employment at Mizan Trading or any simulated company.
- Real hiring partners or employer discovery.
- Real job vacancies.
- Professional certification from local gameplay.
- Guaranteed salaries, promotions, interviews, or placement outcomes.
- Verified evidence without an external verification source.

The Career Readiness and Skill Passport numbers in the marketing composition are visibly sample interface content rather than an assessment of the current visitor. The competition artwork is identified as product concept artwork and does not imply a live player population.

## Relationship to the project reports

- The complete implementation boundary is recorded in [`COMPLETE-CAREER-GAME-IMPLEMENTATION-REPORT.md`](../COMPLETE-CAREER-GAME-IMPLEMENTATION-REPORT.md).
- The level 0–8 curriculum is recorded in [`docs/COMPLETE-ACCOUNTING-CAREER-CURRICULUM.md`](COMPLETE-ACCOUNTING-CAREER-CURRICULUM.md).
- Career League implementation history is recorded in [`CAREER-LEAGUE-IMPLEMENTATION-REPORT.md`](../CAREER-LEAGUE-IMPLEMENTATION-REPORT.md).
