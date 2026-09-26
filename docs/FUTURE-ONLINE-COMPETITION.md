# Future Online Competition Boundary

The project currently has no backend, authentication, online matchmaking, live leaderboard or trusted clock. Existing `lib/local-competition/contracts.ts` declares remote repository boundaries without network behavior. Before claiming real online competition, a future implementation needs consent-aware identity, server-issued challenge versions/seeds, signed attempts and timestamps, anti-replay/idempotency, anti-cheat review, privacy controls, cross-device profile sync, fair rank snapshots and dispute handling. Those changes must not silently turn local unverified evidence into professional verification.

Current season metadata is a local preview; advanced, IFRS and certification content remains locked until reviewed cases exist. A server architecture should keep local-first gameplay available offline and explicitly label sync/trust state.
