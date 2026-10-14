# 東京喰種・遊戯王 第1回回帰

基準commit `3fd1bb9fc34be09d85e3eef71cc1f6122f9054b8`。`baseline-contract.json` は正式ZIPの隔離runtime証跡から抽出した旧1,390行と1,384基本外見。製品から期待値を作り直していない。

`TARGET_URL` は検証版localhost、`RESULT_DIR` は未使用の証跡ディレクトリ。Playwright、Chromium `/usr/bin/chromium`、Node、Pythonを使用。CPU 2コア環境ではブラウザrunnerを合計2本までに制限する。

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
TARGET_URL=http://127.0.0.1:8765/seaart-phase1/index.html RESULT_DIR=NEW_DIRECTORY node tests/tg-yugioh-phase1/contracts.cjs
TARGET_URL=http://127.0.0.1:8765/seaart-phase1/index.html TEST_WORKERS=1 python tests/tg-yugioh-phase1/run-inherited.py NEW_DIRECTORY
TARGET_URL=http://127.0.0.1:8765/seaart-phase1/index.html python tests/tg-yugioh-phase1/run-forms.py NEW_DIRECTORY
TARGET_URL=http://127.0.0.1:8765/seaart-phase1/index.html RESULT_DIR=NEW_DIRECTORY node tests/tg-yugioh-phase1/ui-pwa.cjs
TARGET_URL=http://127.0.0.1:8765/seaart-phase1/index.html RESULT_DIR=NEW_DIRECTORY node tests/tg-yugioh-phase1/yugioh-selection.cjs
python tests/tg-yugioh-phase1/quality.py NEW_DIRECTORY
```

別checkoutをlocalhostで配信する。基準形態版は `PHASE1_BASELINE_URL`（default `/seaart-phase1-baseline/index.html`）。旧v4はmainの `/seaart-old-main/index.html`、旧v5はhorror-autoの `/seaart-horror-auto/index.html`。旧試験の固定パスに合わせ `/seaart-creature-motif-integration1/baseline` をmainへ対応付け、UI比較用 `/seaart-card-tags` を当該ブランチへ対応付ける。実ユーザーの保存は使わない。

元試験を編集せず `replay.cjs` が従来のadapterを継承。今回追加した15行・15標準形態・プリセット・追加性別キー・46候補と衣装を旧集合比較の投影から除外する。旧データ・旧テストの期待値・生成全文は変更しない。現在の全データを別のTG01/Q試験で検証する。cache名の対応と、形態追加でlastが変わる旧UI試験の適用対象を元の金木kaguneへ固定したことを明記する。

`contracts.cjs` は32ケース（最終resultsから確定）。`ui-pwa.cjs` は3画面幅の共通人物一覧と隔離originのoffline復帰4ケース。`yugioh-selection.cjs` は全14名の個別選択と名前付き保存。元41runnerと形態版9runnerも再実行する。重いA24の24組合せやR1の865matrixは、runnerケース数とは分けて記録する。

Android実機・日本語IME・実SeaArt画像生成は未実施。先行試行のFAILと中断はattemptsに残し、原因と再検証を総合報告に記載する。

`replay-before-gender.cjs` は実行済み試験のadapter原本（SHAで照合）。最終adapterはR1／legacyの性別mapから新15キーだけを投影する修正を追加。他のrunnerのコンパイル結果は同一で、最終バイト列・原テスト・使用adapter SHAが一致する実行だけを再利用する。R1／legacyには修正前adapterの結果を流用しない。

旧カタログ・detail候補の値は `baseline-existing-values.json` に保護。新規所有指定が既存候補を狭めないQ21と、全旧基本衣装owner保持のTG18を追加した。ウタの衣装はジェノスと既存値を共有し、新規衣装候補を重複登録しない。

旧auto比較は `/seaart-horror-stories`、旧story比較は `/seaart-unified-ui` も使用する。配信baselineは `validation/tg-yugioh-phase1/baseline-inventory.json` の保護HEAD・SHAと一致させる。

開始前に `python tests/tg-yugioh-phase1/prepare-baselines.py /workspace` を実行。保護HEADの資産を欠けたパスに用意し、既存の異なるファイルは上書きせず中止する。旧v5は `/seaart-integrated`、旧HTTP修正版v4は `/seaart-r1-save-worktree`（3aae122）、旧round2 v4は `/seaart-tool`（7b3f9af）、旧怪異v5は `/seaart-horror`（f58be6a）、旧v3は `/seaart-horror-validation/old-stage`（ee5b64a）。固定current URLを持つboundariesだけroute.cjsでTARGET_URLへ接続する。baselineを現行製品へ置き換えて期待値を一致させない。
