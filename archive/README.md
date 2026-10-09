# Historical UI archive

Unused landing components and original landing styles are retained unchanged for reference. Active App Router pages do not import these components. Runtime lint, TypeScript and tests exclude this directory; they continue to check the active application.

`app/landing.css` keeps the current v4 landing plus shared rules still used by active pages. The original three stylesheets are preserved here. Before/after browser QA checks Arabic/English, desktop/mobile, light/dark, including full-page pixel comparisons.

See [manifest.json](manifest.json) for original paths, normalized-content SHA-256 and removal counts. Restore historical implementations deliberately using this archive or Git history.

`qa/` preserves 19 historical verification scripts formerly tracked under artifacts. Their old working-directory/import assumptions may require adaptation; use active runners in `scripts/` for current QA.
