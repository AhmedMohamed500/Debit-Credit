import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const blueprint = parse(readFileSync("render.yaml", "utf8"));
const service = blueprint.services[0];
const variables = new Map(
  service.envVars.map((variable: { key: string }) => [variable.key, variable]),
);

describe("secondary Render deployment safety", () => {
  it("uses one free Node web service, not a static export", () => {
    expect(blueprint.services).toHaveLength(1);
    expect(service).toMatchObject({
      type: "web",
      runtime: "node",
      plan: "free",
    });
    expect(service).not.toHaveProperty("staticPublishPath");
  });

  it("does not provision or reset any database", () => {
    expect(blueprint).not.toHaveProperty("databases");
    expect(service).not.toHaveProperty("preDeployCommand");
    expect(service).not.toHaveProperty("initialDeployHook");
    expect(service.buildCommand).not.toMatch(/migrate|reset|seed|db:push/);
    expect(variables.get("DATABASE_URL")).toEqual({
      key: "DATABASE_URL",
      sync: false,
    });
    expect(variables.get("DATABASE_DRIVER")).toMatchObject({
      value: "postgres",
    });
  });

  it("uses the real Render origin for auth, not the unreachable Vercel origin", () => {
    expect(variables.get("BETTER_AUTH_URL")).toEqual({
      key: "BETTER_AUTH_URL",
      fromService: {
        type: "web",
        name: service.name,
        envVarKey: "RENDER_EXTERNAL_URL",
      },
    });
    expect(variables.get("BETTER_AUTH_SECRET")).toEqual({
      key: "BETTER_AUTH_SECRET",
      generateValue: true,
    });
    expect(variables.has("GOOGLE_CLIENT_ID")).toBe(false);
    expect(variables.has("GOOGLE_CLIENT_SECRET")).toBe(false);
  });

  it("requires configured auth before health checks can pass", () => {
    expect(service.healthCheckPath).toBe("/api/auth/get-session");
    expect(service.startCommand).toBe("npm start -- --hostname 0.0.0.0");
    expect(service.buildCommand).toContain("--include=dev");
  });

  it("keeps Vercel main intact and avoids recurring/free-tier build spend", () => {
    expect(service.branch).toBe("codex/render-fallback");
    expect(service.autoDeployTrigger).toBe("off");
    expect(
      blueprint.services.every(
        (entry: { type: string }) => entry.type !== "cron",
      ),
    ).toBe(true);
  });

  it("does not create a Vercel preview for the fallback-only branch", () => {
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
    expect(vercel.git.deploymentEnabled["codex/render-fallback"]).toBe(false);
    expect(vercel.git.deploymentEnabled.main).toBeUndefined();
  });
});
