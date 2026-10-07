import assert from "node:assert/strict";
import pg from "pg";
const base = "http://localhost:3110",
  pool = new pg.Pool({
    connectionString:
      "postgresql://postgres:local-test-only@127.0.0.1:55432/app_phase1_test",
  });
// Destructive fixture cleanup is restricted to this dedicated localhost test database.
const target = new URL(pool.options.connectionString);
assert.equal(target.hostname, "127.0.0.1");
assert.equal(target.pathname, "/app_phase1_test");
await pool.query("DELETE FROM app_user");
await pool.query("DELETE FROM auth_rate_limit");
await pool.query("DELETE FROM competition_match");
let passed = 0;
const check = (name, condition) => {
  assert.ok(condition, name);
  passed++;
  console.log("PASS", name);
};
class Client {
  cookies = new Map();
  async call(path, method = "GET", data) {
    const r = await fetch(base + path, {
      method,
      headers: {
        Origin: base,
        ...(data ? { "Content-Type": "application/json" } : {}),
        Cookie: [...this.cookies].map(([k, v]) => k + "=" + v).join("; "),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    for (const raw of r.headers.getSetCookie()) {
      const pair = raw.split(";")[0],
        i = pair.indexOf("=");
      this.cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    const text = await r.text();
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      value = { html: true };
    }
    return { status: r.status, value, headers: r.headers };
  }
}
const a = new Client(),
  b = new Client(),
  guest = new Client(),
  password = "Phase1-test-pass!123";
check(
  "guest private API denied",
  (await guest.call("/api/v1/me")).status === 401,
);
check(
  "signup role forgery rejected",
  (
    await guest.call("/api/auth/sign-up/email", "POST", {
      name: "Forged",
      email: "forged@phase1.test",
      password,
      role: "ADMIN",
    })
  ).status === 400,
);
check(
  "Ahmed signup",
  (
    await a.call("/api/auth/sign-up/email", "POST", {
      name: "Ahmed",
      email: "qa-a@phase1.test",
      password,
    })
  ).status === 200,
);
check(
  "Mohamed signup",
  (
    await b.call("/api/auth/sign-up/email", "POST", {
      name: "Mohamed",
      email: "qa-b@phase1.test",
      password,
    })
  ).status === 200,
);
const meA = (await a.call("/api/v1/me")).value,
  meB = (await b.call("/api/v1/me")).value;
check(
  "separate stable user IDs",
  meA.user.id !== meB.user.id && /^[a-f0-9-]{36}$/.test(meA.user.id),
);
check(
  "unverified owner allowlist cannot grant ADMIN",
  meA.user.role === "USER",
);
check(
  "normal user cannot access admin",
  (await b.call("/api/v1/admin/overview")).status === 403,
);
check(
  "wrong password denied",
  (
    await guest.call("/api/auth/sign-in/email", "POST", {
      email: "qa-b@phase1.test",
      password: "incorrect-password",
    })
  ).status === 401,
);
check(
  "invalid session denied",
  (
    await fetch(base + "/api/v1/me", {
      headers: { Cookie: "app.session_token=invalid" },
    })
  ).status === 401,
);
check(
  "CSRF origin denied",
  (
    await fetch(base + "/api/v1/me/activity", {
      method: "POST",
      headers: {
        Origin: "https://attacker.invalid",
        "Content-Type": "application/json",
        Cookie: [...a.cookies].map(([k, v]) => k + "=" + v).join("; "),
      },
      body: "{}",
    })
  ).status === 403,
);
check(
  "forged ownership rejected",
  (
    await a.call("/api/v1/me/profile", "PUT", {
      ...meA.profile,
      revision: meA.profile.updatedAt,
      userId: meB.user.id,
    })
  ).status === 400,
);
// Local test-only verified-owner fixture; no Google or email verification is claimed.
await pool.query('UPDATE app_user SET "emailVerified"=true WHERE id=$1', [
  meA.user.id,
]);
check(
  "verified allowlisted owner promoted",
  (await a.call("/api/v1/me")).value.user.role === "ADMIN",
);
check(
  "database total users is exactly two",
  (await a.call("/api/v1/admin/overview")).value.total === 2,
);
const first = (await a.call("/api/v1/admin/users?take=1")).value;
check(
  "admin pagination",
  first.rows.length === 1 &&
    !!first.nextCursor &&
    (await a.call("/api/v1/admin/users?take=1&cursor=" + first.nextCursor))
      .value.rows.length === 1,
);
check(
  "admin private email search",
  (await a.call("/api/v1/admin/users?search=qa-b")).value.rows.length === 1,
);
check(
  "optional reset correctly unavailable",
  (
    await a.call("/api/auth/request-password-reset", "POST", {
      email: "qa-a@phase1.test",
    })
  ).status === 503,
);
const profilePayload = {
  displayName: "Ahmed Cloud",
  handle: "ahmed-cloud-test",
  avatar: "blue",
  locale: "ar",
  persona: "graduate",
  targetRoleId: "junior-accountant",
  revision: meA.profile.updatedAt,
};
check(
  "cloud profile update",
  (await a.call("/api/v1/me/profile", "PUT", profilePayload)).status === 200,
);
check(
  "profile isolation",
  (await b.call("/api/v1/me/profile")).value.displayName === "Mohamed",
);
check(
  "stale profile revision rejected",
  (await a.call("/api/v1/me/profile", "PUT", profilePayload)).status === 409,
);
const fresh = new Client();
check(
  "email signin",
  (
    await fresh.call("/api/auth/sign-in/email", "POST", {
      email: "qa-a@phase1.test",
      password,
    })
  ).status === 200,
);
check(
  "fresh client restores profile",
  (await fresh.call("/api/v1/me/profile")).value.displayName === "Ahmed Cloud",
);
const foundation = {
  commandId: crypto.randomUUID(),
  missionId: "business-world",
  taskId: "investment-flow",
  revision: 0,
  response: ["move"],
};
const catalog = (await pool.query("SELECT COUNT(*) FROM mission_attempt")).rows;
void catalog;
check(
  "fake score rejected",
  (
    await a.call("/api/v1/me/progress", "POST", {
      ...foundation,
      score: 100,
      verified: true,
    })
  ).status === 400,
);
let revision = 0;
const command = {
  commandId: crypto.randomUUID(),
  missionId: "business-world",
  taskId: "transfer",
  revision,
  response: ["move"],
};
const step = await a.call("/api/v1/me/progress", "POST", command);
check(
  "foundation engine accepts real answer",
  step.status === 200 && step.value.correct === true,
);
revision = step.value.revision;
check(
  "foundation command replay is idempotent",
  (await a.call("/api/v1/me/progress", "POST", command)).value.replayed ===
    true,
);
check(
  "command ID cannot be reused for different answers",
  (
    await a.call("/api/v1/me/progress", "POST", {
      ...command,
      response: ["wrong"],
    })
  ).status === 409,
);
const affected = await a.call("/api/v1/me/progress", "POST", {
  commandId: crypto.randomUUID(),
  missionId: "business-world",
  taskId: "affected",
  revision,
  response: ["cash", "capital"],
});
check(
  "foundation second answer accepted",
  affected.status === 200 && affected.value.correct,
);
const completed = await a.call("/api/v1/me/progress", "POST", {
  commandId: crypto.randomUUID(),
  missionId: "business-world",
  taskId: "@complete",
  revision: affected.value.revision,
  response: [],
});
check(
  "foundation completion comes from server",
  completed.status === 200 &&
    completed.value.data.completedMissionIds.includes("business-world"),
);
check(
  "completed foundation reward cannot duplicate",
  (
    await pool.query(
      "SELECT count(*)::int n FROM accepted_outcome WHERE domain='foundations'",
    )
  ).rows[0].n === 1,
);
check(
  "fresh session restores supported progress",
  (
    await fresh.call("/api/v1/me/progress")
  ).value.foundations.data.completedMissionIds.includes("business-world"),
);
const bank = {
  commandId: crypto.randomUUID(),
  matches: { "s-receipt": "b-receipt", "s-supplier": "b-supplier" },
  classifications: {
    "s-fee": "book-adjustment",
    "s-direct": "book-adjustment",
    "b-transit": "timing",
    "b-cheque": "timing",
  },
  journals: [
    { itemId: "s-fee", debit: "bank-charges", credit: "bank", amount: 250 },
    {
      itemId: "s-direct",
      debit: "bank",
      credit: "accounts-receivable",
      amount: 4000,
    },
  ],
};
check(
  "bank engine calculates accepted workpaper",
  (await a.call("/api/v1/me/bank", "POST", bank)).value.work.completedAt,
);
check(
  "bank replay cannot duplicate accepted postings",
  (await a.call("/api/v1/me/bank", "POST", bank)).value.replayed === true,
);
check(
  "bank posting uniqueness",
  (
    await pool.query(
      "SELECT count(*)::int n FROM accepted_outcome WHERE domain='bank-reconciliation'",
    )
  ).rows[0].n === 1,
);
check(
  "server bank evidence is not Verified",
  (await a.call("/api/v1/me/progress")).value.evidence.every(
    (e) =>
      e.strength !== "verified" &&
      e.data.assessmentIntegrity !== "verified_server",
  ),
);
const importBody = {
  // The migration snapshot is intentional legacy data, not injected cloud completion.
  version: 1,
  deviceId: crypto.randomUUID(),
  mode: "merge",
  domains: {
    "debit-credit-career-profile-v1": {
      fullName: "Legacy local name",
      version: 1,
    },
  },
};
check(
  "partial legacy import",
  (await a.call("/api/v1/migration/legacy", "POST", importBody)).status === 200,
);
check(
  "legacy import idempotent",
  (await a.call("/api/v1/migration/legacy", "POST", importBody)).value
    .replayed === true,
);
check(
  "legacy import isolated",
  (await b.call("/api/v1/me/progress")).value.domains.length === 0,
);
const lobby = (await a.call("/api/v1/competition/lobby")).value;
check(
  "no hidden challenge answers",
  !Object.hasOwn(lobby.challenge, "debit") &&
    !Object.hasOwn(lobby.challenge, "credit") &&
    !Object.hasOwn(lobby.challenge, "amount"),
);
check(
  "no private email in lobby",
  !JSON.stringify(lobby).includes("@phase1.test"),
);
// Only the dedicated test DB is mutated: incompatible queued versions must not match.
for (const [challengeVersion, scoringVersion] of [
  [lobby.challenge.version + 1, 1],
  [lobby.challenge.version, 99],
]) {
  await pool.query(
    'INSERT INTO competition_queue (id,"userId",league,"challengeId","challengeVersion","scoringVersion","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW())',
    [
      crypto.randomUUID(),
      meA.user.id,
      lobby.challenge.league,
      lobby.challenge.id,
      challengeVersion,
      scoringVersion,
    ],
  );
  check(
    "incompatible challenge/scoring version cannot match",
    (await b.call("/api/v1/competition/matchmake", "POST", {})).value.status ===
      "WAITING" &&
      (await pool.query("SELECT count(*)::int n FROM competition_match"))
        .rows[0].n === 0,
  );
  await pool.query(
    "UPDATE competition_queue SET status='CANCELLED' WHERE status='WAITING'",
  );
}
const joins = await Promise.all([
  a.call("/api/v1/competition/matchmake", "POST", {}),
  a.call("/api/v1/competition/matchmake", "POST", {}),
  b.call("/api/v1/competition/matchmake", "POST", {}),
  b.call("/api/v1/competition/matchmake", "POST", {}),
]);
check(
  "all concurrent joins succeed",
  joins.every((x) => x.status === 200),
);
const matches = (await pool.query("SELECT id FROM competition_match")).rows;
check("exactly one match", matches.length === 1);
const id = matches[0].id,
  match = (await a.call("/api/v1/competition/matches/" + id)).value;
check(
  "cannot match self",
  match.players.length === 2 &&
    match.players[0].userId !== match.players[1].userId,
);
check(
  "same match for both accounts",
  (await b.call("/api/v1/competition/matches/" + id)).value.id === id,
);
check(
  "match never exposes private emails",
  !JSON.stringify(match).includes("@phase1.test"),
);
check(
  "forged winner/score rejected",
  (
    await a.call("/api/v1/competition/matches/" + id + "/submit", "POST", {
      kind: "submit",
      action: "post",
      debit: "cash",
      credit: "bank",
      amount: 0,
      winner: meA.user.id,
      score: 100,
    })
  ).status === 400,
);
for (const c of [a, b])
  for (const doc of match.challenge.documents)
    check(
      "server records inspection",
      (
        await c.call("/api/v1/competition/matches/" + id + "/submit", "POST", {
          kind: "inspect",
          documentId: doc.id,
        })
      ).status === 200,
    );
const answer = {
  kind: "submit",
  action: "hold",
  debit: "cash",
  credit: "bank",
  amount: 0,
};
const sealed = (
  await a.call("/api/v1/competition/matches/" + id + "/submit", "POST", answer)
).value;
check(
  "scores sealed before opponent finishes",
  sealed.players.every((p) => p.score === null),
);
check(
  "leaderboard cannot leak sealed score",
  (await b.call("/api/v1/competition/leaderboard")).value.rows.length === 0,
);
const result =
  // Leaderboard must not disclose a sealed score through another endpoint.
  (
    await b.call(
      "/api/v1/competition/matches/" + id + "/submit",
      "POST",
      answer,
    )
  ).value;
check(
  "completed server match supports tie",
  result.status === "COMPLETED" &&
    result.winnerUserId === null &&
    result.players.every((p) => typeof p.score === "number"),
);
await a.call("/api/v1/competition/matches/" + id + "/submit", "POST", answer);
check(
  "official attempt uniqueness",
  (await pool.query("SELECT count(*)::int n FROM competition_attempt")).rows[0]
    .n === 2,
);
check(
  "official replay becomes practice only",
  (await a.call("/api/v1/competition/matchmake", "POST", {})).value.status ===
    "PRACTICE_ONLY",
);
const leaderboard = (await b.call("/api/v1/competition/leaderboard")).value;
check("real two-user leaderboard", leaderboard.rows.length === 2);
check(
  "leaderboard privacy",
  !JSON.stringify(leaderboard).includes("@phase1.test"),
);
check(
  "heartbeat",
  (await b.call("/api/v1/me/activity", "POST", {})).status === 200,
);
const account = (
  await pool.query('SELECT password FROM auth_account WHERE "userId"=$1', [
    meA.user.id,
  ])
).rows[0];
check("password is hashed", account.password && account.password !== password);
await assert.rejects(
  pool.query(
    'INSERT INTO auth_account (id,"accountId","providerId","userId","updatedAt") SELECT $1,"accountId","providerId","userId",NOW() FROM auth_account WHERE "userId"=$2 LIMIT 1',
    [crypto.randomUUID(), meA.user.id],
  ),
  (e) => e.code === "23505",
);
check("database auth identity uniqueness", true);
await assert.rejects(
  pool.query('UPDATE player_profile SET "userId"=$1 WHERE "userId"=$2', [
    crypto.randomUUID(),
    meA.user.id,
  ]),
  (e) => e.code === "23503",
);
check("database rejects orphan profile ownership", true);
// Roll back this delete so the two fixture accounts remain usable for further inspection.
const tx = await pool.connect();
try {
  await tx.query("BEGIN");
  await tx.query('UPDATE competition_match SET "winnerUserId"=$1 WHERE id=$2', [
    meA.user.id,
    id,
  ]);
  await tx.query("DELETE FROM app_user WHERE id=$1", [meA.user.id]);
  for (const table of [
    "auth_account",
    "auth_session",
    "player_profile",
    "cloud_progress",
    "case_attempt",
    "accepted_outcome",
    "competition_attempt",
  ])
    check(
      "user deletion cascades " + table,
      (
        await tx.query(
          `SELECT count(*)::int n FROM ${table} WHERE "userId"=$1`,
          [meA.user.id],
        )
      ).rows[0].n === 0,
    );
  check(
    "match winner becomes null on user deletion",
    (
      await tx.query(
        'SELECT "winnerUserId" FROM competition_match WHERE id=$1',
        [id],
      )
    ).rows[0].winnerUserId === null,
  );
  check(
    "case events cascade with their attempt",
    (await tx.query("SELECT count(*)::int n FROM case_event")).rows[0].n === 0,
  );
} finally {
  await tx.query("ROLLBACK");
  tx.release();
}
await pool.end();
console.log(
  "API QA checks:",
  passed,
  "— local PostgreSQL only; Google/Resend not tested.",
);
