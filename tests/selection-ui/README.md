# Consistent selection dialogs

Run `npm run test:selection-ui` with full Git history available. Use a new `RESULT_DIR` to retain results, viewport metrics and screenshots. The runner stops after its first failed case.

The nine cases cover a same-origin upgrade, ten main dialog families, native selection/Undo behavior, real sequential keyboard input and caret retention, both manga picker types, original card columns, favorites and generation, four viewports including landscape, specialized pose/color controls, the visibility-API fallback, repeated redraws and save/reload.

The upgrade uses a second browser context with identical saved input as an old-to-old reload control. Existing character-alias normalization changes catalog ordering during startup; compare the candidate with that control rather than requiring the unhydrated runtime catalog to equal a later reload. User working state, favorites, history and generated output are compared directly.

`TEST_IDS` supports targeted cases and initializes a fresh candidate fixture when the upgrade case is omitted. All fixtures are synthetic and service workers are blocked. The separate PWA suite verifies real service-worker upgrade/offline behavior. Screenshots cover 320×640, 393×800, 1024×900 and 844×390; no physical device is claimed.
