# Debit & Credit — Student Game World

Brand: by Money Coder

## Reference comparison before implementation

The supplied reference was reviewed before coding. Its target is an immersive accounting game command center, with a learning map on the left, the player and active mission in the center, supporting game modes on the right, and competitive/career progression at the bottom.

| Previous UI | Reference direction | Implemented result |
| --- | --- | --- |
| Large promotional headline and empty white hero | Enter the game immediately | Compact command-center title and active player console |
| Separate website sections | One connected game composition | Three-column desktop game board |
| Small horizontal level preview | Large visual map with unlocks | Mountain landscape, eight checkpoint nodes, connected path, locks and glowing current node |
| Plain metrics and cards | Player HUD, rewards and progression | Persistent HUD, XP meter, coins, streak, badge vault and next reward requirements |
| Plain skill grid | Skills earned through play | Three connected skill branches with shield badges, earned states and practice links |
| Different visual identities inside modules | One game world | Scoped navy/blue mission panels across practice, missions, investigation, Arena, profile and career |
| Fragile mobile navigation and tablet layouts | Playable on smaller screens | Explicit 320–1440px layouts, touch targets, wrapping investigation tabs and Arena navigation |

The reference is used for composition and hierarchy. The landscape is responsive SVG/CSS artwork created in the repository; the reference image is not pasted over the application.

## Main student experience

- **Left:** persistent eight-level map with terrain, numbered checkpoint labels, unavailable levels and XP requirements.
- **Center:** player identity, level, XP, coins, streak, badges, progress to the next level, current mission, rewards, continue-learning action and today's challenges.
- **Right:** achievement vault, the next unearned badge and its actual requirement, Detective Mode and earned skill highlights.
- **Bottom:** Arena, daily challenge, leaderboard and career readiness.
- **Phone:** player status and active mission first; map and secondary modes follow in a single-column flow with a fixed bottom navigation.
- **Tablet:** the composition moves through two-column and stacked layouts instead of squeezing desktop columns.

## Inside the platform

### Learning map

The full map page now pairs the landscape/checkpoint navigation with level objectives. Available checkpoint links navigate to the corresponding level anchor. Locked checkpoints display their XP threshold and do not expose a playable link.

Unlocks continue to use the existing canonical player level and XP thresholds. No fabricated completions or seeded player scores were introduced.

### Practice and missions

The journal challenge engine uses the same game room styling, with readable input controls, reward labels, evaluation feedback and large action buttons. Mission scenario, decision, accounting impact, journal, explanation and result stages share the same panel treatment.

### Detective

The case overview, evidence workspace, notebook, conclusion controls and result rooms use the blue investigation theme. Tablet/mobile tabs wrap instead of hiding critical controls outside the visible area.

### Arena

Arena entry, career simulation, chart-of-accounts interactions, journal controls, career stages, health metrics and navigation are visually integrated. The internal account-nature guide itself is excluded.

### Skills, profile and career

Skills are organized into Accounting Foundations, Accounting Cycle and Professional Mastery branches. Unmeasured skills appear as not yet earned. Certificates retain their real requirements.

The player profile retains name editing and real collections. Career readiness adds visible progression milestones and keeps the existing readiness calculation and professional simulation links.

## Actual reward feedback

A global live notification listens to canonical player updates:

- XP and coin gains show the actual amount earned.
- Newly earned badges trigger an achievement notification.
- Crossing a level threshold announces the new level.
- Returning to the site does not announce old rewards.
- Identical replay attempts do not generate a reward notification.
- Notifications can be dismissed and also expire automatically.

## Protected Nature of Accounts

No changes were made to:

- `components/academy/account-guide.tsx`
- `data/account-learning-guide.ts`
- `app/[locale]/account-guide/page.tsx`

The existing hash-based regression test passes. The new theme is wrapped in `.student-world`; account-guide routes render under `.classic-world`, so the game theme does not alter their internal UI. The global progression connection is retained.

## Verification

- ESLint: passed, zero warnings.
- TypeScript and production build: passed.
- Automated tests: **136 passed across 18 files**.
- New interaction tests cover reward notification behavior, replay protection, level unlocking and Arabic checkpoint routes.
- Responsive audit: **45 route/viewport combinations**, at 320, 390, 768, 1024 and 1440 pixels.
- Final audit found no document horizontal overflow and no interactive controls outside the viewport in the tested pages.
- Arabic and English desktop/mobile screenshots were inspected.
- A complete mission was played manually: decision → impact → journal → explanation → result.
- The manual completion correctly awarded **100 XP and 35 coins**, updated the HUD and displayed the live reward notification.
- Mobile menu expansion, navigation and closing after link selection were verified.
- Browser console review: no warnings or errors in the final checked session.
- Classic route check: account guide renders outside the student game theme.

Checks were run through the installed Node entry points because the machine's global npm launcher pointed to a missing npm CLI file. No dependency changes were required.

## Files and architecture

New:

- `app/world.css`
- `components/game/world-map.tsx`
- `components/game/student-world.tsx`
- `components/game/reward-notice.tsx`
- `tests/game-world.test.tsx`

Refactored:

- Main command center
- Localized application wrapper
- Global and mobile navigation
- Learning map
- Skill branches
- Career milestones

Existing game engines, saved player data and reward rules remain in place. This is an implemented student UI refactor, not a new authentication backend, online multiplayer system or live recruiting service. Employer demo pages retain their separate presentation.

## Publication

- GitHub: [AhmedMohamed500/Debit-Credit](https://github.com/AhmedMohamed500/Debit-Credit)
- Arabic production: [debit-credit-nine.vercel.app/ar](https://debit-credit-nine.vercel.app/ar)
- English production: [debit-credit-nine.vercel.app/en](https://debit-credit-nine.vercel.app/en)
- Deployment status: local verification complete; production evidence will be recorded after publication.
