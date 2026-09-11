# Phase A UI Audit — First Shift and Nature of Accounts

Date: 11 September 2026  
Baseline commit: `e4466ed0d5752ef013a49a4f4581d6f970d4d557`  
Implementation commit: `b8bd85346a5631f82a63b15562657ef9a9a2e689`  
Branch: `codex/first-day-cinematic`

## Evidence boundary

The development plan cites two supplied screenshots: `32d5de2d-e01a-4785-bc3d-1a64fbf978da.png` at 1906×890 and `c861b88a-f70b-432f-ba7d-bfbf0fec8ed6.png` at 1877×953. Those original files were not present in the attachment or Downloads locations available during this run. The observations labelled **plan screenshot** below therefore come from the supplied plan and are not claimed as a second independent inspection of those files.

The application was run locally from the baseline commit state and browser-only baseline captures were taken at the same routes, languages and viewport sizes. Those captures are the direct visual evidence used for the implementation comparison.

## Screenshot-confirmed findings from the supplied plan

| Severity | Route / state | Language / viewport | Confirmed problem | Owning source and implemented correction |
|---|---|---|---|---|
| High | `/ar/account-guide` | Arabic, 1906×890 | Navigation, title, glossy category cards and book compete vertically; lower content is clipped or too close to the fold. | `app/accounting-manual.css`: changed the page to content flow, compacted the header and title, reduced category noise, and retained explicit internal page scrolling. |
| High | `/ar/account-guide` | Arabic, 1906×890 | Large rings occupy functional center space and can collide with content. | `app/accounting-manual.css`: the book now has an explicit 9% center gutter; readable and clickable content stays inside the two page columns. |
| Medium | `/ar/account-guide` | Arabic, 1906×890 | Account title, normal balance, movement, facts and cycle trail lack a stable hierarchy. | `app/accounting-manual.css`: aligned the title and balance badge, added consistent movement/facts grids, strengthened the cycle control, and matched both page heights. |
| Medium | `/ar/account-guide` | Arabic, 1906×890 | Large list rows show too few accounts and the scroll area is difficult to discover. | `app/accounting-manual.css`: reduced row height, increased density without shrinking body text below readable size, and made the scrollbar wider and higher contrast. |
| Medium | `/ar/account-guide` | Arabic, 1906×890 | Saturated glossy categories and the office portrait overpower the reference. | `app/accounting-manual.css`: replaced the glossy blocks with one muted selector system and reinforced the paper/content contrast while preserving the office and open-book identity. |
| High | `/ar` First Day intro | Arabic, 1877×953 | The tall HUD is fragmented across the viewport. | `components/campaign/cinematic-chapter-intro.tsx`, `app/first-day-entry.css`: introduced one compact max-width HUD grid for brand, shift context, guide and language controls. |
| High | `/ar` First Day intro | Arabic, 1877×953 | Chapter title, description and Start Story action are too far apart. | The intro now renders chapter label, title, mission copy, promise and CTA in one aligned live-DOM content block. |
| Medium | `/ar` First Day intro | Arabic, 1877×953 | Edge controls and layer seams look accidental. | Controls use safe insets and the header/hero share one continuous dark cinematic surface with a controlled divider. |

## Runtime-confirmed findings and reproduction

| Severity | Reproduction | Baseline result | Result after Phase A |
|---|---|---|---|
| High | Open `/ar/account-guide` at 1906×890. | Book pages started at y=281 with only 547px of height; the dense chrome and oversized controls left the lower reference crowded. | The selector is calmer, the book begins at y=323 in normal document flow, both pages use the same 600px height, and their internal content remains reachable. |
| High | Open `/ar` with empty storage at 1877×953. | Related HUD controls were distributed across the full width and the CTA was visually detached. | HUD elements share one grid; title, copy and CTA read as one group; the CTA remains visible. |
| High | Open the account guide at 360/390px. | A tall title and selectors delayed the single book page; the design was still visually compressed. | The guide uses a single-page list/detail pattern with 46px tabs, 64px account rows, a 16px search input and local horizontal category scrolling. |
| High | Start Supplier Invoice, enter a partial journal line, then close or refresh. | The component-local draft was lost. | Draft lines and hint attribution are stored in the existing game state and restored directly into the record step. |
| High | Submit the correct entry twice in one callback/event sequence. | A repeated successful callback could append duplicate evidence even though journal and rewards were guarded. | The domain returns the same state for a completed document before writing evidence, and the UI uses an immediate ref guard. One accepted attempt, journal entry and reward are produced. |
| Medium | Load malformed JSON from the existing storage key. | The game silently returned a fresh initial state. | It recovers to a safe initial state with an explicit storage warning marker instead of presenting the reset as a successful load. |

## Before and after pairs

| Route / viewport | Before | After | Layout rule changed |
|---|---|---|---|
| Nature of Accounts, Arabic, 1906×890 | [baseline](../artifacts/phase-a-before/nature-ar-1906x890.png) | [Phase A](../artifacts/phase-a-after/nature-ar-1906x890.png) | Fixed viewport packing was replaced by content flow, reserved gutter and matched page panes. |
| First Day intro, Arabic, 1877×953 | [baseline](../artifacts/phase-a-before/first-day-intro-ar-1877x953.png) | [Phase A](../artifacts/phase-a-after/first-day-intro-ar-1877x953.png) | Floating header/content rules were replaced by a shared HUD grid and one hero copy block. |
| Nature of Accounts, English, 390×844 | [baseline](../artifacts/phase-a-before/manual-en-390.png) | [Phase A](../artifacts/phase-a-after/manual-en-390.png) | Mobile uses one readable page at a time with explicit list/detail tabs. |
| First Day intro, Arabic, 390×844 | [baseline](../artifacts/phase-a-before/intro-ar-390.png) | [Phase A](../artifacts/phase-a-after/intro-ar-390.png) | Content is stacked in reading order and the primary action remains inside the useful first viewport. |

The numeric browser checks for 360, 390, 768, 1280, 1440 and both reference aspect ratios are stored in [before QA](../artifacts/phase-a-before/qa.json) and [after QA](../artifacts/phase-a-after/qa.json). Every tested viewport reported `overflow: 0`; the First Day CTA was visible in every tested intro viewport.

## Suggestions outside Phase A

- Run a short usability session with real new players before changing the visual hierarchy again.
- Test 200% text zoom and mobile virtual-keyboard behavior on physical devices as an accessibility follow-up.
- Keep Chapter 2 and career expansion outside this repair release, as required by the development plan.
