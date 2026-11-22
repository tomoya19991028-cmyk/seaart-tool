# Consistent selection dialogs

Run `npm run test:selection-ui` with full Git history available. Use a new `RESULT_DIR` to retain results, viewport metrics and screenshots. The runner stops after its first failed case.

The twelve cases cover a same-origin upgrade, ten main dialog families, native selection/Undo behavior, real sequential keyboard input and caret retention, both manga picker types, original card columns, favorites and generation, four viewports including landscape, specialized pose/color controls, the visibility-API fallback, repeated redraws and save/reload. The horror feature picker also checks body-only scrolling, a fixed close button and remembered scroll position at 640×360, 800×393 and 800×430. Keep the inherited horror-auto UI assertions unchanged.

Filter regressions include the actual six-button person outfit picker with a selected school uniform, at 320/393/430px and normal/150% text. Check each button against both its parent row and the dialog frame, label overflow, right-edge touch, redraw and selection retention. Also inspect the other main filter families and both manga pickers at 320px. Text enlargement changes the actual fixed-pixel filter labels from 12px to 18px; it is a simulation, not a physical Android font-setting test. An outer dialog width check alone cannot prove that its controls fit.

The first four person filters must share one row before and after redraw, including enlarged text. Labels may wrap inside their grid cells; the buttons stay in four equal columns. Run the unchanged `tests/v44-audit/ui.cjs` as well: it covers the original four-button upper-clothing picker at 320px and the other viewport/font scenarios.

The upgrade uses a second browser context with identical saved input as an old-to-old reload control. Existing character-alias normalization changes catalog ordering during startup; compare the candidate with that control rather than requiring the unhydrated runtime catalog to equal a later reload. User working state, favorites, history and generated output are compared directly.

`TEST_IDS` supports targeted cases and initializes a fresh candidate fixture when the upgrade case is omitted. All fixtures are synthetic and service workers are blocked. The separate PWA suite verifies real service-worker upgrade/offline behavior. Screenshots cover 320×640, 393×800, 1024×900 and 844×390; no physical device is claimed.

## Compact picker chrome

`npm run test:compact-picker` checks the upgrade from `083672810ccf301552d861546ae550a2a53f9694`, preserved working data/named saves/history/output, increased candidate height, field-specific counts independent of search, native category/sort/view controls, manga redraws, staged horror close/save, and fixed bottom controls at five viewports with actual enlarged chrome text. Existing view-switch tests open the intentionally collapsed display-settings disclosure first; selection and overflow assertions remain intact.

Native menus stay inside their original manga actions host so its cleanup can remove obsolete controls. The lower close button clicks the existing header close, retaining its immediate/staged semantics. Candidate dialogs show a native-state count; specialized settings without a well-defined item count show editing status instead. Horror's explicit save/cancel controls remain present, and closing does not apply drafts.

The display-settings toolbar keeps classification, sorting, list and card controls on one horizontal row, including 320px and enlarged control text. Submenus use their own following row. Character and both manga picker types are covered explicitly, and the selected display mode retains an accent background. The legacy whole-UI test explicitly clicks `.selectionFootClose` because both header and footer now expose a valid Close button. Existing layout, selection and font assertions are retained.

## Category scrolling

Run `npm run test:category-scroll` for real Chromium touch input and mouse-wheel tests. The fixed settings panel owns scrolling; its nested category/sort/filter panels must allow that gesture to reach it. Cases cover an old-to-new same-origin saved-data upgrade, touch-only navigation to the final real category, boundary containment and 24 picker/viewport/font combinations. Existing generated output and selection data must remain unchanged while panning.

The old browser behavior is recorded as a negative control, not required across browser engines. Input uses CDP touchStart/touchMove/touchEnd and realistic wheel steps; direct scrollTop assignment and scrollIntoView are not used to demonstrate movement. A short stationary hold ends the touch gesture without fling before switching input methods. Pixel-rounding tolerance is at most 2px at the scroll boundary. A final-category tap is permitted only after asserting that its bounds are already inside the popup.
