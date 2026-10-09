// This deliberately cannot target production or another Neon project.
export const neonTestBranch = "refs/heads/codex/neon-test-migrations";
export const neonTestRepository = "AhmedMohamed500/Debit-Credit";
const directHost = "ep-green-mountain-b8xoa2yn.c-14.us-east-1.aws.neon.tech";
const pooledHost = directHost.replace(".c-14", "-pooler.c-14");

export function assertNeonTestTarget(env: Record<string, string | undefined>) {
  if (env.DATABASE_DRIVER !== "neon")
    throw new Error("NEON_TEST_DRIVER_REQUIRED");
  const targets = [env.DIRECT_URL, env.DATABASE_URL].map((value, index) => {
    if (!value) throw new Error("NEON_TEST_URL_REQUIRED");
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error("NEON_TEST_URL_INVALID");
    }
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      url.hostname !== (index === 0 ? directHost : pooledHost) ||
      url.pathname !== "/neondb" ||
      (url.port && url.port !== "5432") ||
      url.username !== "neondb_owner" ||
      !url.password ||
      url.password.includes("*") ||
      url.hash ||
      !["require", "verify-full"].includes(
        url.searchParams.get("sslmode") ?? "",
      ) ||
      (url.searchParams.has("schema") &&
        url.searchParams.get("schema") !== "public")
    )
      throw new Error("ISOLATED_NEON_TEST_TARGET_REQUIRED");
    return url;
  });
  if (targets[0].password !== targets[1].password)
    throw new Error("NEON_TEST_CREDENTIALS_MISMATCH");
  if (
    env.GITHUB_ACTIONS === "true" &&
    (env.GITHUB_REPOSITORY !== neonTestRepository ||
      env.GITHUB_REF !== neonTestBranch)
  )
    throw new Error("NEON_TEST_WORKFLOW_SCOPE_REQUIRED");
  return { database: "neondb", driver: "neon", isolatedTargetVerified: true };
}

export function redactNeonTestOutput(
  text: string,
  env: Record<string, string | undefined>,
) {
  let safe = text;
  for (const value of [
    env.DIRECT_URL,
    env.DATABASE_URL,
    env.BETTER_AUTH_SECRET,
  ]) {
    if (!value) continue;
    safe = safe.replaceAll(value, "[PRIVATE]");
    try {
      const password = new URL(value).password;
      if (password) {
        safe = safe.replaceAll(password, "[PRIVATE]");
        safe = safe.replaceAll(decodeURIComponent(password), "[PRIVATE]");
      }
    } catch {
      /* Auth secrets are not URLs. */
    }
  }
  return safe.replace(
    /postgres(?:ql)?:\/\/[^\s"']+/g,
    "[PRIVATE_DATABASE_URL]",
  );
}
