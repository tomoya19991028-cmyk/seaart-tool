# 怪異タブ：追加独立検証結果

検証日：2026-10-11。総合判定：**条件付き合格**。ローカルの必須検証と追加境界試験はすべて合格し、再現した4種類の不具合を修正した。Android実機・公開originの更新・SeaArt実画像生成は未実施。

**mainへ反映してよい状態か：技術的な前提は満たした。実機未確認等を残す条件付きで可。** 最新mainが下記基点のままであること、残存事項を確認したユーザーの別途承認を前提とする。今回main・Pages・公開PWAの変更は実施していない。公開前のAndroid Chrome実機確認を推奨する。

## GitHub・成果物・作業保護

| 項目 | 確認結果 |
| --- | --- |
| リポジトリ | `tomoya19991028-cmyk/seaart-tool` |
| 対象ブランチ | `feat/horror-tab-manga-draft-integration` |
| 開始時／再取得したmain | `5b5bb03589dcc9a661402395d6c3db20cfd4cf52` |
| 開始時remote HEAD | `be4f7f902d533d85614b3b560946e54c735e213a` |
| 既存報告の製品commit | `6673f871caa8c9611137629d4cd13b7bfc77f8d1` |
| 修正製品commit・GitHub保存確認済みHEAD | `e4660a638988c8a7a2e55eed5fb1b1acb3f33bcd` |
| モチーフ第2回remote HEAD | `7b3f9afd6cf1db20b74359fcf3f14fa4d8101841` |

開始時のworktreeはclean。既存の別worktreeも確認し、製品・source・scriptを `/workspace/seaart-horror-independent-20261011/prework-product/` へ保護した。破壊的reset・clean・過去HTMLへの置換・他ブランチの取込みは実施していない。

既存報告の製品commitと開始HEADのHTMLは、ともに3,887,032 bytes・SHA-256 `2e946f6e68720a4f73bdce7ec1c9266ee277d530289c3d24039cc803101de80d`。報告書との対応を確認してから、その最新コードを検証・修正した。

全最終試験は開始HEADに修正を加えたworking treeで実行した。各`execution.json`に実行時HEAD、試験ソースSHA、製品SHA、時刻、exit codeを記録した。修正製品commitへ保存後、GitHubから全製品bytesを取得し、同じ検証済みSHAであることを確認した。報告書同梱の後続commitは製品を変更しない。最終ブランチHEADは最終回答に記載する。

