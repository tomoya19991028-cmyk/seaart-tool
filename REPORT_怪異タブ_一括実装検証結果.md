# 怪異タブ・漫画連携・下書き管理：一括実装検証結果

2026-10-11 UTC。Q1〜Q12と初期候補案へのユーザー承認に基づきH1〜H8を実装し、T01〜T30と既存回帰に合格。専用ブランチ `feat/horror-tab-manga-draft-integration`。mainへの反映・公開PWA更新は別承認待ち。

## 1. 基点・保護・承認

GitHub最新main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52` は添付5資料の基点と一致。基点HTMLのSHA-256は `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72`。原本5件・H0調査・[承認記録](docs/horror/承認記録.json)・[初期候補案](docs/horror/PROPOSAL_Q7_初期候補.md)を保存した。

前の第2回Creatureモチーフ人物成果物は別worktree／別ブランチで保護し、今回の基点へ混ぜていない。破壊的reset／cleanや旧HTMLによる上書きは行っていない。資料の工程別承認／H0限定は、今回の連続実装指示と初回承認を優先した。初期候補は種類6・特徴12の承認案を採用し、種別からタグや構造を自動追加しない。

## 2. 実装した機能・各工程

| 工程 | 実装内容 | 結果 |
| --- | --- | --- |
| H1 | 保存v5／独立5キー、旧reader、新manga／panel ID、journal rollback | 完了 |
| H2 | ID別resolver、種類6／特徴12、三値構造、元特徴と追加特徴、排他・適用条件 | 完了 |
| H3 | 第6タブ、3ページ×6カード、独立Creature、自由入力人物の明示複製 | 完了 |
| H4 | 通常生成の対象別overlay、normal抑制、全生成操作の競合中止、結果保護 | 完了 |
| H5 | 通常漫画1〜6、コマ例外／範囲、共通identity分離、IDにpayload／RAM画像を追従 | 完了 |
| H6 | durable下書き、差分確認、変更前snapshot固定、依存グループ、原子的部分確定、独立Undo | 完了 |
| H7 | 3way統合／競合確認、30日削除履歴、ゴミ箱、期限切れ救出／保留、手動mapping | 完了 |
| H8 | T01〜T30、固定全文、障害注入、6viewport、実SW offline、最終修正 | 完了 |

固定ONは強度・重みの実値を保持する。基本変更前固定では状態・構造・元特徴policyも必要なfieldだけ保持する。内部 `fixedFacets`／タグなしmetadataは既存怪異設定の固定用で、正の初期候補12件や生成タグを増やさない。同じコマの依存する固定項目はまとめて確認・確定する。

## 3. 変更ファイル

製品は `index.html` と `sw.js`。SWはcache名のみ変更。manifest・icon3件・既存候補data・既存テスト原本50ファイル／固定expectedは不変。

sourceは `src/horror-foundation.js`・`src/horror-runtime.js`・`src/horror-catalog.json`、埋込み手順は `scripts/integrate-horror.py`・`scripts/embed-horror.py`。新規試験は `tests/horror/` の7スクリプトとREADME。資料は `docs/horror/`、検証記録は `validation/horror/`、本報告を保存した。一時JSONや不要な巨大ログ・認証情報はcommit対象へ入れない。

## 4. T01〜T30

隔離Chromium、ローカルHTTP、模擬保存データで検証。全件PASS。[個別結果と根拠](validation/horror/T01-T30.json)。

| 試験 | 検証対象 | 結果 |
| --- | --- | --- |
| T01 | 怪異未設定：固定全文・12dataset | PASS |
| T02 | normal：怪異抑制・選択保持 | PASS |
| T03 | 対象ID別分離・元データ不変 | PASS |
| T04 | 三値構造・元特徴／追加特徴の分離 | PASS |
| T05 | コマID・全payload・RAM画像の追従 | PASS |
| T06 | hidden slot ID・固定ON実強度維持 | PASS |
| T07 | 変更コマの検出・プレビュー非破壊 | PASS |
| T08 | 変更前全文固定・状態／構造／元特徴・依存グループ | PASS |
| T09 | 有効subsetの原子的部分確定 | PASS |
| T10 | 依存変更／候補編集による再確認 | PASS |
| T11 | 下書き永続保存・pagehide・reload・生成無作用 | PASS |
| T12 | 独立Undo・削除復活ID・30日履歴・期限切れ拒否 | PASS |
| T13 | 3way非競合統合・同field競合 | PASS |
| T14 | ancestor欠落：同内容no-op／明示競合 | PASS |
| T15 | tombstone：30日境界・期限延長防止 | PASS |
| T16 | trash：明示復元・古backup再削除防止 | PASS |
| T17 | 期限切れbackup：保留・救出・非適用 | PASS |
| T18 | 救出：依存ごとの確認再計算 | PASS |
| T19 | 対応先不明：無期限保持・確定不可 | PASS |
| T20 | 手動mapping：元Refs維持・再確認 | PASS |
| T21 | range：端点・内挿入・normal／off・transient禁止 | PASS |
| T22 | 漫画全体／コマ別：共通identityへの変化混入防止 | PASS |
| T23 | 7モデル×3分離×単独／複数＝42構成 | PASS |
| T24 | draft／trashの独立OFF・選択書出し | PASS |
| T25 | 未知schema・重複ID・危険key・不正日時・10MB超 | PASS |
| T26 | 成人条件・生成結果保護・権限非復活 | PASS |
| T27 | 簡易漫画：固定snapshot／全文一致 | PASS |
| T28 | スマホ6viewport・44px操作・重なり防止 | PASS |
| T29 | 旧版4writerと新5キーの共存 | PASS |
| T30 | 実SW：offline起動／編集／統合／保存／reload／online復帰 | PASS |

追加で、保存先5キー／journal refresh／容量／encode／validate／render／別タブ／rollback失敗／journal削除失敗の14障害ケースに合格。rollback不能時はjournalと旧データを保持し編集を止め、reload救済・exportを可能にする。読込中guardを含む20境界項目に合格。[障害](validation/horror/faults.json)・[境界](validation/horror/boundaries.json)。

## 5. 既存生成・機能の回帰

| 試験 | 結果 |
| --- | --- |
| R1 49契約／865 assertions | PASS |
| R1通常210・漫画210・コマ420の全文／12dataset deep比較 | PASS、固定expected同一 |
| 第1回36契約・作成障害8・保存移行8・21構成比較 | PASS |
| 第1回追加境界20契約 | PASS |
| Native通常252・漫画252、既存人物成人21構成 | PASS、全文同一 |
| 簡易漫画snapshot／Positive／Negative | PASS |
| 元generate／generateManga body、UTF-8／CRLF、14 inline scripts＋SW構文 | PASS |
| 基点から隔離再生成したHTMLとの全bytes比較 | PASS |

固定出力fingerprintは `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。原本fixtureのSHA-256 `e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832` を維持。[固定比較](validation/horror/fixed-comparison.json)・[全文gzip](validation/horror/r1-fulltext.json.gz)・[Native全文gzip](validation/horror/legacy-fulltext.json.gz)。

