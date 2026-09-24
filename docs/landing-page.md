# Landing Page V4 — crisp text-first rebuild

The public Arabic/English landing page is implemented in `components/platform/landing-career-v4.tsx`, styled by `app/landing-v4.css`, and mounted below the shared marketing navigation by `components/platform/marketing-landing.tsx`.

## Why it was rebuilt

The previous composition stretched 1672×941 screenshots across wide viewports. Those screenshots contained headings, labels, and buttons baked into the pixels, so the most important copy became soft at desktop scale and too small on phones. The active landing no longer uses those full-page screenshots.

All headings, descriptions, statuses, and calls to action are now semantic HTML. The artwork is text-free and is displayed at or below its native width; `next/image` supplies responsive variants without artificial sharpening or browser scaling of embedded text.

## Active artwork

| Section | Asset | Treatment |
| --- | --- | --- |
| Hero | `public/landing/career-league-hero-v2.png` | Contained inside the two-column hero; never stretched full-bleed |
| Career journey | `public/landing/career-journey-world-v2.webp` | Capped at 1400px and paired with five real HTML stage cards |
| Product features | `competition-world-v2.webp`, `career-future-v2.webp`, `skills-world-v2.webp` | Three responsive cards with live copy and links |
| Example journeys | `player-journeys-v2.png` | Cropped into three decorative portraits; all explanatory copy remains HTML |
| Final CTA | `career-future-v2.webp` | Image and CTA copy are separate grid columns |

The discarded `approved-*.png` files remain historical repository assets only; the current component does not reference them.

## Routes

The locale prefix (`/ar` or `/en`) is added automatically.

| UI action | Route |
| --- | --- |
| Start / final CTA | `/onboarding` |
| Accounting Bootcamp | `/bootcamp` |
| Mizan Trading | `/game` |
| Structured Company / explore companies | `/career-league/companies` |
| Month-End Close | `/game/month-end` |
| Finance Leadership | `/career-league/promotion` |
| Competition | `/leaderboard` |
| CV | `/career-profile/cv` |
| Skills | `/career-profile/skills` |

## Readability and responsive behavior

- The desktop hero uses a bounded 1440px grid, generous line height, and live type that remains sharp at every device scale.
- The landing header is a compact 60px (54px on phones) and stays in normal document flow, so it never overlays the hero artwork while scrolling.
- At 800px the hero, feature cards, and final CTA stack. At 560px actions become full-width and the journey becomes a single readable column.
- Arabic uses the inherited RTL direction and English uses LTR. Buttons and arrows adapt to the locale.
- Decorative artwork has empty alternative text; meaningful hero artwork has localized alternative text.
- Visible focus, reduced-motion handling, light/dark themes, and truthful local-simulation disclosure are retained.
- Month-End is the only stage visually marked as in development. Promotion is an active career goal and links to the implemented assessment.

## Claim boundaries

The page describes a local learning simulation. It does not claim live users, employer partnerships, guaranteed jobs, accredited certificates, or externally verified evidence. Example player journeys are explicitly illustrative.

## Verification

The page was inspected in a real browser at desktop size and at 390×844. Both layouts showed sharp live copy, readable buttons, clean imagery, and no horizontal overflow. ESLint, TypeScript, the Vitest suite, and the production Next.js build are the required release gate.
