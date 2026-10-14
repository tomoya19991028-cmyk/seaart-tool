# 固有形態・6構造・背景・光色・スマホUI検証

Chromium + Playwright、Node、Pythonを使用。実利用者の保存は使用しない。`/workspace` をlocalhostで配信する。対象URLは新worktree、baselineは保護済み第1回main。

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
TARGET_URL=http://127.0.0.1:8765/seaart-person-forms/index.html TEST_WORKERS=2 python tests/forms-environment/run-regressions.py NEW_RESULT_DIRECTORY
python tests/forms-environment/verify-results.py NEW_RESULT_DIRECTORY
```

各新規runnerは `TARGET_URL` と新しい `RESULT_DIR` を指定して実行する。

```sh
TARGET_URL=http://127.0.0.1:8765/seaart-person-forms/index.html RESULT_DIR=NEW_CASE_DIRECTORY node tests/forms-environment/contracts.cjs
```

- contracts: 32契約、型×状態×6構造72組・未指定／なし144組、適用／切替／手動保持／UUID／保存失敗5箇所／Undo／依存再確認等。
- persistence: 9ケース。reload、名前付き保存、履歴、実JSON往復、旧製品からのv3/v4/v5実読込、複製・自由形態。
- candidate-ui: 6ケース。共通衣装、携行品、形態編集の固有候補スイッチ、管理画面の1操作適用、候補編集、編集後の意味的競合。
- ui: 12viewport／文字倍率。構造・背景・光色・生成結果・形態管理の操作。
- structure-visibility: 3ストレスケース。カード内のクリップ、スクロール経路、ボタン中心のhit test、全6構造の表示。
- environment-faults: 2保存失敗。RAM・disk・Undo・使用履歴の一致。
- result-area: 3viewportで旧版とタグ領域・実際に見えるタグ数を比較。本文は一致。
- pwa: 4ケース。隔離originで新機能・下書き・保存のoffline/reload/online復帰。
- forms-repro: 不足候補2ケースの再現・修正確認。
- quality: 19件。元テスト・fixture不変、84候補・6プリセット不変、旧3構造定義不変、追加ID／タグ、SW cache名のみ、共通パレット、UTF8/CRLF、raw generator等。

旧runner41群は `replay.cjs` で現在のUI・cacheへ接続する。原本は変更しない。承認済みの候補追加を除いた旧ID／値の投影を比較し、生成全文は一切変換しない。R1の12datasetとadapters、Native比較、旧resolverの新3構造unsetフィールド、直接構造ボタン数6への変更を明示している。新規テーブル全体は別検証する。比較に不要なUI provenanceは従来のadapterを継承。

失敗runnerはブラウザsocketで停止し続けないよう、元のFAILと非zero終了を維持したまま終了させる。`REUSE_RESULTS` を使う場合も製品・原本・wrapperのSHAがすべて一致する実行だけを採用する。今回の最終保存では最終製品を再実行している。

未回収のモチーフ第2回専用3ファイルは引き続き代替試験として扱い、正規試験のPASSとしない。Android実機、実IME、実SeaArt画像、公開origin更新は未実施。
