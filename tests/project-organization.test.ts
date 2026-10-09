import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { publicRoutes } from "@/lib/platform/public-routes";

const read = (file: string) => readFileSync(file, "utf8");
describe("project organization safeguards", () => {
  it.each(publicRoutes)(
    "canonical route %s is a real public page, not a redirect",
    (route) => {
      const file = path.join("app", "[locale]", route, "page.tsx");
      expect(existsSync(file)).toBe(true);
      expect(read(file)).not.toMatch(/\bredirect\s*\(/);
      expect(read(file)).not.toMatch(/index\s*:\s*false/);
    },
  );

  it("sitemap contains unique resolved public URLs in both languages", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(new Set(publicRoutes).size).toBe(publicRoutes.length);
    expect(new Set(urls).size).toBe(publicRoutes.length * 2);
    expect(urls).toEqual(
      ["ar", "en"].flatMap((locale) =>
        publicRoutes.map(
          (route) => `https://debit-credit-nine.vercel.app/${locale}${route}`,
        ),
      ),
    );
    for (const url of urls) {
      expect(url).not.toMatch(/\[locale\]|undefined|\/ar\/ar\/|\/en\/en\//);
      expect(url).not.toMatch(
        /\/(login|signup|account|admin|competition|career-profile|profile|leaderboard)(?:\/|$)/,
      );
    }
  });

  it("retains exact historical UI and stylesheet content", () => {
    const manifest = JSON.parse(read("archive/manifest.json"));
    expect(manifest.files).toHaveLength(5);
    for (const entry of manifest.files) {
      const digest = createHash("sha256")
        .update(read(entry.archive).replace(/\r\n/g, "\n"))
        .digest("hex");
      expect(digest, entry.original).toBe(entry.sha256);
    }
  });

  it("loads only consolidated landing styles and retains current v4 rules", () => {
    const active = read("app/landing.css");
    expect(read("app/layout.tsx")).toContain('import "./landing.css"');
    expect(read("app/layout.tsx")).not.toMatch(
      /import ["']\.\/landing-v[234]\.css/,
    );
    expect(active.replace(/\r\n/g, "\n")).toContain(
      read("archive/styles/landing-v4.css").replace(/\r\n/g, "\n").trim(),
    );
    const original = [2, 3, 4].reduce(
      (sum, version) =>
        sum + read(`archive/styles/landing-v${version}.css`).length,
      0,
    );
    expect(active.length).toBeLessThan(original * 0.55);
  });

  it("never imports historical implementations into active application code", () => {
    for (const directory of ["app", "components", "lib"]) {
      for (const entry of readdirSync(directory, { recursive: true })) {
        if (
          typeof entry !== "string" ||
          !/\.(ts|tsx)$/.test(entry) ||
          entry.replaceAll("\\", "/").startsWith("server/db/generated/")
        )
          continue;
        const file = path.join(directory, entry);
        expect(read(file), file).not.toMatch(
          /(?:from\s*|import\s*|require\s*\()\s*["'][^"']*archive\//,
        );
      }
    }
  });

  it("keeps generated QA output out of Git and historical code out of runtime tooling", () => {
    expect(read(".gitignore")).toContain("/artifacts/");
    expect(JSON.parse(read("tsconfig.json")).exclude).toEqual(
      expect.arrayContaining(["artifacts", "archive"]),
    );
    expect(read("eslint.config.mjs")).toContain('"archive/**"');
    expect(read("vitest.config.ts")).toContain('"archive/**"');
  });

  it.each([
    "README.md",
    "docs/README.md",
    "docs/STATUS.md",
    "docs/ROUTES.md",
    "archive/README.md",
    "docs/archive/reports/README.md",
  ])("%s has resolvable local documentation links", (file) => {
    for (const match of read(file).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1].split("#")[0];
      if (!target || /^(?:https?:|mailto:|\/)/.test(target)) continue;
      expect(
        existsSync(
          path.resolve(path.dirname(file), decodeURIComponent(target)),
        ),
        `${file} → ${target}`,
      ).toBe(true);
    }
  });

  it.each([
    {
      file: "data/account-learning-guide.ts",
      sha256:
        "1ffa95a27665fc3970f03ef881db282f0cdfe994efee691d51e81876e4cc9187",
    },
    {
      file: "components/academy/account-city.tsx",
      sha256:
        "2faafe1a10474338f8779691e785b5ceb04c8499f7993a1cd027a1313e1cbd6f",
    },
    {
      file: "app/account-city.css",
      sha256:
        "c2d17cb3acc095558bdcf4e714c0a9d6c6d8eb3a95dfce9afeff479981c32a35",
    },
    {
      file: "lib/account-city.ts",
      sha256:
        "f4ccc5f939a6ad064a0eb6d8a7288cfef7e8bfe205458c0214eca24de51a0684",
    },
    {
      file: "app/[locale]/account-guide/page.tsx",
      sha256:
        "73773caa0e5e77622193be3a4eebff46ca089c496a361530050309b3321e8e0c",
    },
  ])(
    "does not change protected accounting source $file",
    ({ file, sha256 }) => {
      expect(
        createHash("sha256")
          .update(read(file).replace(/\r\n/g, "\n"))
          .digest("hex"),
      ).toBe(sha256);
    },
  );
});
