import assert from "node:assert/strict";
import pg from "pg";
import { spawn } from "node:child_process";
const localURL =
  "postgresql://postgres:local-test-only@127.0.0.1:55432/app_phase1_test";
const target = new URL(localURL);
assert.equal(target.hostname, "127.0.0.1");
assert.equal(target.pathname, "/app_phase1_test");
const databaseName = "app_phase1_schema_" + Date.now();
assert.match(databaseName, /^app_phase1_schema_\d+$/);
const admin = new pg.Pool({ connectionString: localURL });
await admin.query(`CREATE DATABASE "${databaseName}"`);
await admin.end();
target.pathname = "/" + databaseName;
const env = {
  ...process.env,
  DATABASE_URL: target.href,
  DIRECT_URL: target.href,
};
const migration = spawn(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { env, windowsHide: true, stdio: "inherit" },
);
await new Promise((resolve, reject) =>
  migration.once("exit", (code) =>
    code === 0 ? resolve() : reject(new Error("SCHEMA_MIGRATION_FAILED")),
  ),
);
const pool = new pg.Pool({ connectionString: target.href });
try {
  assert.equal(
    (
      await pool.query(
        "SELECT count(*)::int n FROM _prisma_migrations WHERE finished_at IS NOT NULL",
      )
    ).rows[0].n,
    3,
  );
  assert.equal(
    (await pool.query("SELECT count(*)::int n FROM app_user")).rows[0].n,
    0,
  );
  const fks = (
    await pool.query(
      "SELECT count(*)::int n FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_schema='public'",
    )
  ).rows[0].n;
  assert.ok(fks >= 25);
  const indexes = (
    await pool.query(
      "SELECT indexdef FROM pg_indexes WHERE schemaname='public'",
    )
  ).rows.map((x) => x.indexdef);
  assert.ok(
    indexes.some(
      (x) =>
        x.includes("competition_queue") &&
        x.includes("UNIQUE") &&
        x.includes("WHERE"),
    ),
  );
  assert.ok(
    indexes.some(
      (x) =>
        x.includes("competition_attempt") &&
        x.includes("UNIQUE") &&
        x.includes("scoringVersion"),
    ),
  );
  assert.ok(
    indexes.some(
      (x) =>
        x.includes("case_attempt") &&
        x.includes("UNIQUE") &&
        x.includes("commandId"),
    ),
  );
  console.log(
    "PASS fresh empty PostgreSQL database reconstructed from all three migrations, foreign keys and idempotency indexes verified; no seed users.",
  );
} finally {
  await pool.end();
}