| 修正製品 | bytes | SHA-256 |
| --- | ---: | --- |
| index.html | 3,888,088 | `9fe8950c1d4ecdd936edf635975aebdad4b01633fb6e498da37644cb1827d33d` |
| sw.js | 2,314 | `5bd6b46a6f41f91b541feb62c0946751b4eab87c081bd6522241c1d549e66c31` |
| manifest.json | 762 | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` |

`integrate-horror.py`＋`embed-horror.py`を隔離ファイルへ実行し、生成HTMLと製品が全bytes一致。CRLF・UTF-8を維持。JavaScriptはHTML内14scriptとSWの構文を確認した。既存テスト・fixture計50ファイルはmainとbyte不変。

## 実行結果

既存PASS資料を読むだけで済ませず、開始HEADで再実行し、修正後の最終HTMLでも再実行した。最終13runnerは全exit code 0で、実行前後のHTML SHAが全て同じ。固定比較もexit code 0。

### T01〜T30：30項目PASS／FAIL 0／未実施0

| 番号 | 再検証内容 | 結果 |
| --- | --- | --- |
| T01 | 怪異未設定の固定全文・12dataset | PASS |
| T02 | normalの怪異抑制・選択保持 | PASS |
| T03 | ID別分離・元データ不変 | PASS |
| T04 | 三値構造・元特徴と追加特徴の分離 | PASS |
| T05 | コマID・payload・RAM画像の追従 | PASS |
| T06 | 隠れたslotのID・固定ONの実強度 | PASS |
| T07 | 変更コマ検出・プレビュー非破壊 | PASS |
| T08 | 変更前の全文・状態・構造・元特徴の固定、依存グループ | PASS |
| T09 | 有効subsetの原子的部分確定 | PASS |
| T10 | 依存変更・候補編集による再確認 | PASS |
| T11 | 下書き永続保存・pagehide・reload・生成無作用 | PASS |
| T12 | 独立Undo・復活ID・30日履歴・期限切れ拒否 | PASS |
| T13 | 非競合3way・同field競合 | PASS |
| T14 | 祖先欠落・同内容no-op・明示競合 | PASS |
| T15 | 削除履歴の30日境界・期限延長防止 | PASS |
| T16 | ゴミ箱の明示復元・古いbackupによる再削除防止 | PASS |
| T17 | 期限切れbackupの保留・救出・非適用 | PASS |
| T18 | 救出後の依存別確認再計算 | PASS |
| T19 | 対応先不明の無期限保持・確定不可 | PASS |
| T20 | 手動mapping・元Refs保持・再確認 | PASS |
| T21 | 継続範囲・端点・内挿入・normal／off・一時演出禁止 | PASS |
| T22 | 漫画全体／コマ別設定と共通identityの分離 | PASS |
| T23 | 7モデル×3分離×単独／複数＝42構成 | PASS |
| T24 | 下書き／ゴミ箱の独立OFF・選択書出し | PASS |
| T25 | 未知schema・重複ID・危険key・不正日時・10MB超 | PASS |
| T26 | 成人条件・生成結果保護・権限非復活 | PASS |
| T27 | 簡易漫画snapshot・全文一致 | PASS |
| T28 | スマホ6viewport・44px操作・重なり防止 | PASS |
| T29 | 旧版4writerと新5キーの共存 | PASS |
| T30 | 実SWでoffline起動・編集・統合・保存・reload・online復帰 | PASS |

### 追加独立検証：50ケースPASS／FAIL 0

| 試験群 | 数と内容 | 結果 |
| --- | --- | --- |
| I01〜I36 | 36状態遷移。保存・部分確定・Undo・画像・統合・移行・実容量・実キー入力 | PASS |
| P01〜P08 | 8構成×7モデル×3分離＝168組。対象別の独立した期待タグ、全文・構造の検査 | PASS |
| U-360/393/430-640/800 | 6画面。3ページ×6カード、8種類のdialog、スクロール、タッチ、入力領域縮小 | PASS |

ケース数、全文比較数、assertionsは別集計。追加プロンプトの観測全文は通常168・漫画168・コマ336を保持した。分離「標準／強い」の通常112組で明示人物・Creatureブロックを検査し、Aの怪異タグがB・Creatureへ入らないことを確認した。「なし」は既存の共有タグ列のため、明示人物ブロックの保証範囲に含めない。resolverの対象別期待値と漫画のコマ／対象別出力は全構成で検査した。

### 第1回・既存機能・PWA回帰

| 試験 | 結果 |
| --- | --- |
| R1 49契約・865 assertions | PASS |
| R1通常210・漫画210・コマ420、固定12dataset | 全文一致・PASS |
| Native通常252・漫画252、既存人物成人21構成 | 全文一致・PASS |
| モチーフ第1回36契約、作成障害8、保存移行8 | PASS |
| モチーフ第1回追加境界20 | PASS |
| 第1回一般取込みの通常21・漫画21・コマ42 | 全文一致・PASS |
| 怪異保存障害14、追加境界20 | PASS |
| 旧PWAからの実SW更新・offline・旧タブ等9ケース | PASS |

固定全文fingerprint：`7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。元expected SHA：`e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832`。原本の書換えはない。

## 重点ケースの根拠

- 保存：settings／working／history／marker／journal／journal refresh、rollback失敗、別writerの介入、削除失敗、encode・validation・render失敗を注入。I29はChrome自身の容量を隔離データで使い切り、実`QuotaExceededError`で保存拒否・元bundle保持を確認した。
- 強制終了相当：I20は実transactionの6中間保存状態を取得し、別contextで起動。前半4地点は変更前、marker確定後2地点は変更後の完全bundleへ復旧した。人物・Creature・漫画・コマID・下書き・ゴミ箱・削除履歴・対応先不明・救出保留が一致。物理電源断の試験ではない。
- 別タブ：I21は実2ページで古いwriterを拒否し、勝った保存をreloadで復元。正常な下書きを失わない。保存途中のwriter介入は14障害試験でも検査した。
- import：実ファイルで旧v3／v4移行、v5の選択下書き／ゴミ箱統合、ローカル未解決・救出保留の維持を確認。File.text待ち中のAPI拒否に加え、実キー入力も止めること、成功／不正JSON／キャンセル／保存失敗後にUIが戻ることを確認した。
- 部分確定：複数特徴・一部選択・定義変更・同特徴競合・依存不足・保存失敗を検査。失敗で他の正常項目が中途半端に書き換わらない。
- Undo：10件上限、複数確定、同項目／別項目編集後、通常編集と部分確定の交互Undo、独立下書きUndo、削除・復元・Undo、reload後の仕様を検査した。
- 画像：canvasから作った実PNGをアプリへ登録し、名前・RGBA画素・配置・コマID・人物・怪異設定を照合。移動、削除、連続Undo、保存失敗、decode完了前の移動・削除を検査した。
- 生成：Aのみ／Bのみ／異なるA・B／人物とCreature／一部コマnormal／コマ例外／強度・重み／keep・replace・excludeを検査。元データは不変。SeaArtでの実画像生成品質をこの結果で保証しない。

## 発見した不具合と既存報告との差異

| ID | 修正前の再現 | 試験 | 状態 |
| --- | --- | --- | --- |
| B01 | 10件時のreceipt Undoで残り9件が8件になる | I01 | 修正済み |
| B02 | working Undo書込失敗でRAM・履歴・画像が先に戻りdiskと不一致 | I10／I19／I31／I32 | 修正済み |
| B03 | PNG decode中にコマを移動／削除すると別コマへ割当て | I11／I12 | 修正済み |
| B04 | JSON読込待ち中、フォーカス済み通常欄に実キー入力できる | I34 | 修正済み |

