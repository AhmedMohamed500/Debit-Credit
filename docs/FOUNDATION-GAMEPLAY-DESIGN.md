# Foundation Gameplay Design

The approved reference sets the bright business-park map, soft panels, character-led mission presentation and beginner hierarchy. The implementation uses white, sky blue, beige, restrained gold rewards and green success states. Gameplay text, numbers, mission labels, documents, balances and actions are real React/HTML, not baked into artwork.

## Reused architecture

- `AccountingBootcamp`: existing entry point; orchestration only.
- `FoundationWorldMap`: 12 mission nodes, one final boss; completed/available/locked states. Mobile replaces absolute map positions with a vertical journey.
- `GuideCharacter`, `MoneyFlow`, `FoundationIcon`: short contextual dialogue and tangible movement.
- `FoundationMissionGameplay`: mechanic dispatch; drag/tap classification, document matching, account placement, physical equation scale, movement controls and debit/credit lanes.
- `BeginnerJournalBuilder`: account and amount pieces, tap placement, drag drop, editable account/amount rows, live debit/credit/difference totals. Uses the shared accounting validator and then scenario-specific economic validation.
- `AccountingCycleJourney`, `SourceDocument`, `EntryLines`, `FoundationBooks`: transaction-to-report views and accepted boss projections.
- `lib/bootcamp/foundation-catalog.ts`: bilingual mission/task/transaction contract, seven starter accounts using existing Account City codes, and consistent boss fixtures.
- `lib/bootcamp/engine.ts`: deterministic ordered task validation, mission progression, migration and accepted-entry book calculations.
- `BrowserBootcampRepository`: existing local key, versioned upgrade, stable external-store hydration, drafts and unavailable-storage recovery.

The sequence is SEE → TRY → DECIDE → EFFECT → SHORT EXPLANATION. The guide supplies a question or small hint, not immediate answers. Wrong actions do not advance a task, unvisited evidence does not allow posting, future tasks cannot be skipped, and a current mission must be completed before its successor opens.

## Artwork provenance

Generated with the built-in image tool; no runtime AI or paid API dependency was added. Final project assets: `public/foundations/world-v1.png` and `public/foundations/guide-v1.png`. Guide alpha transparency is preserved.

Map prompt: sunny premium 3D beginner business park, a lake and soft winding beige paths, landscaped green islands, low-rise glass company as final destination, skyline and blue sky; attached reference is style/composition guidance only; no character, text, numbers, labels, UI, neon or dark background.

Guide prompt: single friendly Egyptian youthful cartoon guide inspired by the welcoming reference character; expressive brown eyes, dark wavy hair, sky-blue shirt, lightweight navy open jacket/backpack, waist-up welcoming open-hand gesture; soft bright animated-game rendering; genuinely transparent background, no text or speech bubble.

Arabic uses a locally bundled Cairo variable font from the official Google Fonts repository, with its SIL Open Font License at `public/foundations/Cairo-OFL.txt`. No external font request is required at runtime. Desktop guide height is independent of long journal forms, keeping the character visible.

## Responsive and access

Desktop preserves the cinematic game park and character/game layout. At ≤700px the map becomes a readable vertical node path; missions stack story, interaction, feedback and continuation. All drag interactions have tap/keyboard-accessible controls. Focus is visible; reduced-motion preferences disable movement. Arabic is RTL, with numeric workpapers and debit/credit lanes isolated LTR where appropriate. The stage stays light without modifying the user's global theme preference.

## Deliberate limits

This is guided foundation practice, not ERP, real company data, professional assessment, taxation or certified competence. The boss includes inventory-cost recognition to prevent fictitious profit or collecting uncreated receivables. Its documents are explicitly local simulated training documents. Existing career, accounting cases and protected Account City datasets are unchanged.
