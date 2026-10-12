# ホラー候補・漫画ストーリー追加の再実行

隔離した模擬データを使用します。公開origin・実機の保存データを操作しません。既存のexpected／fixture／テスト原本は変更していません。

必要環境：Python 3、Node.js、Playwright、Chromium（`/usr/bin/chromium`）。製品は本ブランチの生成済み `index.html` です。

```bash
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
TARGET_URL=http://127.0.0.1:8765/seaart-horror-stories/index.html \
BASELINE_UI_URL=http://127.0.0.1:8765/seaart-unified-ui/index.html \
BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html \
BASELINE_DIR=/workspace/seaart-creature-motif-integration1/baseline \
python tests/horror-stories/run-regressions.py /workspace/NEW_RESULT_DIRECTORY
python tests/horror-stories/verify-results.py /workspace/NEW_RESULT_DIRECTORY
python tests/horror-stories/quality.py
TARGET_URL=http://127.0.0.1:8765/seaart-horror-stories/index.html \
RESULT_DIR=/workspace/NEW_PRESET_COMPARISON \
node tests/horror-stories/compatibility.cjs
```

別の端末でHTTPサーバーを起動し、未使用の結果ディレクトリを指定してください。別環境では既存各試験のREADMEに従い、`seaart-r1-save-worktree`、`seaart-horror-validation/old-stage`、第1回baseline等を別ディレクトリに用意します。既存の作業ツリーやfixtureを上書きしません。

33 runnerは旧30 runner＋新3 runnerです。新試験はS01〜S29の29件、タッチ／画面12件、PWA6件です。6プリセットの1〜6コマ（36組合せ）はS05〜S10の内訳であり、重複加算しません。品質チェック10件、18 inline script構文、製品再生成は別に確認します。

`replay.cjs` は既存テストを実行時に読み、対象製品のcache名・明示漫画入口・削除済みモチーフ人物作成ボタンの内部入口を設定します。UC01のカタログ完全一致だけは、承認された72候補追加により適用範囲が変わるため、旧12怪異特徴の射影を比較します。既存の定義・enumが全て不変であることと新72候補の完全一致は `quality.py` が別途照合します。UC02〜UC08の生成関数・全文・保存キーの期待値は変更しません。第2回の元3テストは過去の未回収状態を引き継ぎ、M01〜M14は明示した代替試験です。

候補IDと名称・タグの追加一覧／身体変化・怪異の内訳は `candidate-additions.json`、ストーリーの6段階定義は `src/horror-story-presets.json` を参照してください。

## 再生成

```bash
HORROR_BUILD_HTML=/workspace/UNUSED_BUILD.html python scripts/build-integrated.py
cmp index.html /workspace/UNUSED_BUILD.html
```

生成元の既存モジュールを全て埋め込み、末尾にSTORY_PRESETSを追加します。過去mainを開発製品として使う操作ではありません。
