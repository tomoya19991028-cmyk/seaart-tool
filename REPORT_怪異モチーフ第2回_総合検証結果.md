# 怪異＋モチーフ第2回：総合検証結果

**条件付き合格。** 作成済みの自動検証19runnerは全exit 0、集計329ケースはPASS 329／FAIL 0／未実施0。Android実機・実IME／OS画像選択・SeaArt実画像品質・公開origin更新は未実施の4区分。第2回の元テスト3ファイル・元手順は未回収であり、原本のPASSとは報告しない。

技術判定：統合製品をレビューしてmainへ反映する技術的前提を満たした。実機等の未検証範囲を確認し、最新mainの再取得と別途承認を経る必要がある。今回main・公開PWAへの反映は実行していない。

## 対象・記録

統合製品commit `f1de74cb99d2d4e89c5be36aaa65e2a2cea40405`、HTML SHA-256 `3525ec8b2e856928031198b80505310393c6d796533e9b9e8a07b9516d04d24e`。main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`、怪異 `f58be6a37c2b407b86afbaa226a79a0a10a9c562`、第2回 `7b3f9afd6cf1db20b74359fcf3f14fa4d8101841`を再取得して検証した。

試験はmerge未commitのworking treeで実行したため、各executionのgitHEADは怪異HEADを示す。実行前後の製品SHAは全19runnerで同じ。後で同じbytesを上記merge commitへ保存し、remoteから再取得した。expectedを更新した結果ではない。

## ケース集計

契約、操作ケース、viewport、既存成人構成、PWA確認点を次表の粒度で数える。865 assertions、198候補入力、全文の組数を加算せず、T01〜T30の要件集計も重ねて加算しない。

| 実行群 | 数 | 結果 |
| --- | ---: | --- |
| 怪異T02〜T26 | 25 | PASS |
| 保存障害 | 14 | PASS |
| R1契約 | 49／865 assertions | PASS |
| 既存人物成人構成 | 21 | PASS |
| 怪異追加境界 | 20 | PASS |
| モチーフ第1回36＋作成障害8＋保存移行8 | 52 | PASS |
| 第1回追加境界 | 20 | PASS |
| 簡易漫画snapshot＋怪異スマホ6viewport | 7 | PASS |
| 怪異追加UI6viewport | 6 | PASS |
| 旧4writer＋offline4確認点 | 8 | PASS |
| 実SW更新回帰 | 9 | PASS |
| I01〜I36 | 36 | PASS |
| 怪異P01〜P08 | 8 | PASS |
| 実作成したモチーフ人物版P01〜P08 | 8 | PASS |
| 両機能UI6viewport | 6 | PASS |
| 旧怪異→統合PWA・offline確認点 | 7 | PASS |
| 第2回独立代替M01〜M14 | 14 | PASS |
| 統合操作Z01〜Z18 | 18 | PASS |
| 元固定baseline／dataset／raw producer／構文 | 1 | PASS |
| 合計 | **329** | **全PASS** |

T01は固定R1全文・12dataset、T02〜T26は25契約、T27は簡易漫画全文、T28は6viewport、T29は旧4writer、T30は実offline lifecycleで確認した。**必須T01〜T30の30項目は全PASS**。

## 全文・dataset・生成

| 比較 | 通常 | 漫画 | コマ | 結果 |
| --- | ---: | ---: | ---: | --- |
| R1固定 | 210 | 210 | 420 | 全文一致 |
| Native既存 | 252 | 252 | 別集計なし | 全文一致 |
| モチーフ第1回一般外見 | 21 | 21 | 42 | 全文一致 |
| 第2回拡張一般外見 | 21 | 21 | 42 | 第2回保存製品・同一外見通常人物と全文一致 |
| 構成数合計 | 504 | 504 | 504 | 全一致 |

第2回による承認済み衣装等の変化を、怪異OFFの既存生成に対する意図しない変化と区別した。第2回の対象にならない既存構成は固定main/R1で不変、一般外見をコピーした構成は第2回製品・同一外見の通常人物と比較した。

固定全文fingerprint `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`、元expected SHA `e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832`。12datasetとraw `generate`／`generateManga` bodiesは不変。14 inline script・SWと追加cjsの構文、UTF-8・CRLF、diff checkを確認。元テスト50ファイルおよび怪異原本は不変。

怪異プロンプト8構成とモチーフ版8構成は各168組（7モデル×3分離）。各群に通常168・漫画168・コマ336の観測全文を保存し、独立した期待タグと人物／Creature／コマブロックを検査した。通常の標準／強い112組で、Aの怪異タグがB・Creatureに入らない。分離「なし」は既存の共有列のため明示ブロックの保証対象外。normalコマ、局所例外、強度・重み、keep／replace／exclude、元データ不変も確認した。SeaArt実画像の品質を保証する試験ではない。

## 第2回代替・統合の重点結果

- M01〜M08：対応表の198行とID／value／日本語名／分類を照合。65／34／25／17／9／20／28の全候補で計画と実再取込み、UUID・metadata・元Creature・deniedを検査した。198入力は上記14群の内訳で、ケース合計へ重複加算しない。
- M09〜M13：項目ON/OFF、色OFFの保持、色ONの対象限定、非表示／編集／重複／所有者／未知／自由入力、理由表示、プレビュー・確認解除・取消、通常人物拒否、古い元／対象、空選択を検査。
- Z01〜Z18：読込中拒否、再取込み後の確認失効、5キー・描画・stale失敗、作成rollback、receipt／通常／下書きUndo交差、10件上限、部分確定保持、実PNG decode＋再取込み＋コマ移動、名前付き保存／履歴／reload、実旧第2回v4 migration、実JSON、実2タブ、Undo失敗、対象分離、原特徴policy、rollback不能のjournal復旧、孤立／救出保留／ゴミ箱を検査。
- I01〜I36を統合製品で再実行し、B01〜B04の再発がないことを確認。実Chrome容量超過、6中間保存状態からの復旧、非同期画像削除、1〜6コマ、画像・配置session仕様もPASS。

## 初回FAIL・修正・残存事項

単純同居状態で2件を再現し修正した：読込中作成経路のguard欠落、再取込みによる元外見依存の確認失効欠落。詳細は[修正履歴](REPORT_怪異モチーフ第2回_修正履歴.md)。未解決の再現製品不具合は0。

新規試験側の表現モード準備、古い候補重み、定数への代入、英語タグ、日本語名、PWA下書き未確認のfixture指定ミスは製品不具合と区別して修正した。最初の結果・修正前red・途中結果を保持し、最終PASSで上書きしていない。

第2回元テスト3件・元手順はremote tree、全取得Git履歴／objects、利用可能な添付・workspaceを調べたが未回収。M群・Z群等は明示した代替であり、元48契約／元7障害の再実行を装わない。Android実機・実IME／OS picker、SeaArt実画像、公開origin更新は未実施。公開origin更新は禁止範囲。

## main反映前

利用者自身でJSONバックアップの場所・内容を確認し、[Androidチェックリスト](CHECKLIST_怪異モチーフ第2回_Android実機確認.md)に沿った実機確認を推奨する。レビュー後、mainと統合branchを再取得し、この基点から変わっていれば差分確認・必要な再検証を行う。main・公開は別途承認後の工程で、今回のPASSによる自動反映は行わない。

証跡：[集計](validation/horror-motif-integration/summary.json)、[最終結果・失敗記録](validation/horror-motif-integration/README.md)、[再実行](tests/integration/README.md)。
