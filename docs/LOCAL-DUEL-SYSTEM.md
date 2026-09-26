# Local Duel System

1. Choose two local profiles. The current player becomes A; the selected opponent becomes B. `beginDuel` locks the exact challenge ID, version, seed and scenario.
2. A inspects evidence and submits a professional decision and debit/credit posting. Only a sealed completion message is shown. A's result is withheld from shared ranked standings until B finishes.
3. Switch profiles. B receives the same locked challenge. No A answer, detailed score or solution is displayed before B submits.
4. `duelComparison` reveals both normalized scores and each dimension. A tie remains a draw. Different-level duels are unranked local practice.

These are two players on one browser/device, not live multiplayer. The shared duel object stores only comparison summaries; private career state remains profile-scoped. Local storage can be edited, so all duel results are explicitly unverified. A duel win does not itself create a professional skill.
