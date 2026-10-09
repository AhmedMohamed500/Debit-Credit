// Read-only audit; never signs up users, bootstraps profiles, or runs migrations.
// Use db:preflight so the application's server-only TypeScript client is loaded.
import { readFile, readdir } from "node:fs/promises";
import { config as loadEnvironment } from "dotenv";

loadEnvironment({ path: ".env.local", quiet: true });
loadEnvironment({ path: ".env", quiet: true });

let database;
try {
  const { configuration, googleConfigured, emailConfigured } =
    await import("../lib/server/security/env.ts");
  const settings = configuration();
  const target = new URL(settings.databaseURL);
  if (!["postgresql:", "postgres:"].includes(target.protocol))
    throw new Error("POSTGRESQL_URL_REQUIRED");
  if (
    process.env.DATABASE_DRIVER &&
    !["postgres", "neon"].includes(process.env.DATABASE_DRIVER)
  )
    throw new Error("UNKNOWN_DATABASE_DRIVER");

  const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
  const versions = Object.fromEntries(
    [
      "prisma",
      "@prisma/client",
      "@prisma/adapter-pg",
      "@prisma/adapter-neon",
      "better-auth",
      "next",
    ].map((name) => [name, lock.packages[`node_modules/${name}`].version]),
  );
  if (
    ["@prisma/client", "@prisma/adapter-pg", "@prisma/adapter-neon"].some(
      (name) => versions[name] !== versions.prisma,
    )
  )
    throw new Error("PRISMA_VERSION_MISMATCH");
  const localMigrations = (
    await readdir("prisma/migrations", { withFileTypes: true })
  )
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const { db } = await import("../lib/server/db/client.ts");
  database = db();
  const result = await database.$transaction(
    async (tx) => {
      // Enforce safety in PostgreSQL itself, not just in this script's comments.
      await tx.$executeRaw`SET TRANSACTION READ ONLY`;
      const migrations = await tx.$queryRaw`
      SELECT migration_name, finished_at IS NOT NULL AS finished,
             rolled_back_at IS NOT NULL AS rolled_back
      FROM "_prisma_migrations" ORDER BY started_at
    `;
      const completed = new Set(
        migrations
          .filter((item) => item.finished && !item.rolled_back)
          .map((item) => item.migration_name),
      );
      const pending = localMigrations.filter((name) => !completed.has(name));
      const failed = migrations
        .filter((item) => !item.finished && !item.rolled_back)
        .map((item) => item.migration_name);
      const schema = await tx.$queryRaw`
      SELECT
        (SELECT count(*)::int FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tables,
        (SELECT count(*)::int FROM information_schema.table_constraints
         WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY') AS foreign_keys,
        (SELECT count(*)::int FROM pg_indexes WHERE schemaname = 'public') AS indexes,
        EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
          AND tablename = 'competition_queue'
          AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%') AS unique_waiting_queue,
        EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
          AND tablename = 'competition_attempt'
          AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%scoringVersion%') AS unique_official_attempt,
        EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public'
          AND tablename = 'case_attempt'
          AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%commandId%') AS unique_case_command
    `;
      return {
        migrations: { completed: [...completed].sort(), pending, failed },
        schema: schema[0],
        counts: {
          users: await tx.user.count(),
          profiles: await tx.playerProfile.count(),
          usersWithoutProfile: await tx.user.count({
            where: { profile: { is: null } },
          }),
          admins: await tx.user.count({ where: { role: "ADMIN" } }),
          namedAcceptanceUsers: await tx.user.count({
            where: { name: { in: ["Ahmed", "Mohamed"] } },
          }),
          activationFixtureUsers: await tx.user.count({
            where: { name: "Auth Activation QA" },
          }),
          credentialAccounts: await tx.account.count({
            where: { providerId: "credential" },
          }),
          googleAccounts: await tx.account.count({
            where: { providerId: "google" },
          }),
          matches: await tx.competitionMatch.count(),
        },
      };
    },
    { maxWait: 10000, timeout: 30000 },
  );

  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        readOnly: true,
        client: "application db() / Prisma ORM",
        versions,
        driver: process.env.DATABASE_DRIVER || "neon",
        configured: {
          backend: true,
          google: googleConfigured(),
          emailDelivery: emailConfigured(),
          adminAllowlist: Boolean(process.env.ADMIN_EMAILS?.trim()),
          directMigrationURL: Boolean(process.env.DIRECT_URL),
        },
        ...result,
      },
      null,
      2,
    ),
  );
  if (result.migrations.pending.length || result.migrations.failed.length)
    process.exitCode = 1;
} catch (error) {
  // Do not log driver messages, connection strings, credentials, or stack traces.
  const safeCodes = new Set([
    "BACKEND_NOT_CONFIGURED",
    "HTTPS_REQUIRED",
    "POSTGRESQL_URL_REQUIRED",
    "UNKNOWN_DATABASE_DRIVER",
    "PRISMA_VERSION_MISMATCH",
  ]);
  const code = safeCodes.has(error?.message)
    ? error.message
    : "READ_ONLY_PREFLIGHT_FAILED";
  console.error(JSON.stringify({ readOnly: true, error: code }));
  process.exitCode = 1;
} finally {
  if (database) await database.$disconnect().catch(() => {});
}
