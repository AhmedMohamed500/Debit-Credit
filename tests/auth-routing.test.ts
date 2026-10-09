import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../next.config";
import { safeNext } from "@/lib/auth/safe-next";

const fixture = vi.hoisted(() => ({ configured: true, handler: vi.fn() }));
vi.mock("@/lib/server/auth/auth", () => ({
  auth: () => ({ handler: fixture.handler }),
}));
vi.mock("@/lib/server/security/env", () => ({
  backendConfigured: () => fixture.configured,
  emailConfigured: () => false,
}));
vi.mock("@/lib/server/security/http", () => ({
  respond: (value: unknown, status = 200) => Response.json(value, { status }),
  endpoint: async (work: () => Promise<unknown>) => Response.json(await work()),
  body: vi.fn(),
}));
import { GET } from "../app/api/auth/[...all]/route";

afterEach(() => {
  fixture.configured = true;
  vi.clearAllMocks();
});
describe("auth route deployment contract", () => {
  it.each(["/ar/login", "/ar/signup", "/en/login", "/en/signup"])(
    "%s maps to a physical App Router page",
    (route) => {
      const page = route.split("/")[2];
      expect(existsSync(path.resolve(`app/[locale]/${page}/page.tsx`))).toBe(
        true,
      );
    },
  );
  it("mounts the auth catch-all outside the locale segment", () => {
    expect(existsSync(path.resolve("app/api/auth/[...all]/route.ts"))).toBe(
      true,
    );
    expect(
      existsSync(path.resolve("app/[locale]/api/auth/[...all]/route.ts")),
    ).toBe(false);
  });
  it("does not introduce locale middleware/proxy or config rewrites for APIs/assets", () => {
    // This application uses a validated [locale] layout, not locale middleware.
    // If middleware is deliberately added later, replace this assertion with
    // explicit matcher tests; the HTTP smoke test must keep passing as well.
    for (const name of ["middleware", "proxy"])
      for (const extension of ["ts", "js"])
        for (const root of ["", "src/"])
          expect(existsSync(path.resolve(`${root}${name}.${extension}`))).toBe(
            false,
          );
    expect(nextConfig).not.toHaveProperty("rewrites");
    expect(nextConfig).not.toHaveProperty("redirects");
  });
  it.each(["ar", "en"])(
    "resolves actual %s destinations rather than a literal locale",
    (locale) => {
      expect(safeNext(`/[locale]/onboarding`, locale)).toBe(`/${locale}`);
      expect(existsSync(path.resolve("app/[locale]/onboarding/page.tsx"))).toBe(
        true,
      );
      expect(existsSync(path.resolve("app/[locale]/account/page.tsx"))).toBe(
        true,
      );
    },
  );
  it.each(["ar", "en"])(
    "accepts the real %s homepage after login",
    (locale) => {
      expect(safeNext(`/${locale}`, locale)).toBe(`/${locale}`);
      expect(safeNext(undefined, locale)).toBe(`/${locale}`);
      expect(existsSync(path.resolve("app/[locale]/page.tsx"))).toBe(true);
    },
  );
  it("creates no automatic email session after signup", () => {
    expect(
      readFileSync(path.resolve("lib/server/auth/auth.ts"), "utf8"),
    ).toContain("autoSignIn: false");
  });
  it("uses social sign-in, never direct callback navigation, for the Google button", () => {
    const source = readFileSync(
      path.resolve("components/cloud/auth-form.tsx"),
      "utf8",
    );
    expect(source).toContain("authClient.signIn.social");
    expect(source).toContain("callbackURL: destination");
    expect(source).not.toContain("/api/auth/callback/google");
  });
  it.each(["/api/auth/get-session", "/api/auth/callback/google"])(
    "delegates %s unchanged to the installed auth handler",
    async (pathname) => {
      fixture.handler.mockResolvedValueOnce(Response.json({ handled: true }));
      const request = new Request(
        "https://debit-credit-nine.vercel.app" + pathname,
      );
      const result = await GET(request);
      expect(result.status).toBe(200);
      expect(fixture.handler).toHaveBeenCalledWith(request);
      expect(new URL(fixture.handler.mock.calls[0][0].url).pathname).toBe(
        pathname,
      );
    },
  );
  it("returns a JSON unavailable response instead of a missing page without credentials", async () => {
    fixture.configured = false;
    const response = await GET(
      new Request(
        "https://debit-credit-nine.vercel.app/api/auth/callback/google",
      ),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: { code: "BACKEND_NOT_CONFIGURED" },
    });
    expect(fixture.handler).not.toHaveBeenCalled();
  });
});
