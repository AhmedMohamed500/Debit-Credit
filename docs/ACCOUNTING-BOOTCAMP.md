# Accounting Bootcamp

## Purpose

Accounting Bootcamp is the Level 0 entry world for players who choose **Start from the beginning**. It teaches the mental model of business activity before Mizan Trading opens. It is a playable foundation route, not a lecture page.

## Mission route

1. What Is a Business?
2. Why Accounting Exists
3. Transaction Radar
4. Build the Accounting Equation
5. Enter Account City
6. Increase and Decrease Lab
7. Translate Movement into Debit and Credit
8. Document Dock
9. Build Your First Journal
10. Boss: Start Mizan Trading

Each station requires concrete interactions. Stations unlock in order. The boss requires six balanced account-pair decisions; Mizan Trading remains locked until all six are accepted.

## Architecture

- `lib/bootcamp/catalog.ts` contains bilingual mission content and expected decisions.
- `lib/bootcamp/engine.ts` owns deterministic unlock, attempt, completion and migration rules.
- `lib/bootcamp/repository.ts` is the only Bootcamp module that accesses browser storage.
- `components/platform/accounting-bootcamp.tsx` renders the interactive route.
- `/[locale]/bootcamp` is the public localized entry route.

The storage key is `debit-credit-bootcamp-v1`. Reads pass through a defensive migration so malformed or older local data cannot grant boss completion or unlock Mizan.

## Evidence integrity

Every Bootcamp mission is tagged `practice-only`. Bootcamp progress never creates professional Skill Passport evidence, never produces Verified evidence, and does not write XP or Coins. Wrong choices are counted as retries and do not complete required actions.

## Integration

- Onboarding sends the foundation choice to Bootcamp.
- The placement challenge remains the alternate entry route.
- Mission 5 links to the full Account City with `return=bootcamp` and displays a return action there.
- Completing Mission 10 opens the existing Mizan Trading game route without replacing its save state or accounting engine.

## Validation

Engine tests cover sequential unlocks, retry behavior, the six-entry boss gate, storage migration and practice-only evidence. UI tests cover the 10-station bilingual route and RTL/LTR rendering.
