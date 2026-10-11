# 怪異＋モチーフ人物第2回の統合検証

統合基準は取得したremoteの怪異 `f58be6a37c2b407b86afbaa226a79a0a10a9c562` と第2回 `7b3f9afd6cf1db20b74359fcf3f14fa4d8101841`、共通基点main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。元の第2回テスト3件・元手順はGit履歴、remote tree、利用可能な添付・workspaceに見つからず、ここでは代替検証を明記する。元の48契約の復元・再実行を装わない。

## 準備・再実行

Node・Playwright・`/usr/bin/chromium`・日本語フォントが必要。旧製品fixtureは[怪異の元手順](../horror/README.md)と[独立検証手順](../horror/README-independent.md)のcommitから別パスに準備する。作業製品へ古いHTMLをコピーしない。main／公開originへ試験データを送らない。

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

別端末で統合repoから実行する。既存の結果ディレクトリを使わない。

```sh
export TARGET_URL=http://127.0.0.1:8765/seaart-integrated/index.html
export BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html
export INTEGRATION_RESULTS=/workspace/seaart-integrated-new-verification

RESULT_DIR="$INTEGRATION_RESULTS/round2" node tests/integration/motif-round2-alternative.cjs
RESULT_DIR="$INTEGRATION_RESULTS/integration" node tests/integration/horror-motif.cjs
RESULT_DIR="$INTEGRATION_RESULTS/motif-prompts" node tests/integration/motif-prompts.cjs
RESULT_DIR="$INTEGRATION_RESULTS/ui" node tests/integration/ui.cjs
RESULT_DIR="$INTEGRATION_RESULTS/pwa" node tests/integration/pwa.cjs
```

M01〜M14は独立代替。対応表は保存済み承認資料の198行をそのままJSONへ写したもの。M02〜M08で198候補の実再取込み・UUID／metadata／元Creatureを検証。M09〜M13はON/OFF、色、除外理由、プレビュー、拒否境界。M14は第2回保存製品と手動人物の通常21／漫画21／コマ42を比較する。比較する二つの製品HTMLを編集して合わせない。

Z01〜Z18は両機能の操作順、v5保存失敗、独立Undo、確認失効、実PNG decode、名前付き保存／履歴／JSON、旧第2回v4 writer、別タブ、rollback不能からの復旧、孤立・救出保留を検証。`TEST_IDS=Z01,Z02`または`TEST_IDS=M11,M12`で診断対象を限定できる。限定実行を全群のPASSとして扱わない。

`motif-prompts.cjs`は既存P01〜P08の期待タグと人物ブロックassertionsを保持し、入力人物だけを実APIで作った第2回人物へ置換する。fixtureのUUIDのみ固定し、許可条件は変えない。8構成×7モデル×3分離＝168組（通常168、漫画168、コマ336）。分離「なし」は共有列のため、通常の明示ブロック検査は標準／強い112組。実際のSeaArt画像品質は試験していない。

UIは6viewport、作成・全11取込みグループ・再取込み・確認解除・取消・怪異3ページ×6カードを検証。高さ380pxはキーボード領域の模擬で、Android実IMEではない。PWAは127.0.0.1:8786で旧怪異SWから統合SWへの更新、旧タブ維持、両機能のoffline保存・reload・online復帰を実検証する。8786を空けてから実行する。

## 必須回帰

[怪異元手順](../horror/README.md)の全群、I01〜I36、P01〜P08、追加UI6画面、R1／固定／Native／既存成人／モチーフ第1回を再実行する。T29/T30と旧PWA9についてはimmutableな元テストのURL／新cache名だけをメモリ上で統合対象へ向ける。

```sh
RESULT_DIR="$INTEGRATION_RESULTS/horror-pwa" node tests/integration/replay.cjs tests/horror/pwa.cjs
RESULT_DIR="$INTEGRATION_RESULTS/pwa-regression" node tests/integration/replay.cjs tests/horror/replay-pwa.cjs
```

このwrapperはexpected・assertions・fixtureを編集しない。PWA用8784／8782も空ける。各群のstdout・stderr・開始終了時刻・exit code・製品SHA・試験ソースSHAを記録し、異なる試行を別パスへ残す。

## ソースとHTML

生成順は承認済み共通基点→第2回source→怪異保存／ID基盤→怪異runtime。製品を直接上書きしない再生成例：

```sh
HORROR_BUILD_HTML=/workspace/seaart-integrated-new-build/index.html python scripts/build-integrated.py
cmp index.html /workspace/seaart-integrated-new-build/index.html
```

`build-integrated.py`は既存出力・製品そのものへの書込みを拒否する。`embed-motif-person.py`、`integrate-horror.py`、`embed-horror.py`を順に実行し、CRLFを維持する。末尾だけをmergeして第2回sourceを失う再生成は行わない。SWはcache名のみを統合専用の一意名へ変更する。main・Pages・公開PWAはこの手順では変更しない。
