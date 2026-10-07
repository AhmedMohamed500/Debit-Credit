import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function auditAuthRoutes(base) {
  const origin = new URL(base).origin;
  const results = [];
  for (const pathname of [
    "/ar/login",
    "/ar/signup",
    "/en/login",
    "/en/signup",
  ]) {
    const response = await fetch(origin + pathname, { redirect: "manual" });
    assert.equal(response.status, 200, `${pathname} must be a real page`);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    results.push({ pathname, status: response.status });
  }
  for (const pathname of [
    "/api/auth/get-session",
    "/api/auth/callback/google",
  ]) {
    const response = await fetch(origin + pathname, { redirect: "manual" });
    const location = response.headers.get("location");
    const text = await response.text();
    assert.ok(
      !(
        response.status === 404 && text.includes("This page could not be found")
      ),
      `${pathname} reached Next's missing-page fallback`,
    );
    if (location)
      assert.doesNotMatch(
        new URL(location, origin).pathname,
        /^\/(ar|en)\/api\//,
        "Auth API must never be locale rewritten",
      );
    if (pathname.endsWith("get-session")) {
      assert.ok(
        [200, 503].includes(response.status),
        "Session API must be mounted even when configuration is unavailable",
      );
      assert.match(
        response.headers.get("content-type") ?? "",
        /application\/json/,
      );
    }
    // A direct callback has no OAuth state/code. Auth errors, including a clear
    // unconfigured-service 503, are not successful Google login or a route 404.
    assert.ok(
      response.status < 500 || response.status === 503,
      "Unexpected auth handler failure",
    );
    results.push({
      pathname,
      status: response.status,
      location,
      handlerResponse: response.headers.get("content-type"),
    });
  }
  for (const pathname of [
    "/sitemap.xml",
    "/manifest.webmanifest",
    "/docs/nature-of-accounts.md",
  ]) {
    const response = await fetch(origin + pathname, { redirect: "manual" });
    assert.equal(
      response.status,
      200,
      `${pathname} must not receive locale rewriting`,
    );
    assert.equal(response.headers.get("location"), null);
    results.push({ pathname, status: response.status });
  }
  return results;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const base = process.argv[2] ?? "http://localhost:3111";
  const results = await auditAuthRoutes(base);
  console.log(
    JSON.stringify(
      { base: new URL(base).origin, checks: results.length, results },
      null,
      2,
    ),
  );
}
