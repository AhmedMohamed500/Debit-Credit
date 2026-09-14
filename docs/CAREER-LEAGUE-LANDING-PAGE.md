# Debit & Credit — Career League Landing Page

## Overview

The public landing page presents Debit & Credit as an accounting career game built around realistic company work and professional progression.

**Primary message:**

> Your accounting career starts before the job offer.

**Arabic message:**

> مسارك المحاسبي يبدأ قبل عرض العمل.

The page positions the product around a clear promise:

**Start small. Do the work. Build the evidence. Move up.**

It avoids presenting the product as an LMS, video course, certification site, or traditional accounting dashboard.

## Product story

The landing page explains the complete Career League journey:

```text
Current Level
→ Target Job
→ Missing Skills
→ Career Missions
→ Realistic Company Work
→ Professional Evidence
→ Skill Passport
→ Auto CV
→ Promotion
→ Next Company
```

The experience uses screenshots from the implemented product instead of decorative mockups.

## Hero section

The first screen contains:

- Career League identity.
- A direct career-focused headline.
- A short explanation of company simulations and professional evidence.
- Primary CTA: **Start building my career**.
- Secondary CTA: **See the game**.
- Mizan Trading Game Hub screenshot.
- Current League and Career Evidence overlays.
- Trust points for realistic workflows, evidence-based progress, and Arabic/English support.

## Audience paths

The page offers three explicit starting points.

### Accounting Student

**Message:** Understand accounting before your first job.

```text
Foundations → First Shift → Job Readiness
```

The CTA opens:

```text
/{locale}/onboarding?persona=student
```

### Fresh Graduate

**Message:** Turn what you studied into real accounting work.

```text
Placement → Company Work → Career Evidence
```

The CTA opens:

```text
/{locale}/onboarding?persona=graduate
```

### Working Accountant

**Message:** Prepare for the company you want to move to.

```text
Career Gap → Corporate Bridge → Promotion
```

The CTA opens:

```text
/{locale}/onboarding?persona=working-accountant
```

## Gameplay showcase

The gameplay section uses a real First Shift screenshot and communicates the core work loop:

- Inspect source documents.
- Identify missing evidence.
- Apply accounting judgment.
- Build the journal entry.
- Observe the business consequence.

The section links directly to:

```text
/{locale}/game/first-shift
```

## Evidence and Auto CV showcase

The page visually explains the automatic evidence pipeline:

```text
GAMEPLAY → EVIDENCE → SKILL PASSPORT → AUTO CV
```

The Auto CV section uses a real product screenshot and explains that:

- Skills require qualifying gameplay evidence.
- Career Profile and role readiness update from the same evidence.
- The CV adapts to the selected target role.
- Mizan Trading remains clearly labeled as an Accounting Career Simulation.
- Simulation experience is never presented as real employment.
- Local gameplay cannot create Verified professional evidence.

The CV CTA opens:

```text
/{locale}/career-profile/cv
```

## Career progression section

The career loop banner shows five progression steps:

1. Target Job
2. Missing Skills
3. Career Missions
4. Promotion Assessment
5. Next Company

The section links to the fictional Career Simulation Job Market:

```text
/{locale}/career-league/jobs
```

## Visual direction

The visual system uses:

- White and soft blue surfaces in Light Mode.
- Deep navy and controlled blue surfaces in Dark Mode.
- Bright blue for primary career actions.
- Cyan for simulation and workflow highlights.
- Green for valid evidence and professional progress.
- Gold for league and promotion moments.
- Large career-focused typography.
- Real product screenshots inside desktop-style frames.
- Floating evidence and league indicators.
- Restrained shadows, gradients, and motion-ready hover states.

The visual direction remains professional and avoids a cyberpunk, LMS, or generic SaaS appearance.

## Responsive behavior

Desktop layouts use split compositions and large product previews. Mobile layouts become native-feeling single-column flows with:

- Full-width CTAs.
- Compact trust indicators.
- Stacked audience paths.
- Responsive gameplay and CV previews.
- Horizontally scrollable evidence pipeline where needed.
- Compact career progression cards.

Verified viewport coverage:

- 1920×1080
- 1440×900
- 390×844
- 430×932

The verified horizontal overflow is `0px` on all tested sizes.

## Accessibility and localization

- All marketing images have descriptive alternative text.
- Links use descriptive action labels.
- Arabic uses the existing RTL shell.
- English uses LTR.
- Both Light and Dark themes remain supported.
- Content remains readable without relying on color alone.
- CTA destinations preserve the selected locale.

## Image assets

Production assets:

- `public/marketing/career-league-game-hub.png`
- `public/marketing/first-shift-work.png`
- `public/marketing/auto-cv.png`

Review screenshots:

- `artifacts/career-league/landing-professional-en.png`
- `artifacts/career-league/landing-professional-ar-dark.png`
- `artifacts/career-league/landing-professional-mobile-en.png`
- `artifacts/career-league/landing-professional-mobile-ar.png`

## Files changed

- `components/platform/marketing-landing.tsx`
- `app/landing-v2.css`
- `app/layout.tsx`
- `tests/platform-ui.test.tsx`
- `artifacts/verify-landing-v2.mjs`
- `public/marketing/*`

## Automated verification

The final quality gate completed successfully:

- ESLint: Passed
- TypeScript: Passed
- Vitest: 251 tests passed across 30 test files
- Production Build: Passed
- Browser console errors: 0
- Horizontal overflow: 0px
- Arabic RTL: Passed
- English LTR: Passed
- Light Mode: Passed
- Dark Mode: Passed
- Three production screenshots loaded successfully at their natural dimensions

## GitHub and deployment

- Branch: `codex/career-league`
- Pull Request: https://github.com/AhmedMohamed500/Debit-Credit/pull/4
- Landing implementation commit: `c10339cb8a70f89516fcc1ade9a97f321d18c909`
- Arabic Preview: https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar
- English Preview: https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app/en

## Honest product claims

The landing page does not claim:

- Real employment at Mizan Trading.
- Real online competitors.
- Real hiring partnerships.
- Verified professional certification from local gameplay.
- Real job vacancies.
- Salary or placement outcomes.

All companies, job opportunities, league competitors, and employer discovery experiences remain clearly identified as simulation or demo experiences where appropriate.
