# Shared outfit sets

Run `npm run test:outfit-sets` with full Git history available. Use a fresh `RESULT_DIR` to retain evidence. The runner stops on its first failure.

The seven cases exercise the actual main and shadow-DOM manga UIs in isolated contexts. They cover the 21 requested labels and English values, all set parts and generated prompts, manual part/color/weight/exclusion behavior, previous-main save migration, main/manga isolation, named saves and JSON restoration, and a saved user candidate that already uses the `school swimsuit` value. In that collision fixture the user's ID, label, edited output, hidden flag and custom set take precedence over the shipped defaults.

No real browser profile or user storage is accessed. The PWA suite separately covers cache upgrades and offline saves.
