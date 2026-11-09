# Simple manga wardrobe regression

Run `npm run test:manga-outfits` with full Git history available. Set `RESULT_DIR` to an unused directory to retain JSON evidence and synthetic backup downloads. The runner stops on its first failure.

The browser uses an isolated same-origin server and a fresh context with service workers blocked. It loads protected main `41dfacff31e4fa2f8b456b4ef3d463677f0dfad6`, saves synthetic main and simple-manga state through application actions, then exercises the candidate and a downgrade/upgrade roundtrip. The separate PWA suite tests service-worker upgrades and offline behavior. Main user state is compared across reloads; raw main key bytes are checked during manga-only interactions, where no main save is expected. Favorite priority is retained even when explicit name sorting is selected.
