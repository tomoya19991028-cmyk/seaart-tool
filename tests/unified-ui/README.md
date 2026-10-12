# 人物・生物UI一括更新の再実行

既存テスト・expected・fixtureを変更せず、新製品のURLとcache名、削除した作成ボタンの内部入口だけを実行時に設定します。模擬データと隔離ブラウザを使用し、公開origin・実機保存を操作しません。

必要環境：Python 3、Node.js、Playwright、`/usr/bin/chromium`。HTTPサーバーを `/workspace` で起動してください。PWA試験には localhost の8788／8796／8797等の専用ポートを使用します。

```bash
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

別の端末で、**未使用の結果ディレクトリ**を指定します。

```bash
TARGET_URL=http://127.0.0.1:8765/seaart-unified-ui/index.html \
BASELINE_UI_URL=http://127.0.0.1:8765/seaart-card-tags/index.html \
BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html \
BASELINE_DIR=/workspace/seaart-creature-motif-integration1/baseline \
python tests/unified-ui/run.py /workspace/unified-ui-new-results
```

今回の旧正本fixtureは既存の `/workspace/seaart-r1-save-worktree`、`/workspace/seaart-horror-validation/old-stage`、`/workspace/seaart-creature-motif-integration1/baseline` 等を保護して利用しました。他環境では、各既存試験の手順書を参照し、対応する過去commitのfixtureを別ディレクトリへ用意してください。既存のworking treeを上書きしないでください。

個別の新試験：

```bash
RESULT_DIR=/workspace/new-contracts TARGET_URL=http://127.0.0.1:8765/seaart-unified-ui/index.html node tests/unified-ui/contracts.cjs
RESULT_DIR=/workspace/new-ui TARGET_URL=http://127.0.0.1:8765/seaart-unified-ui/index.html node tests/unified-ui/ui.cjs
RESULT_DIR=/workspace/new-pwa node tests/unified-ui/pwa.cjs
RESULT_DIR=/workspace/new-comparison TARGET_URL=http://127.0.0.1:8765/seaart-unified-ui/index.html node tests/unified-ui/compatibility.cjs
```

- U01〜U24：6カード・1ページ、全登録一覧、94種類、擬人化6／4カード、両モードの一覧、★Undo、位置、編集保存・reload、モードだけの保存、盾の部分編集、保存障害、人物管理、競合拒否・旧type省略データの編集・falseお気に入りの往復等。
- UUI：360／393／430×640／800、800×360／393／430、150%文字の3幅、計12条件。日本語・多数タグ・44px・均一なカード高・編集対象・dialog・横幅を確認。
- UC01〜UC08：旧怪異カード版との候補表・生成関数・通常／生物／半擬人化／完全擬人化／怪異／漫画／保存キー・成人定義の比較。
- PWA：旧カード版→新cache、旧タブと入力の維持、明示reload、offline擬人化保存、★Undo、online復帰の6確認点。

`replay.cjs` は旧試験をメモリ上で読込みます。expectedとassertionsを変更しません。旧ボタン削除後の統合UI試験は、保存した内部作成機能を `openMotifPersonImport()` で開きます。削除ボタンが残っていると主張する試験ではありません。怪異旧UIでは明示漫画モードへ切り替え、SW試験では対象のcache名だけを指定します。

製品再生成：既存の `scripts/build-integrated.py` を使用します。`HORROR_BUILD_HTML` には存在しない孤立した出力ファイルを指定し、生成後に全bytes一致を確認してください。元HTMLや既存検証記録の上書きは不要です。

結果の件数は契約・操作ケース・viewport・PWA確認点を集計します。865 assertions、全文構成数、候補198件を重複加算しません。Android実機・実IME・実SeaArt生成品質は自動PASSへ含めません。
