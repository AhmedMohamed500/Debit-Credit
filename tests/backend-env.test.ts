import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  backendConfigured,
  configuration,
  emailConfigured,
  googleConfigured,
} from "@/lib/server/security/env";

describe("independent backend and optional provider configuration", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
    vi.stubEnv(
      "BETTER_AUTH_SECRET",
      "test-only-secret-not-for-production-123456",
    );
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"])(
    "incomplete %s setup must not disable email/password or database access",
    (key) => {
      vi.stubEnv(key, "test-only-provider-value");
      expect(backendConfigured()).toBe(true);
      expect(googleConfigured()).toBe(false);
      expect(() => configuration()).not.toThrow();
    },
  );

  it("email delivery remains optional for basic authentication", () => {
    expect(backendConfigured()).toBe(true);
    expect(emailConfigured()).toBe(false);
    expect(() => configuration()).not.toThrow();
  });

  it("Google is unavailable with no credentials", () => {
    expect(googleConfigured()).toBe(false);
  });

  it("Google requires both credentials without requiring email delivery", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "test-only-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "test-only-client-secret");
    expect(googleConfigured()).toBe(true);
    expect(emailConfigured()).toBe(false);
    expect(() => configuration()).not.toThrow();
  });

  it.each(["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"])(
    "still requires %s",
    (key) => {
      vi.stubEnv(key, "");
      expect(backendConfigured()).toBe(false);
      expect(() => configuration()).toThrow("BACKEND_NOT_CONFIGURED");
    },
  );

  it("still rejects a short authentication secret", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "short");
    expect(backendConfigured()).toBe(false);
    expect(() => configuration()).toThrow("BACKEND_NOT_CONFIGURED");
  });

  it("normalizes the auth base URL to the application origin", () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://example.test/ar/signup");
    expect(configuration().baseURL).toBe("https://example.test");
  });

  it("still requires HTTPS on production origins", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_URL", "http://example.test");
    expect(() => configuration()).toThrow("HTTPS_REQUIRED");
  });

  it("permits the local production-build test server", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(configuration().baseURL).toBe("http://localhost:3000");
  });
});