既存のT05・T08・T12・読込guardのPASSは、これらの追加経路まで網羅していなかった。特にAPIの編集拒否だけでは通常入力欄を保護できない。既存PASSを全操作へ一般化せず、再現試験を先に作って原因を確認し、必要最小限の修正後に必須回帰を再実行した。詳細は[追加修正履歴](REPORT_怪異タブ_追加修正履歴.md)。

最初のローカルサーバー不在による接続失敗と、新規試験側のselector・helper・fixture指定ミスは製品不具合と区別した。途中版の試験は新しいB04確認後に停止し、最終版で全再実行した。失敗・中断資料も保持し、最終PASSで上書きしていない。

## 保存互換性・仕様の境界

保存は既存のv5・horror-v1の5キーを維持する。旧v3／v4キーを削除せず、旧writerが新5キーを変更しないことを実確認。破損・未確定の新bundleから旧保存へ黙って退避・初期化しない。保存失敗を成功扱いせず、rollback不能ではjournalとデータを保持して復旧へ進む。

名前付き保存・履歴・JSONと、確定設定／下書きworkspaceの分離を維持。選択exportは選んだ下書き・ゴミ箱と関係する削除情報を同梱する。救出保留はローカル永続保存で保持し、通常の選択exportへ全件自動同梱する仕様ではない。復旧資料の書出し経路は別にある。

画像と画像配置、両Undo履歴はsession限定。reload後は画像を再選択し、配置を再設定する。Undoは最大10件で、永続Undo情報を作らない。確定receipt・コマID・下書き等の保存設定はreload後も保持する。画像blobをJSONへ保存する新機能は追加していない。

1,000項目追加後、全1,010項目がreloadで一致。最終試行の保存は約1,816ms、依存照合約100ms、workspace約625KB、bundle約1.07MB、journal二重化見積り約2.37MB。並列検証中の模擬データの実測であり、スマホの速度・保存容量の保証ではない。

## スマホ・PWA・公開不変

360／393／430 × 640／800の6viewportをタッチ模擬で検証。第6タブ、横スクロール、3ページ6カード、44px主要ボタン、dialog内部スクロール、下書き・ゴミ箱・競合・手動mapping、閉じる／キャンセルを確認した。高さ380pxへの縮小はキーボード領域の模擬であり、実IME試験ではない。

SWのcache名は既存怪異ブランチの`seaart-tool-pwa-v5-horror-v1-http-cache-v1`。今回SWは変更しない。実SWで初回online、更新、旧cache保持、通知、旧タブ非強制reload、offline起動・下書き編集・保存・reload・online復帰、保存維持を確認。公開originでは更新試験をしない。

GitHub Pagesは引き続きlegacy build、source `main:/`、最終build commit `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`、built、更新時刻 `2026-10-11T06:09:16Z`。修正製品push後も下記のHTTP・全bytes・SHAは作業前と同じ。HTTP読取りだけで、公開ブラウザのSW登録・更新は行っていない。

| 公開path | HTTP | bytes | SHA-256 |
| --- | ---: | ---: | --- |
| / および /index.html | 200 | 3,775,550 | `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72` |
| /sw.js | 200 | 2,320 | `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a` |
| /manifest.json | 200 | 762 | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` |

## 未実施・残存事項と次の操作

- Android実機、日本語IME、OSの画像選択、端末PWA再起動・バックグラウンド復帰は未実施。端末の保存データをバックアップしたとは主張しない。
- 公開originでの怪異PWA更新・受入は未実施。今回は禁止範囲である。
- SeaArt実画像の品質・特徴分離は未実施。確認したのはツールのプロンプト構造・全文である。
- モチーフ第2回は未統合。共通基点は同じだが、HTML末尾競合、v5保存・元特徴依存・再取込みUndoの交差検証が必要。第2回専用テスト3ファイルと元手順の未回収も確認した。今回その試験をPASS扱いしない。

未解決の再現製品不具合は0。main反映・公開は未実行。公開前は[実機チェックリスト](CHECKLIST_怪異タブ_スマホ実機確認.md)で確認し、利用者自身でJSONバックアップの保存先を確かめる。両機能統合は[統合影響報告](REPORT_怪異タブ_モチーフ人物統合影響.md)の別計画で行う。

## 証跡

[集計](validation/horror-independent/summary.json)、[remote製品照合](validation/horror-independent/remote-product.json)、[公開不変](validation/horror-independent/public-unchanged.json)、[製品同一性](validation/horror-independent/identity/product-complete.json)、[元50ファイル](validation/horror-independent/identity/original-tests.json)。全文はgzipで保存し、圧縮前後のbytes一致を確認した。最終結果・実行log・失敗／中断原記録への対応は[証跡README](validation/horror-independent/README.md)。再実行手順は[追加検証README](tests/horror/README-independent.md)。
