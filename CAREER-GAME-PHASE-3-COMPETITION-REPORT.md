# Career Game Phase 3 — Competition V2 report

Date: 2026-09-26 · Branch: `codex/career-league`

## Released local competition

`/[locale]/leaderboard` is a bilingual local Career League hub with a daily approved-case challenge, two local profiles on the same seeded case, a sealed Player A phase, a dimension-by-dimension comparison after Player B, true ties, weekly same-league standings, streaks, game awards, player management and a challenge library. The Game Hub links to the league. Released full First Shift and Bank Reconciliation experiences are presented as boss-style missions; no fake unfinished boss is unlocked.

The daily case is deterministic by date/league/version. Practical draws from approved First Shift content; General uses the approved bank-fee adjustment item; Foundation is a non-ranked preview; Advanced Review and Finance Leadership are locked. A ranked result is unique per profile/challenge/version/scoring version, and replays are practice. Scoring weights accuracy 30, judgment 22, investigation 18, risk awareness 12, documentation 8, first attempt 5 and consistency 5 percent, with speed omitted. The weekly board displays local profiles only. See [Competition V2](docs/COMPETITION-V2.md), [duels](docs/LOCAL-DUEL-SYSTEM.md) and [scoring](docs/CAREER-LEAGUE-SCORING.md).

Local JSON result export/import validates schema, challenge version/seed and checksum, but remains explicitly **unverified**. No real online player, global leaderboard, remote identity or server timestamp is claimed. Player save snapshots isolate career, CV, First Shift and Bank Reconciliation data; comparison summaries are game-only. Badges/titles have deterministic rules and never create professional skills or CV experience. See [offline boundary](docs/OFFLINE-COMPETITION.md), [awards](docs/GAME-TITLES-AND-BADGES.md) and [future backend](docs/FUTURE-ONLINE-COMPETITION.md).

## Verification and honest limits

- `npm run check`: zero-warning ESLint, TypeScript, 358 tests / 52 files, production build passed.
- Browser inspection covered the Arabic competition hub at 390px and 1440px, English LTR at 1440px and a daily-case launch, with no page-level horizontal overflow or console errors observed.
- The compact challenge is a scored case exercise, not the full professional mission. It does not independently write Skill Passport evidence; qualifying work in the full underlying mission follows existing evidence rules.
- No dedicated ranked boss run, real season reset/history, secure offline attestation, online matchmaking, server fairness or authenticated cross-device sync exists yet. Foundation's official content and advanced specialist leagues are still pending approved cases.
- Saved review image: `artifacts/competition-v2/competition-hub-ar-1920.png`. Other named daily/duel/result/mobile screenshots from the brief remain uncaptured; they are not claimed as completed.
