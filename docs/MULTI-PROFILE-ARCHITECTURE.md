# Local Multi-Profile Architecture

## Purpose

Multiple people can use one browser without mixing game, Bootcamp, placement, Career League, Skill Passport, Career Profile or CV preferences. This is a local device feature and does not provide accounts, passwords, cloud sync or verified identity.

## Migration

On first read, the current single-player storage is captured into **Default Local Profile**. No legacy save is deleted. Each profile owns a snapshot of the established versioned storage keys. Switching first captures the active snapshot, then restores the selected snapshot.

## Repository

`BrowserMultiProfileRepository` is the only multi-profile module that reads or writes browser storage. It owns `debit-credit-multi-profile-v1` and supports:

- profile creation;
- active-profile switching;
- per-profile save isolation;
- JSON export;
- validated JSON import;
- migration from the existing single-player state.

Export packages remain local files. They are not identity or verification records.

## Future backend boundary

Remote repository contracts are declared for authentication, profiles, competition, leaderboards, employers, verified assessment and CV sync. They intentionally have no remote implementation in this frontend-only phase.