## 6. 保存形式・旧データ互換性

root/settings v5、working/history v2、marker v1／journal v2、horror/workspace v1。namespaceは `creature-adult-v1/result-access-v1/motif-person-v1/horror-v1`。actorExtensions v4・adult v1・humanProfile v1・actorFormCatalog v1は維持。[新5キーとschema](validation/horror/storage-compatibility.json)。

旧v3/v4 readerとlegacy読込を維持し旧キーを削除しない。破損新bundleから旧bundleへ自動退避しない。下書き・trash・削除履歴・対応先不明・救出保留を保持する。名前付き保存は確定設定を先に復元し、選択同梱workspaceは統合確認へ進む。履歴／通常Undoではworkspaceを巻き戻さない。Undoはsession内10件で永続Undoは初期範囲外。削除Undoも新incarnation／明示復元logと元期限を保持する。

JSON import上限10MB。1,000項目追加後の保存は約440.8ms、1,000項目の依存照合は約67.5ms、workspace 625,225 bytes、settings＋working＋history 1,069,594 bytes。journal二重化見積り 2,371,523 bytes。全1,010項目がreload後も一致。模擬データとこの環境の実測で、実機の速度や容量保証ではない。1,000件で注意表示し、hard件数制限や有効データ自動削除は追加していない。

