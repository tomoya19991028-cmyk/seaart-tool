# 通常画像優先UIの検証

基点は統合remote `0dff414fda13f92c2a0099b4570d0c68da797a18`。元テスト・expected・fixtureを変更せず、改善版を別worktreeとoriginで検証する。

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

先に改善版URLのHTTP 200と、モード切替ボタンがあることを確認する。前回の統合URLを今回のTARGET_URLへ流用しない。

```sh
export TARGET_URL=http://127.0.0.1:8765/seaart-normal-first/index.html
export BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html
export NORMAL_UI_RESULTS=/workspace/normal-first-new-verification

RESULT_DIR="$NORMAL_UI_RESULTS/contracts" node tests/normal-first/contracts.cjs
RESULT_DIR="$NORMAL_UI_RESULTS/ui" node tests/normal-first/ui.cjs
RESULT_DIR="$NORMAL_UI_RESULTS/pwa" node tests/normal-first/pwa.cjs
```

N01〜N20は通常初期表示、即時選択／解除、対象分離、重み、通常状態、表示だけの切替、必要な競合／共有変更確認、保存失敗、stale、漫画buffered編集、既存漫画editorからの明示入口、Undo、JSON／reload、未設定の読取、旧統合v5、実2タブ、消失owner、通常へ戻す操作を検証する。`TEST_IDS=N08,N09`等で限定診断できる。限定実行を全20件のPASSと扱わない。

UIは360／393／430 × 640／800。3ページ×6カードを維持し、直接選択・タグ解除・対象コマの明示操作・内部スクロール・44pxボタン・380px高の入力領域模擬を検証する。実Android IMEではない。PWA用8788を確保し、実SWでonline準備→offlineの実チェック操作→保存→reload→解除→reload→online復帰を検証する。

## 元の全回帰

[統合手順](../integration/README.md)の全19群、[怪異手順](../horror/README.md)・[独立検証](../horror/README-independent.md)を改善版に向ける。URL・cacheの設定と、旧漫画UI試験への明示モード選択だけをメモリ上で適用する。

```sh
RESULT_DIR="$NORMAL_UI_RESULTS/old-ui" node tests/normal-first/replay.cjs tests/horror/ui.cjs
RESULT_DIR="$NORMAL_UI_RESULTS/horror-pwa" node tests/normal-first/replay.cjs tests/horror/pwa.cjs
RESULT_DIR="$NORMAL_UI_RESULTS/pwa-regression" node tests/normal-first/replay.cjs tests/horror/replay-pwa.cjs
RESULT_DIR="$NORMAL_UI_RESULTS/combined-pwa" node tests/normal-first/replay.cjs tests/integration/pwa.cjs
```

T28原本は旧「保存→漫画影響プレビュー→下書き」の操作を確認するため、入場直後に新しい「漫画」ボタンを明示選択する。それ以外の元assertions・expectedは維持する。通常の新操作はN群・新UIで別に検証する。原本を新しい仕様に合わせて書き換えない。

各実行のURL・試験ソースSHA・製品SHA・command・exit codeを記録する。出力先は試行ごとに分け、失敗・中断を保持する。8GB環境ではブラウザ群を同時に大量起動しない。今回のOOM／対象URL指定ミスの記録は別に保持し、最終PASS集計から除外する。

HTMLは`HORROR_BUILD_HTML`を隔離された未使用の出力先に指定し、`scripts/build-integrated.py`で再生成・全bytes比較する。`embed-horror.py`は既存runtimeの後に新UI sourceを別scriptとして埋め込む。保存schema／namespaceは変更しない。新cache名は`seaart-tool-pwa-v5-horror-normal-first-ui-v1-http-cache-v1`。

main・公開PWA・本人限定Sitesを更新しない。結果は隔離した模擬データで得たもので、スマホ本体のバックアップや実機試験ではない。
