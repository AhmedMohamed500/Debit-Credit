# Offline Result Sharing

The competition profile exports the most recent ranked result as a versioned JSON package with challenge ID/version/seed, ruleset version, player display name, score summary, timestamp and FNV-style checksum. Import validates schema, checksum and exact current challenge version/seed before displaying a comparison. It exports no CV, contact details, private answers or unrelated profile saves.

This is an **offline preview**, not secure remote verification. The checksum detects accidental edits but is not a cryptographic signature: anyone with the JSON can recalculate it. Imported results never become Verified evidence or server ranking. Full two-device league sync, signed attempts and anti-cheat require future backend infrastructure.
