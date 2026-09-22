# Debit & Credit — Cinematic Landing Page Redesign

## Delivery status

| Item | Value |
| --- | --- |
| Product | Debit & Credit — by Money Coder |
| Experience | Career League public landing page |
| Branch | `codex/career-league` |
| Pull Request | [PR #4](https://github.com/AhmedMohamed500/Debit-Credit/pull/4) |
| Arabic route | `/ar` |
| English route | `/en` |
| Status | Implemented, verified, committed, and published to the PR preview |

## Product direction

The landing page now introduces Debit & Credit as a professional accounting career game. The opening experience uses a cinematic two-player competition scene, a visible career path, real product routes, and a clear local-demo boundary. It does not present the product as a course catalog or promise employment, live multiplayer, real employers, or guaranteed career outcomes.

Primary promise:

> منافسة حقيقية من أي مكان!

> Real competition. From anywhere.

Supporting loop:

```text
LEARN → APPLY → COMPETE → BUILD EVIDENCE → GROW YOUR CAREER
```

## Implemented page structure

### 1. Premium navigation

The public header includes Home, How It Works, Career Journey, Companies, Competition, Career Tools, and Pricing anchors. Language, theme, demo access, and free-start controls remain available. Internal game navigation was not changed.

### 2. Two-player cinematic hero

The hero combines a clean generated career-competition scene with real HTML content:

- Local-demo label.
- Arabic and English headline and supporting copy.
- Two preview player/mission panels.
- A central VS marker.
- A five-node company progression path.
- Localized onboarding and journey CTAs.

The visual asset is stored at `public/landing/career-league-hero-v2.png`. Text, buttons, missions, progress labels, and links are DOM elements rather than text baked into the image.

### 3. Truthful product metrics

The strip below the hero uses current product facts:

- 3 starting personas.
- 9 career levels.
- 5 company tiers.
- 53 curriculum-map modules.

No fabricated live-player, hiring, or job-offer counts appear.

### 4. Playable career journey

Five game-world stages explain progression:

1. Accounting Bootcamp.
2. Mizan Trading.
3. Bigger Companies.
4. Month-End.
5. Finance Manager.

Available, progress-gated, coming-soon, and career-goal states are visible. The CTA opens the existing localized company progression route.

### 5. Three product pillars

- **Competition:** opens the existing local/demo leaderboard.
- **Evidence-based Auto CV:** uses the real Auto CV preview and opens the implemented CV route.
- **Professional Skills:** presents the broader learning roadmap and opens the implemented Skill Passport route.

### 6. Illustrative journey voices

The student, graduate, and working-accountant quotes are explicitly labeled as illustrative journey voices, not published customer reviews.

### 7. Cinematic career CTA

The final scene uses the existing Mizan career-city artwork with a real HTML ladder from Accountant to Finance Manager. It states that the current experience is a local preview, needs no payment card, supports Arabic and English, and saves progress on the current device.

## Claim boundaries

The public page does not claim:

- A live online player population.
- Real-time multiplayer.
- Employer partnerships or employer discovery.
- Real vacancies or unlocked job offers.
- Guaranteed promotion, hiring, certification, or salary outcomes.
- Verified professional evidence from local gameplay.

Competition is labeled `Local competition preview` / `منافسة محلية تجريبية`. Mizan Trading and the career ladder remain simulations.

## Responsive and localization behavior

The page supports RTL Arabic and LTR English. Desktop keeps the wide cinematic composition. Mobile stacks the player panels, preserves the career nodes, converts the journey to a touch-scrollable game path, stacks the product pillars, and keeps the final career ladder visible.

Verified viewports:

| Locale | Viewport | Direction | Horizontal overflow | Browser errors |
| --- | --- | --- | ---: | ---: |
| Arabic | 1920×1080 | RTL | 0px | 0 |
| English | 1920×1080 | LTR | 0px | 0 |
| Arabic | 390×844 | RTL | 0px | 0 |

## Accessibility

- One semantic H1 and ordered section headings.
- Localized descriptive hero and Auto CV image alternatives.
- Visible labels for progression states.
- Text labels in addition to color and icons.
- Keyboard-accessible links and navigation.
- Reduced-motion fallback.
- Locale retained in every internal route.

## Implementation files

- `components/platform/landing-career-v4.tsx`
- `components/platform/marketing-landing.tsx`
- `components/platform/platform-nav.tsx`
- `app/landing-v4.css`
- `app/layout.tsx`
- `tests/platform-ui.test.tsx`
- `artifacts/verify-landing-v4.mjs`
- `public/landing/career-league-hero-v2.png`

## Review artifacts

- `artifacts/landing/landing-home-ar-1920.png`
- `artifacts/landing/landing-home-en-1920.png`
- `artifacts/landing/landing-home-ar-mobile-390.png`

## Verification

Focused verification completed before the full quality gate:

- Landing/platform UI tests: 10 passed.
- ESLint on changed implementation and test files: passed with zero warnings.
- TypeScript: passed.
- Browser QA: hero image loaded, locale direction correct, all required navigation anchors present, no console/page errors, and no horizontal overflow.

The full `npm run check` passed on 2026-09-20:

- ESLint: passed with zero warnings.
- TypeScript: passed.
- Vitest: **330 tests passed across 47 test files**.
- Production build: passed.

## Release record

- Implementation commit: `16f40acf51d5a8077920a4d10e9f2f2438b06162`
- GitHub branch: `codex/career-league`
- Pull Request: [#4 — Career League](https://github.com/AhmedMohamed500/Debit-Credit/pull/4) — Open and clean
- Vercel status: successful for the exact implementation commit
- Exact deployment: <https://debit-credit-b93frf2l6-ahmed-mohameds-projects-c51bc2cc.vercel.app>
- Arabic: <https://debit-credit-b93frf2l6-ahmed-mohameds-projects-c51bc2cc.vercel.app/ar>
- English: <https://debit-credit-b93frf2l6-ahmed-mohameds-projects-c51bc2cc.vercel.app/en>
- Stable branch preview: <https://debit-credit-git-codex-f76031-ahmed-mohameds-projects-c51bc2cc.vercel.app>
- Deployment Protection: enabled by the existing Vercel project setting; anonymous visits redirect to Vercel login.
