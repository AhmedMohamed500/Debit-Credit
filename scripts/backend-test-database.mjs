import EmbeddedPostgres from "embedded-postgres";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
const directory = path.resolve("artifacts/backend-phase-1/database");
const database = new EmbeddedPostgres({
  databaseDir: directory,
  user: "postgres",
  password: "local-test-only",
  port: 55432,
  persistent: true,
  createPostgresUser: false,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (e) => console.error(String(e)),
});
if (!existsSync(path.join(directory, "PG_VERSION")))
  await database.initialise();
await database.start();
const client = database.getPgClient();
await client.connect();
if (
  !(
    await client.query(
      "SELECT 1 FROM pg_database WHERE datname='app_phase1_test'",
    )
  ).rowCount
)
  await database.createDatabase("app_phase1_test");
await client.end();
const env = {
  ...process.env,
  APP_BUILD_DIR: ".next-backend-test",
  DATABASE_URL:
    "postgresql://postgres:local-test-only@127.0.0.1:55432/app_phase1_test",
  DIRECT_URL:
    "postgresql://postgres:local-test-only@127.0.0.1:55432/app_phase1_test",
  DATABASE_DRIVER: "postgres",
  BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
  BETTER_AUTH_URL: "http://localhost:3110",
  ADMIN_EMAILS: "qa-a@phase1.test",
};
const migration = spawn(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { env, stdio: "inherit", windowsHide: true },
);
await new Promise((resolve, reject) => {
  migration.on("exit", (code) =>
    code === 0 ? resolve() : reject(new Error("MIGRATION_FAILED")),
  );
});
const app = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "-H", "127.0.0.1", "-p", "3110"],
  { env, stdio: "inherit", windowsHide: true },
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (process.platform === "win32" && app.exitCode === null) {
    // Only the exact child launched above and its descendants, never all Node processes.
    const kill = spawn("taskkill", ["/PID", String(app.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
    await new Promise((resolve) => kill.once("exit", resolve));
  } else app.kill();
  await database.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
app.once("exit", () => void stop());
console.log(
  "Local PostgreSQL and application: http://localhost:3110 — no external services, no credentials printed.",
);
