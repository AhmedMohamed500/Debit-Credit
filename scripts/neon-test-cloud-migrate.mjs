// Only applies the repository's existing migrations to the isolated Neon test DB.
// Never resets, seeds, creates users, deploys the app, or changes production env.
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { readFile, readdir, appendFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { config } from "dotenv";
import {
  assertNeonTestTarget,
  redactNeonTestOutput,
} from "./neon-test-safety.ts";

config({ path: ".env.local", quiet: true });
const target = assertNeonTestTarget(process.env);
const verifyOnly = process.argv.includes("--verify-only");
if (verifyOnly) {
  console.log(JSON.stringify(target));
} else {
  assert.equal(process.env.GITHUB_ACTIONS, "true", "CLOUD_RUNNER_REQUIRED");
  process.env.BETTER_AUTH_SECRET = randomBytes(48).toString("base64");
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.ADMIN_EMAILS;
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  const migrations = (
    await readdir("prisma/migrations", { withFileTypes: true })
  )
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.equal(migrations.length, 3, "EXPECTED_THREE_EXISTING_MIGRATIONS");
  const checksums = new Map(
    await Promise.all(
      migrations.map(async (name) => [
        name,
        createHash("sha256")
          .update(await readFile(`prisma/migrations/${name}/migration.sql`))
          .digest("hex"),
      ]),
    ),
  );
  const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
  for (const name of ["prisma", "@prisma/client", "@prisma/adapter-neon"])
    assert.equal(
      lock.packages[`node_modules/${name}`].version,
      "7.10.0",
      "PRISMA_VERSION_REQUIRED",
    );
  let database;
  try {
    const { db } = await import("../lib/server/db/client.ts");
    database = db();
    const before = await database.$transaction(
      async (tx) => {
        await tx.$executeRaw`SET TRANSACTION READ ONLY`;
        return (
          await tx.$queryRaw`
        SELECT 1::int AS connection_ok,
          (SELECT count(*)::int FROM information_schema.tables
           WHERE table_schema='public' AND table_type='BASE TABLE') AS tables,
          EXISTS(SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='_prisma_migrations') AS history_exists
      `
        )[0];
      },
      { timeout: 30000, maxWait: 15000 },
    );
    assert.ok(
      before.tables === 0 || before.history_exists,
      "UNRECOGNIZED_EXISTING_SCHEMA",
    );
    console.log(
      JSON.stringify({ phase: "read-only-before", ...target, ...before }),
    );
    const apply = () => {
      const child = spawnSync(
        process.execPath,
        ["node_modules/prisma/build/index.js", "migrate", "deploy"],
        {
          env: process.env,
          encoding: "utf8",
          timeout: 180000,
          maxBuffer: 5 * 1024 * 1024,
        },
      );
      console.log(
        redactNeonTestOutput(
          String(child.stdout ?? "") + String(child.stderr ?? ""),
          process.env,
        ),
      );
      assert.equal(child.status, 0, "MIGRATION_DEPLOY_FAILED");
    };
    apply();
    const verify = () =>
      database.$transaction(
        async (tx) => {
          await tx.$executeRaw`SET TRANSACTION READ ONLY`;
          const history = await tx.$queryRaw`
        SELECT migration_name, checksum, finished_at IS NOT NULL AS finished,
          rolled_back_at IS NOT NULL AS rolled_back
        FROM "_prisma_migrations" ORDER BY migration_name
      `;
          assert.equal(
            history.length,
            migrations.length,
            "MIGRATION_COUNT_MISMATCH",
          );
          for (const item of history) {
            assert.ok(
              item.finished && !item.rolled_back,
              "MIGRATION_INCOMPLETE",
            );
            assert.equal(
              item.checksum,
              checksums.get(item.migration_name),
              "MIGRATION_CHECKSUM_MISMATCH",
            );
          }
          const schema = (
            await tx.$queryRaw`
        SELECT (SELECT count(*)::int FROM information_schema.tables
          WHERE table_schema='public' AND table_type='BASE TABLE') AS tables,
          (SELECT count(*)::int FROM information_schema.table_constraints
          WHERE table_schema='public' AND constraint_type='FOREIGN KEY') AS foreign_keys,
          (SELECT count(*)::int FROM pg_indexes WHERE schemaname='public') AS indexes,
          current_setting('transaction_read_only') AS read_only
      `
          )[0];
          return {
            appliedMigrations: history.map((item) => item.migration_name),
            ...schema,
            users: await tx.user.count(),
            profiles: await tx.playerProfile.count(),
          };
        },
        { timeout: 30000, maxWait: 15000 },
      );
    const result = await verify();
    assert.ok(
      result.tables > 3 && result.foreign_keys > 0 && result.indexes > 0,
    );
    apply(); // Official idempotency proof: no reset, no second schema creation.
    const repeated = await verify();
    assert.deepEqual(repeated, result, "IDEMPOTENCY_VERIFICATION_FAILED");
    const report = {
      phase: "completed",
      prisma: "7.10.0",
      ...target,
      ...result,
      idempotentDeployVerified: true,
      productionChanged: false,
      usersCreated: false,
    };
    console.log(JSON.stringify(report));
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        "## Isolated Neon test migrations\n\n```json\n" +
          JSON.stringify(report, null, 2) +
          "\n```\n",
      );
  } catch (error) {
    console.error(
      redactNeonTestOutput(
        error instanceof Error ? error.message : "NEON_TEST_MIGRATION_FAILED",
        process.env,
      ),
    );
    process.exitCode = 1;
  } finally {
    if (database) await database.$disconnect();
  }
}
