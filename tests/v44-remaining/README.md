# v44 remaining checks

Continue PR #1; do not deploy or change main. Original failed records and tests remain immutable.

```sh
npm ci
npm run build:check
npm run test:quality
npm run test:audit
npm run test:remaining
npm run test:stability
```

`test:remaining` runs 16 supplemental cases (CSV 5, compatibility 3, simple UI 4, media 3, diagnostics 1), then the current adapters for the 13 historical failed jobs and six existing media cases. The independent FIXED supplemental case replaces the old dependency-blocked comparison. These are different counting units; never add jobs, grouped cases, or repeats together.

`test:stability` repeats all 14 main UI cases in five fresh contexts. It separately runs the original A07/A08 and AU-360x640-1 five times with original navigation timeouts. The first CI's exact failed case is unrecoverable, so the full UI suite is repeated instead of guessing that B05 was its cause.

The main runner and inherited runner must not run concurrently with another inherited/repeat runner locally: historical tests use localhost port 8765 and several fixed PWA ports. Keep total browser runners at two or fewer on the managed 2-core environment. CI jobs use separate machines.

`replay.cjs` delegates to the existing TG/forms adapters and changes only the documented obsolete assertions/fixtures. It validates patch anchors. It retains all original ownership, draft, consent, Undo, and persistence assertions. Supplied v44 is reconstructed into `.audit-tmp/remaining-assets/reference-v44` from a pinned commit and six reference-only edits, then checked against its original SHA. It is never copied into the product. Historical assets are prepared without overwriting differing files.

The FIXED comparison reads the immutable original compressed fixture. It does not depend on R1 completing. Three intentional presentation differences are explicit: bust's label, facing-each-other's group, and weaponState's 装備・動作 tab label from the 2026-10-26 weapon specification. The immutable fixture and its values are unchanged. Known undefined sound/reaction defaults are handled in the PWA adapter, and nonempty values are compared independently in the full working snapshot.

Every runner uses synthetic data, private contexts and loopback servers. No user storage, Android device, IME or real service image is accessed. The diagnostics self-test intentionally creates one failed child assertion to prove screenshot/console/trace collection; its expected failure is not a product failure or an extra PASS.

Use fresh RESULT_DIR values. Sources, product SHA before/after, exact failed IDs, and original attempts are recorded separately. Only exact final bytes count as final validation.
