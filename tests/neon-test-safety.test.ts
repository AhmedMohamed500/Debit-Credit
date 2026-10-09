import { describe, expect, it } from "vitest";
import {
  assertNeonTestTarget,
  redactNeonTestOutput,
} from "../scripts/neon-test-safety";
const host = "ep-green-mountain-b8xoa2yn.c-14.us-east-1.aws.neon.tech";
const fixture = () => ({
  DATABASE_DRIVER: "neon",
  DIRECT_URL: `postgresql://neondb_owner:fixture-password@${host}/neondb?sslmode=require`,
  DATABASE_URL: `postgresql://neondb_owner:fixture-password@${host.replace(".c-14", "-pooler.c-14")}/neondb?sslmode=require`,
});
describe("isolated Neon migration safety", () => {
  it("accepts only the configured test database pair", () => {
    expect(assertNeonTestTarget(fixture()).isolatedTargetVerified).toBe(true);
  });
  it.each([
    ["DATABASE_DRIVER", "postgres"],
    ["DIRECT_URL", ""],
    ["DIRECT_URL", "not-a-url"],
    [
      "DIRECT_URL",
      "postgresql://owner:fixture@db.prisma.io/prod?sslmode=require",
    ],
    [
      "DIRECT_URL",
      `postgresql://neondb_owner:fixture-password@${host}/other?sslmode=require`,
    ],
    [
      "DIRECT_URL",
      `postgresql://neondb_owner:fixture-password@${host}/neondb?sslmode=disable`,
    ],
    [
      "DIRECT_URL",
      `postgresql://neondb_owner:fixture-password@${host}/neondb?sslmode=require&schema=other`,
    ],
    [
      "DIRECT_URL",
      `postgresql://neondb_owner:other-password@${host}/neondb?sslmode=require`,
    ],
    [
      "DIRECT_URL",
      `postgresql://neondb_owner:****@${host}/neondb?sslmode=require`,
    ],
  ])("rejects unsafe %s configuration", (key, value) => {
    expect(() =>
      assertNeonTestTarget({ ...fixture(), [key]: value }),
    ).toThrow();
  });
  it("rejects a different repository or branch in Actions", () => {
    for (const values of [
      {
        GITHUB_REPOSITORY: "other/repo",
        GITHUB_REF: "refs/heads/codex/neon-test-migrations",
      },
      {
        GITHUB_REPOSITORY: "AhmedMohamed500/Debit-Credit",
        GITHUB_REF: "refs/heads/main",
      },
    ])
      expect(() =>
        assertNeonTestTarget({
          ...fixture(),
          ...values,
          GITHUB_ACTIONS: "true",
        }),
      ).toThrow();
  });
  it("redacts URLs, passwords, and the ephemeral auth secret", () => {
    const env = { ...fixture(), BETTER_AUTH_SECRET: "fixture-auth-secret" };
    const output = redactNeonTestOutput(
      `${env.DIRECT_URL} fixture-password fixture-auth-secret`,
      env,
    );
    expect(output).not.toContain("fixture-password");
    expect(output).not.toContain("fixture-auth-secret");
    expect(output).not.toContain("postgresql://");
  });
});
