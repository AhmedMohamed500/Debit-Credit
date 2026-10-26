# Security dependency upgrade — 2026-10-26

## Scope

This change is the security-first part of the Phase 2 cleanup. It updates the
current supported package lines without changing the database schema, auth
contract, product routes, pricing, progress data, or visual design.

## Updated packages

| Package | Before | After |
| --- | --- | --- |
| `next` | lockfile `16.4.0` | `16.4.3` |
| `eslint-config-next` | lockfile `16.4.0` | `16.4.3` |
| Prisma client, CLI, and adapters | `7.10.0` | `7.10.1` |
| `zod` | `4.6.5` | `4.6.7` |
| `vitest` | `3.2.7` | `5.0.5` |
| `vite` | transitive `7.3.6` | direct test peer `8.3.5` |

The Next.js patch removes the audited vulnerable `16.4.0` version associated
with `GHSA-2464-fhr4-w9xw`, `GHSA-p3m5-59mp-jv5r`, and
`GHSA-673q-mjm6-r5xr`. The Prisma and Zod patch updates also remove their
previous audit findings.

Vitest was upgraded manually rather than through a forced audit rewrite. Vite
is now declared explicitly because it is a required Vitest 5 peer dependency.
The complete 720-test suite passes on the new major version.

## Auth routing regression coverage

The browser regression now follows the current landing destination instead of
the obsolete homepage expectation:

- Landing CTA -> localized signup with `next=/{locale}/onboarding`.
- Signup -> separate localized login, preserving the same safe internal next.
- First sign-in -> required personal details -> requested onboarding.
- Existing sign-in -> requested onboarding.
- Authenticated homepage -> Excel Foundations as the current curriculum entry.
- Logout -> localized landing -> login.
- Session cookie remains `HttpOnly`.
- Arabic and English were exercised at 1920, 1440, and 390 px.

The test deliberately waits for the real 10-request/minute local auth window
instead of clearing, weakening, or disabling rate limiting. Failure output now
includes child-process stderr and nested error causes so a database or network
failure is diagnosable.

## Validation completed

- `npm ci` — pass; Prisma Client generated with `7.10.1`.
- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run test` — pass, 86 files and 720 tests.
- `npm run build` — pass with Next.js `16.4.3`.
- `npm run test:auth-browser` — pass, all Arabic/English desktop/mobile flows
  and no uncaught browser errors.

## Audit result

`npm audit` and `npm audit --omit=dev` both report **0 vulnerabilities** after
the verified Vitest/Vite upgrade and the non-breaking transitive `fast-uri`
patch. No `npm audit fix --force` was used.

