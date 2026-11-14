# Consistent selection dialogs

Run `npm run test:selection-ui` with full Git history available. Use a new `RESULT_DIR` to retain results, viewport metrics and screenshots. The runner stops after its first failed case.

The twelve cases cover a same-origin upgrade, ten main dialog families, native selection/Undo behavior, real sequential keyboard input and caret retention, both manga picker types, original card columns, favorites and generation, four viewports including landscape, specialized pose/color controls, the visibility-API fallback, repeated redraws and save/reload. The horror feature picker also checks body-only scrolling, a fixed close button and remembered scroll position at 640×360, 800×393 and 800×430. Keep the inherited horror-auto UI assertions unchanged.

Filter regressions include the actual six-button person outfit picker with a selected school uniform, at 320/393/430px and normal/150% text. Check each button against both its parent row and the dialog frame, label overflow, right-edge touch, redraw and selection retention. Also inspect the other main filter families and both manga pickers at 320px. Text enlargement changes the actual fixed-pixel filter labels from 12px to 18px; it is a simulation, not a physical Android font-setting test. An outer dialog width check alone cannot prove that its controls fit.

The upgrade uses a second browser context with identical saved input as an old-to-old reload control. Existing character-alias normalization changes catalog ordering during startup; compare the candidate with that control rather than requiring the unhydrated runtime catalog to equal a later reload. User working state, favorites, history and generated output are compared directly.

`TEST_IDS` supports targeted cases and initializes a fresh candidate fixture when the upgrade case is omitted. All fixtures are synthetic and service workers are blocked. The separate PWA suite verifies real service-worker upgrade/offline behavior. Screenshots cover 320×640, 393×800, 1024×900 and 844×390; no physical device is claimed.
