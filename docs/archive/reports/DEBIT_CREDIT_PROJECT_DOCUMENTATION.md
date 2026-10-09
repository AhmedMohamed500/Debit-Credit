# Debit & Credit — Product Documentation

## Product boundary

Debit & Credit by Money Coder is the accounting education product. FINORA remains the operational accounting/business product. This repository contains no customer, supplier, invoice, treasury, VAT center, POS, production, period-closing, company workspace, or operational reporting module.

## Runtime architecture

- Next.js App Router, React, and TypeScript.
- Locale-first routes (`/ar/*` and `/en/*`) with RTL/LTR at the localized layout.
- Static TypeScript curriculum and scenario data.
- Browser-only persistence through LocalStorage.
- Education-only accounting core for account classification, postability, totals, and journal validation.
- Independent scoring engines for Money Flow, Missions, Detective, and Arena.
- A progress dashboard aggregates the individual stores without coupling their engines.

## Route map

| Route | Purpose |
| --- | --- |
| `/[locale]` | Product landing page |
| `/[locale]/learn` | Learning journey and courses |
| `/[locale]/account-guide` | Nature and behavior of accounts |
| `/[locale]/journal-entry` | Journal entry practice |
| `/[locale]/money-flow` | Scenario catalog |
| `/[locale]/money-flow/[slug]` | Interactive money-flow lab |
| `/[locale]/missions` | Mission catalog |
| `/[locale]/missions/[slug]` | Mission player |
| `/[locale]/detective` | Case catalog |
| `/[locale]/detective/[slug]` | Investigation workspace |
| `/[locale]/arena` | Arena home |
| `/[locale]/arena/career` | Professional simulation |
| `/[locale]/arena/daily` | Daily challenge |
| `/[locale]/arena/profile` | Detailed Arena profile |
| `/[locale]/profile` | Unified learner progress |
| `/[locale]/leaderboard` | Local learner ranking view |

Legacy Academy URLs remain redirects or compatibility routes so saved educational links do not break.

## Educational chart of accounts

`data/accounts.ts` owns a static educational chart. Every account contains an ID, code, Arabic and English labels, account type, normal balance, debit/credit behavior, posting eligibility, hierarchy, and statement classification. Arena, lessons, and journal validation consume this catalog; it is not read from a company workspace.

## Scoring and progress

Arena preserves the extracted professional scoring model: accuracy 45%, difficulty 20%, consistency 15%, error detection 10%, and efficiency 10%. Ranked skill calculations use the best result per unique case where the original engine requires it. Mission, Detective, and Money Flow stores retain best scores while counting retries.

The unified profile derives overall completion, XP signals, streak, completed lessons, missions, cases, flows, skill strengths, weak areas, and Arena readiness from the independent stores.

## Accessibility and responsive behavior

The shell uses semantic links/buttons, visible focus behavior, labeled navigation, RTL/LTR direction, and responsive grids. Money Flow retains drag interaction and provides click/tap account selection as an alternative. Mission and Detective workspaces use native controls and responsive layouts.

## Future extension

Storage and engines are separated from UI so a later adapter can synchronize authentication, cloud progress, subscriptions, recruitment profiles, or a real leaderboard. No such backend is included now.
