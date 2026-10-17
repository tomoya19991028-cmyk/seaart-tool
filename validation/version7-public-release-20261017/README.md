# Version 7 public release evidence (2026-10-17)

Main product HEAD: `894d5fbfdfa65e68a50b77acdaa3e497ed31aeca`. Submission: `51e75fb1f88425b407c42817d006e8926376c46e`. Product HTML/SW and all six shell files match the submitted hashes. Only `_config.yml` is added to product release scope, excluding non-runtime validation links from the existing Jekyll build.

Final accepted result: 741 PASS / 0 FAIL, 4 scope SKIP. Core regression: 714 (700 regular + 14 independent alternatives); pre-publication checks: 21; public HTTPS checks after deployment: 6. Original missing tests remain missing (3 files). Initial navigation timeouts, original Jekyll failure and test-fixture corrections are retained separately; original test expectations and navigation limits were not changed. The initial forms parent exit 1 remains recorded; only its two startup-blocked cases were rerun unchanged, and the accepted final per-suite results are separate.

Actual deployment: workflow https://github.com/tomoya19991028-cmyk/seaart-tool/actions/runs/39005407894, deployment 7135170980. Public URL: https://tomoya19991028-cmyk.github.io/seaart-tool/ . Public HTTPS browser contexts were isolated; no real user storage was accessed. Android hardware/IME and actual SeaArt images were not tested.

Recovery ref: `backup/old-public-pwa-20261017T035341Z`. Full old-main Git bundle, tar, six actually served files, settings/workflow metadata and SHA inventory are in the downloadable backup artifact. User pre-update data protection was confirmed by the user, not directly inspected by Codex. Sites and repository/Pages visibility were unchanged.

See the four Japanese reports at the root, test-matrix.md, pre-publication-gates.json and public-after.json. Full raw attempts are retained in the delivery ZIP. Final reports/evidence are appended to the dedicated integration branch after publishing; the public main product HEAD stays pinned above.
