# 怪異自動特徴・構造・スマホUIの検証

基準は `cf0336d03e3edf104fdaa911b9bc568a3609bf50`。既存151テスト／fixtureは変更しない。実利用者の保存データは使わず、独立ブラウザの模擬データだけを使用する。

## 実行

```bash
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
# 別ターミナル、製品worktreeに移動して実行。結果ディレクトリは毎回新規。
TARGET_URL=http://127.0.0.1:8765/seaart-horror-auto/index.html \
  python tests/horror-auto/run-regressions.py /workspace/horror-auto-audit/new-run
python tests/horror-auto/verify-results.py /workspace/horror-auto-audit/new-run
python tests/horror-auto/quality.py
HORROR_BUILD_HTML=/workspace/horror-auto-audit/new-generated.html python scripts/build-integrated.py
cmp index.html /workspace/horror-auto-audit/new-generated.html
```

必要: Node.js、Playwright、`/usr/bin/chromium`、Python、Git履歴、旧固定baseline。`BASELINE_URL`／`BASELINE_DIR`でR1固定baselineの場所を設定可能。Version 4の全文比較は `OLD_VERSION_URL`（既定 `/seaart-horror-stories/index.html`）を使用。PWA試験はlocalhostの独立portを使う。並列数は `TEST_WORKERS`、メモリ上限の起動制御を維持する。

## 今回の追加試験

- `contracts.cjs`: A01〜A31。自動特徴・状態・36構造対応・72非生成条件・手動優先・競合・対象分離・コマ・下書き・Undo・書込5段階障害・JSON・reload・別タブ・作成導線。
- `inherited.cjs`: AH01／02。コマの×と自動ON/OFFが継承中の除外を維持。
- `shared-prompt.cjs`: AP01。同じ派生身体の同重み固定で漫画共通外見・全文・順序を維持。
- `fixed.cjs`: AF01〜AF03。基本変更前の自動外見固定、手動固定と新自動の身体競合、自動OFF時の固定身体同士の競合。
- `shared-ui.cjs`: AS01。必要な共有確認の後もコンパクト候補画面を維持。
- `ui.cjs`: 12画面条件。縦6／横3／文字150％相当3。直接操作、タップ領域、タグ解除Undo、★／詳細、英語表示、スクロール保持、コマ固定Save。
- `pwa.cjs`: Version 4→今回のSW更新・通知・未保存入力・旧保存・オフライン編集／保存／reload／復帰・HTML取得失敗時の旧キャッシュ保持。公開originでは試験しない。
- `compatibility.cjs`: 自動未設定の旧Version 4との36通常／36漫画／144コマ全文およびresolverの厳密比較。
- `quality.py`: 既存84候補・6×14・50派生定義・既存生成／モチーフ／UIソース・6プリセット・SW名のみの変更・151テスト原本保護など12検査。

## 既存試験

旧33 runner／498評価をそのまま再実行する。`replay.cjs`は既存テスト原本を変更せず、実行時の製品URL・承認済みUI入口・今回のSW cache名だけを合わせる。旧UC01は過去12候補の厳密投影を維持し、追加済み84候補全件はS01と新版qualityで検査する。旧story PWAのcache名も今回の名へ実行時置換する。旧T28の状態ダイアログは保持したlegacy backendから開く（実タップの新入口は追加UI試験）。旧独立UIのcard geometryは、新しい非操作見出しではなく6カードのcontainerを参照する。header/footer等の実ボタン44px条件は維持し、新直接操作の44pxは追加UI12で検査する。expected／fixture／固定プロンプトは書き換えない。

過去 `tests/horror-stories/quality.py` の「旧foundation完全一致」「旧cache名」という実装固定条件は今回の承認された変更と一致しないため、今回の合否条件には使用しない。候補・保存互換性・生成処理・cache名以外のSW不変は今回のquality／保存障害／全文比較で検査する。旧ファイル自体は保護する。

元のモチーフ第2回専用3テストと原手順は以前から未回収。保存済みの独立代替テストを再実行する。原本のPASSとは報告しない。

Android実機、実キーボード、SeaArt画像品質は自動ブラウザ試験の対象外。チェックリストで別途確認する。
