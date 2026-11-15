# Pose builder UI

Run `npm run test:pose-builder` with full Git history and a new `RESULT_DIR`.

Eight cases cover the last published version's saved multiple postures and opaque metadata, shared target/spatial relation/weight/color preservation and one-step Undo when changing a base, card editing/independent duplicates/removal, explicit combinations, all existing definitions/search/favorites/name sorting/equipment shortcuts, generated output/named saves/history/working JSON/reload, five viewport sizes with normal and enlarged control text, and staged creature edits/cancel/save isolation.

The upgrade uses an old-to-old hydration control because the existing catalog alias normalization can change startup ordering. Neither catalog definitions nor storage formats are changed by this feature. All data and browser contexts are synthetic; no physical Android/Safari test is claimed. The runner stops on the first failed case.
