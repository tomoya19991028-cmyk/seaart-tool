# 追加独立検証の再実行

最新remoteを取得し、作業ツリーと未commit変更を確認・保護したうえで、怪異専用ブランチを対象にする。main・公開PWAを変更しない。既存原本・expected・失敗記録を変更しない。

## 環境

Node、Playwright、`/usr/bin/chromium`、日本語フォントを使用。以下の読み取り専用fixtureは元の [README.md](README.md) と同じ。HTMLと製品6ファイルを別パスへ用意し、作業製品へ古いHTMLをコピーしない。

- `/workspace/seaart-creature-motif-integration1/baseline`：main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`
- `/workspace/seaart-r1-save-worktree`：`326b4e482f17d4bd94605696ed2e3fdda30b43d0`
- `/workspace/seaart-horror-validation/old-stage`：`ee5b64a`
- `/workspace/seaart-tool`：モチーフ第2回 `7b3f9afd6cf1db20b74359fcf3f14fa4d8101841`

検証サーバーは先に起動し、HTTP 200を確認してからテストする。

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

別端末で、未使用の出力先を設定する。以下は再実行専用の例で、今回の原記録を上書きしない。

```sh
export AUDIT_OUTPUT=/workspace/horror-independent-new-run
export TARGET_URL=http://127.0.0.1:8765/seaart-horror/index.html
export BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html
mkdir -p "$AUDIT_OUTPUT"

RESULT_DIR="$AUDIT_OUTPUT/edges" node tests/horror/independent-edges.cjs
RESULT_DIR="$AUDIT_OUTPUT/prompts" node tests/horror/independent-prompts.cjs
RESULT_DIR="$AUDIT_OUTPUT/ui-extra" node tests/horror/independent-ui.cjs
```

`independent-edges.cjs` はI01〜I36。`TEST_IDS=I01,I10,I11,I12,I19` で対象を限定できる。既存のT01〜T30とは別番号。

| 番号 | 主な検証 |
| --- | --- |
| I01〜I04 | 10件上限、繰返し部分確定、別設定／下書き編集後のUndo |
| I05〜I07 | 定義変更、同項目競合、複数項目確定失敗の完全rollback |
| I08〜I12 | 実PNGの画素、コマ移動／削除／Undo、保存失敗、非同期読込中の移動・削除 |
| I13〜I15 | 隠れたslot保護、統合プレビュー後の変更、ID不明→手動対応付け→再確認 |
| I16〜I19 | reloadのsession Undo仕様、復元後Undo、選択JSON、基本設定Undo失敗 |
| I20 | 実際の6中間保存状態を別contextで起動。旧／新の一式へ復旧し、各種下書き・履歴を照合 |
| I21〜I24 | 実2タブ競合、実ファイルimport、1〜6コマとreset、実旧v3／v4 writerから移行 |
| I25〜I28 | receipt Undo保存失敗、同特徴編集との競合、独立Undo10件、画像・配置のRAM限定仕様 |
| I34〜I36 | フォーカス済み通常入力欄の読込中編集、成功／不正JSON／キャンセル／保存失敗後のUIロック解除 |
| I31〜I33 | 通常の画風変更後／怪異なしのworking Undo保存失敗、画風Undoとreceipt Undoの連続操作 |
| I29〜I30 | ブラウザの実容量を模擬データで使い切る試験、実File.text待ち中の編集拒否 |

I20は強制終了後に残り得る保存bytesを再起動する模擬試験で、OS電源断そのものの試験ではない。I29は完全に隔離されたcontextだけで実行し、利用者データや既存originへ向けない。画像はcanvasから作った実PNGをアプリのfile inputへ読み込み、画素とID対応を比較する。reload後に画像・配置を自動復元する新機能は追加していない。

プロンプト試験は8構成×7モデル×3分離指定の168組（通常168、漫画168、コマ336）。全文を観測記録として保存する。これはexpectedの再生成ではない。分離「なし」は既存の共有タグ列を維持するため、通常画像の明示人物ブロック検証は「標準／強い」の112組。resolverの人物別特徴と漫画のID対応は全構成で確認する。SeaArtでの画像生成品質を試験したものではない。

UI追加試験は6viewport、3ページ各6カード、8種類のダイアログ、タッチ操作、内部スクロール、キャンセル、高さ380pxでの入力欄・閉じる操作。高さ変更はキーボード表示領域の模擬であり、Androidの本物の日本語IME検証ではない。

## 既存回帰と製品同一性

元のREADMEのT01〜T30、保存障害14、追加境界20、R1、固定比較、Native、モチーフ第1回、PWA9を再実行する。PWA用8784・旧PWA回帰用8782を確保する。

固定比較の出力先にはread-onlyの`baseline`を用意し、今回観測したR1全文を`CURRENT_RESULTS`で指定する。旧expectedは変更しない。`integrate-horror.py`と`embed-horror.py`を`HORROR_BUILD_HTML`指定の隔離ファイルへ実行し、現製品と全bytes一致することも確認する。製品を古い基点で上書きしない。

結果・stdout・stderrは試行ごとに別ディレクトリへ保持する。検証サーバー不在、テスト用selectorや比較対象の指定ミスも初回記録を消さず、製品不具合と区別して報告する。最終成功結果だけを根拠に初回FAILを隠さない。
