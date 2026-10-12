# Candidate header reference update — 2026-10-13

Scope is limited to the candidate header and hero. Existing profile, CV, accounting, recruiter discovery and sharing permissions are unchanged.

## Changes

- Photo-left, identity-middle and Career-ID-right composition with the supplied reference's approximate proportions.
- Borderless portrait framing; uploaded transparent photos retain their alpha instead of being flattened to white.
- Location and availability share one row; real Download CV, Contact and existing LinkedIn/GitHub/Website links remain connected.
- Header follows brand, navigation, actions menu and Share Profile order. Employer visibility is still accessible inside the existing actions menu.
- Career-ID public-view/share actions share a row. Real QR generation and the private/off state remain unchanged.
- The office background is reconstructed from the supplied low-resolution reference using the built-in imagegen tool, not the original stock-photo file and not an exact pixel copy. It contains no candidate portrait or private data.
- No personal image was embedded in public assets, no consent was enabled automatically and no production account data was modified.

## Asset and prompt

Asset: `public/platform/candidate-reference-office-v1.png`.

Prompt: Use case: precise-object-edit. Asset type: background-only image for the existing website's candidate profile hero. Input image 1 is the approved edit target. Extract/reconstruct ONLY the office/city background of the dark horizontal hero underneath the white navigation bar. Remove the portrait, all text, buttons, icons, QR card and white navigation/footer UI completely. Preserve the SAME background composition, position and colors from the reference: navy petrol modern glass-window office, blurred city skyline through the windows, visible plant leaves toward the left and right edges, small warm brass hanging light at far right and diagonal gold architectural beam at far left. This is not a new scene: preserve the reference's background layout and color mood closely, filling only what the removed foreground obscured. No people, no interface, no writing, no logos, no QR, no extra props, no new decorations. Wide horizontal 3:1 output intended to be cropped slightly for the existing hero.

## Validation and remaining limitation

Local production build and the 238-check isolated browser/PostgreSQL harness passed. Focused tests confirm client uploads and server sanitization preserve transparent pixels. Browser captures are under ignored `artifacts/hero-reference/qa/`, with synthetic test images, not the owner's photo.

The existing owner's portrait has NOT had its background removed. Reading the production connection configuration was blocked by automatic review; the connected browser was unavailable. The user subsequently requested publication of the current implementation. This release preserves the existing account photo and supports transparency for a properly prepared replacement; it does not claim automatic background removal.
