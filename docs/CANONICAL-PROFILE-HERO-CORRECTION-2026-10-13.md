# Canonical profile/header correction — 2026-10-13

## Differences found in the supplied production screenshot

- The header displayed a blank name, missing location and no saved professional links. The previous implementation rendered a local cached career profile, while the CV used the server's canonical projection. The profile effect also did not rerun when authenticated account identity changed. This could leave the authenticated header rendering old guest/cache data.
- Arabic container direction reversed the identity metadata and action order relative to the reference.
- The portrait was still opaque. CSS and support for alpha uploads cannot remove an already saved gray background. The previous release did not deliver that requested image edit.
- The public QR is legitimately absent when the owner has public sharing disabled. No public sharing consent or fake QR is created to imitate the reference.

## Correction

- `AccountMemberProfile` loads the current owner's existing `GET /api/v1/me/cv` projection for the saved name, location, professional fields and summary. It does not write or create another profile. It refuses to substitute a default/blank identity when the projection is unavailable.
- Owner guards discard stale requests and suppress the previous account while switching. Focus and saved-sync events refresh the projection. Guest/editor/accounting flows retain their existing repositories.
- The identity block remains English/LTR inside Arabic or English navigation, matching the reference. Location precedes the compact availability badge; CV, Contact and real saved LinkedIn/GitHub/Website destinations retain reference order. Canonical LinkedIn/Website fields are used if the optional showcase link fields are empty. No missing destination is fabricated.
- The photo column is moved to the reference's approximately 32% identity-start position; summary stays within three displayed lines. Other profile sections and sharing rules are unchanged.

## Private portrait asset

The built-in imagegen tool extracted a transparent portrait from the screenshot the user provided. It is stored only under ignored `artifacts/hero-reference/owner-cutout-private.png`, not in `public/`, Git, a shared/default avatar, or another user's account. It is a generated extraction from the supplied screenshot, not an assertion that original photograph pixels were available.

Prompt: Use case: background-extraction, identity-preserve. Edit target: the real man's profile photograph in the LEFT gray rectangle of the supplied website screenshot, approximately x=171 to 573 and y=118 to 520. Extract ONLY this exact real man on a genuinely transparent alpha background. Remove the gray background and ALL surrounding website UI completely. Preserve his exact face, skin, expression, beige hoodie with its existing small print, crossed arms, wristwatch, pose and body proportions. Do not replace him with the dark-haired suited man from any other reference. Do not add a suit, do not beautify, restyle or invent another face. Do not include text, buttons, QR, logo, border or office backdrop. Keep the same waist-up framing of the source portrait and clean natural edges of shoulders and clothing, with minimal transparent margin. A clean square PNG cutout for his private profile image, not a new portrait.

Both browser automation runtimes could not initialize (`failed to write kernel assets`). The cutout could not be saved through the owner's authenticated browser. The release must not claim the existing production account photo was replaced. No forbidden production-credential access was retried.

## Validation

- Focused tests cover canonical identity despite blank local storage, account isolation, stale responses and saved-sync refresh.
- `npm run check` includes lint, TypeScript, unit tests and a production build.
- The isolated PostgreSQL/browser harness adds canonical-name/location/link assertions and LTR assertions for Arabic and English desktop/mobile. With `--owner-portrait`, it saves only a local test-account version of the supplied cutout and verifies alpha survives the existing upload sanitizer.
- Screenshots under ignored `artifacts/hero-reference/qa/` are local fixture previews, not proof that the production owner account was modified. The original office stock-photo file is not available; the previous reconstructed background is retained.

Final local results: `npm run check` passed (650 tests in 78 files, lint, TypeScript and production build); isolated portrait/profile/recruiter QA passed 263 checks; student/CV regression QA passed 672 checks. The regression assertion was updated to require the reference's English/LTR hero and the exact newly saved social-link destination, while the rest of the Arabic/English site remains localized.

Header-only preview: `artifacts/hero-reference/qa/candidate-corrected-header-ar.png`. The QR in that preview belongs to an isolated local test account. It does not activate or represent the production owner's public link.
