# Debit & Credit — Career League Landing Page

## Product position

The public landing page presents **Debit & Credit — Career League** as a professional accounting career game. Its promise is direct:

> Your accounting career starts before the job offer.

> مسارك المحاسبي يبدأ قبل عرض العمل.

The page shows how the player moves from realistic accounting work to evidence, a Skill Passport, an evidence-based Auto CV, career readiness, and simulated promotion. It avoids presenting the product as an LMS, certification provider, employer, or job-placement service.

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

`npm run check` passed:

- ESLint: passed with zero warnings.
- TypeScript: passed.
- Vitest: **271 tests passed across 32 test files**.
- Production build: passed.
- Focused landing UI tests: **10 passed**.
- Browser QA: passed across four desktop/mobile, Arabic/English, Light/Dark combinations.

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
