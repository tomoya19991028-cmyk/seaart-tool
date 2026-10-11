# 怪異タブ H1〜H8 再検証

基点は `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。既存のテスト原本と固定expectedは変更しない。
Node.js、Playwright、Chromiumが必要。結果はリポジトリ外へ出す。

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

別端末で `/workspace/seaart-horror` から実行する。

```sh
RESULT_DIR=/workspace/horror-retest/contracts node tests/horror/contracts.cjs
RESULT_DIR=/workspace/horror-retest/faults node tests/horror/faults.cjs
RESULT_DIR=/workspace/horror-retest/boundaries node tests/horror/boundaries.cjs
RESULT_DIR=/workspace/horror-retest/ui node tests/horror/ui.cjs
RESULT_DIR=/workspace/horror-retest/pwa node tests/horror/pwa.cjs
RESULT_DIR=/workspace/horror-retest/pwa-regression node tests/horror/replay-pwa.cjs
```

`contracts.cjs` はT02〜T26。`TEST_IDS=T13,T16` のように指定すると対象だけ再実行できる。
`ui.cjs` はT27・T28、`pwa.cjs` はT29・T30。PWA用ポート8784、旧PWA回帰用8782を使う。

T01は元のR1の49契約・通常210／漫画210／コマ420と固定12datasetで検証する。

```sh
TARGET_URL=http://127.0.0.1:8765/seaart-horror/index.html \
BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html \
RESULT_DIR=/workspace/horror-retest/r1 node tests/creature-motif-person-r1.cjs

TARGET_URL=http://127.0.0.1:8765/seaart-horror/index.html \
RESULT_DIR=/workspace/horror-retest/legacy node tests/horror/replay-legacy.cjs

TARGET_URL=http://127.0.0.1:8765/seaart-horror/index.html \
RESULT_DIR=/workspace/horror-retest/motif node tests/creature-motif-person.cjs

TARGET_URL=http://127.0.0.1:8765/seaart-horror/index.html \
RESULT_DIR=/workspace/horror-retest/motif-boundaries node tests/creature-motif-person-boundaries.cjs
```

固定比較は `tests/creature-motif-person-fixed-baseline.cjs` へ `CURRENT_RESULTS` を指定する。
`RESULT_DIR/baseline` に読み取り専用の基点HTMLが必要。expectedの生成・更新は行わない。

旧版fixtureは各Git commitの製品6ファイルを別ディレクトリへ書き出し、read-onlyにする。

| パス | commit |
| --- | --- |
| `/workspace/seaart-creature-motif-integration1/baseline` | `5b5bb03589dcc9a661402395d6c3db20cfd4cf52` |
| `/workspace/seaart-r1-save-worktree` | `326b4e482f17d4bd94605696ed2e3fdda30b43d0` |
| `/workspace/seaart-tool`（第2回） | `7b3f9afd6cf1db20b74359fcf3f14fa4d8101841` |
| `/workspace/seaart-horror-validation/old-stage` | `ee5b64a` |

旧版writerは新5キーを変更できないことを実際に同一originで確かめる。実端末・公開originの試験ではない。

`scripts/integrate-horror.py` は基点HTMLに対する一度だけの検証付き変更。
`scripts/embed-horror.py` はsourceを単一HTMLへ埋め込む。既存のCRLFを維持する。
`HORROR_BUILD_HTML` を指定すると、基点から隔離ファイルを再生成して製品とbytes比較できる。