## 7. 成人制限・PWA・オフライン

本番Creature成人定義0・許可0を維持。独立怪異／保存／reload／import／historyから許可を復活させない。既存人物成人処理・result protectionは固定回帰で維持した。

SWの新cache名は `seaart-tool-pwa-v5-horror-v1-http-cache-v1`。network-first・HTML失敗時の旧cache保持・offline起動・未保存draft保持・旧タブ非強制reload・更新通知を9ケースで確認。旧版4writerの新5キー非破壊を確認。実SWでofflineの起動・下書き編集／確認／部分確定・trash復元・統合・保存・reload・再online復帰を確認した。公開サイトでの試験は行っていない。

## 8. GitHubブランチ・commit・製品同一性

専用ブランチ：`feat/horror-tab-manga-draft-integration`。製品最終commit：`6673f871caa8c9611137629d4cd13b7bfc77f8d1`。実装checkpointは `09c225b`、固定値補正 `0cbd08e`、読込guard `c4cdc78`、削除Undo補正 `6673f87`。報告・検証資料のcommitは製品commitの後続に置く。

| 製品 | bytes | SHA-256 |
| --- | ---: | --- |
| index.html | 3,887,032 | 2e946f6e68720a4f73bdce7ec1c9266ee277d530289c3d24039cc803101de80d |
| sw.js | 2,314 | 5bd6b46a6f41f91b541feb62c0946751b4eab87c081bd6522241c1d549e66c31 |
| manifest.json | 762 | d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f |

[全製品・source・保護した原本の同一性](validation/horror/product-identity.json)。専用ブランチへ通常pushし、remote HEAD `cd681362f4e13f26bd074e44000e07aa7247aa07` をgit fetch／ls-remote／GitHub APIで確認済み。GitHubから再取得したHTML・SW・manifestの全bytes／SHA-256と、Git treeのicon3件がローカル検証済み製品に一致した。[保存監査](validation/horror/remote-verification.json)。main HEADとPages buildは基点のまま。保存監査を含む後続commitも同じ製品bytesを保持し、最終remote HEADは最終回答で報告する。

## 9. 失敗記録・未解決事項

一時演出の脱落、固定ONの強度追従、async import中の保存skip、削除Undoによる履歴巻戻しを修正し、再現試験を追加して合格した。新規試験の10件Undo上限の誤ったassertionも修正した。失敗原本を再生成・消去せず別ディレクトリで保持し、[必要な失敗記録と修正](validation/horror/failures/README.md)を同梱した。既存expectedの書換えはない。

実施した試験に未解決の失敗はない。main反映・公開PWA更新は今回の未実施工程として別承認を待つ。

## 10. 実機未検証・main反映前の注意

実利用者のスマホ本体／既存保存データ、iOS Safari・Android Chrome実機、公開originの更新と保存容量は未検証。実機保存データをバックアップしたとは主張しない。6viewportはLinux Chromiumのtouch模擬試験。

main反映を承認された際は最新mainとの差分を再確認し、この製品SHAと保存namespaceを照合してから統合する。未統合の第2回モチーフ人物ブランチは別の変更なので、必要なら別途競合・全回帰を検証する。Pages配信bytes／SHA・公開PWA受入試験は、その時点で実施する。現在のPages sourceはmain `/`、最新buildは `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`、2026-10-11 06:09:16 UTCにbuilt。公開HTMLを今回の怪異HTMLへ変更していない。
