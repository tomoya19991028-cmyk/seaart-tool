# Creatureモチーフ独立人物 第2回：実装・検証結果

調査・実装基点main：`5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。作業日：2026-10-11。

ローカル専用ブランチ：`feat/creature-motif-person-integration2`。mainへの反映・公開PWAの更新は行っていない。報告書提出時点では未commitで、GitHubへのブランチ保存およびremote HEADの確認は未完了。Git CLIの認証がなく、GitHub連携での保存処理も完了を確認できていない。以下はローカルで実装・検証済みの成果を報告する。

## 実装済み

- 既存髪色・目色・一般髪型に、一般衣装65、上半身34、下半身25、靴17、legwear9、耳角20、一般装飾28の確認済み標準候補198件を追加対応。新候補データではなく取込み許可表である。
- `mfResolveGeneralCandidate`は標準ID/key・value・名前・分類・所有者・非表示・編集・重複valueを検証。不明候補は候補名と理由を「取込み対象外」に表示し、近似しない。
- 個別ON/OFF、変更前→変更後のプレビュー、重み表示、色プレビュー、選択変更時の確認解除。同一ダイアログの単一スクロールを維持。
- `mfApplyImportGroups`は選択fieldのみ置換。色OFFと参考元の色未指定は既存色を維持。選択fieldの自由入力置換を事前表示。衣装セットの未選択部位を自動展開しない。
- モチーフ人物選択時だけ再取込み操作を表示。`mfReimportTarget`でUUID/record/profile/extensionをスナップショットし、`mfReimportPerson`で対象更新・元外見更新・別タブrevisionを再照合。UUID/metadata/形態/成人stateを維持し、保存とUndoは原子的に処理する。
- 元Creatureは編集せず、人物内にsource UUID/owner/species/form/age/許可を保存しない。一般外見はコピーで保持し同期リンクを作らない。

変更製品ファイルは`index.html`末尾の`creatureMotifIndependentPerson`スクリプトだけ。既存人物・Creature・成人資格・候補データ・生成関数本文・保存version・namespaceは変更していない。

## 保存・成人条件

root JSON v4、actorExtensions v4、adult v1、humanProfile v1、actorFormCatalog v1、現行5キーと`creature-adult-v1/result-access-v1/motif-person-v1`を維持。移行処理の追加は不要。

`adultAccess:'denied'`を維持。一般identity、成人確認checkbox、名前変更、単一metadata改変、保存・復元・Undo・JSONによってmotif人物に資格を付与しない。Creatureの本番信頼定義0件を維持し、元Creatureの資格・年齢を継承しない。既存人物の成人向け機能の回帰は既存テストで確認した。成人候補内容・新しい成人タグ出力処理は追加していない。

## 検証結果（最終HTML）

Chromium Headless 154.0.8037.92 + Playwright、ローカルHTTP。日本語UIはNoto Sans CJK JPを使用。実機スマホ・公開URLの試験ではない。

| 検証 | 結果 |
|---|---|
| 第2回機能 | 48契約 PASS |
| 再取込み障害 | settings/working/history/marker/journal保存、描画、staleの7ケース PASS。RAM/disk/Undo不変 |
| 第2回生成 | 7モデル×3分離、通常21・漫画21・コマ42。手動で同じ一般外見を設定した人物との全文一致 |
| 第2回スマホ | 360/393/430 × 640/800、6touch viewport PASS。作成・再取込み・ON/OFF・プレビュー・Undo・キャンセル |
| R1 | 49契約／865 assertions PASS |
| R1固定全文 | 通常210・漫画210・コマ420 PASS。元fixtureとの完全一致 |
| データ | 12dataset deep fingerprint・件数不変 PASS |
| 第1回 | 36契約、作成障害8、保存移行8 PASS |
| 第1回追加境界 | 20契約 PASS。別タブ競合・journal・旧namespace保護を含む |
| Native/旧人物回帰 | 通常252・漫画252・既存人物成人21 PASS |
| 第1回UI/簡易漫画 | 6viewport、簡易漫画state/Positive/Negative全文一致 PASS |
| 実SW/PWA | HTTPキャッシュ更新失敗→再試行、旧タブ共存、オフラインreload/保存、許可Map非復活など9ケース PASS |
| 構文/文字コード | 13 inline scripts、SW、新規3テスト、UTF-8/CRLF、CRLFを許容したdiff check PASS |

新規テストは3ファイルと実行手順書。既存テスト8群・元R1・固定fixtureは変更なし。`tests/results/creature-motif-person-integration2/`は今回の観測結果であり、新しいexpected baselineではない。初期のブラウザ起動失敗・フォント不足・別試験namespaceへの接続失敗は試験環境の課題として解消し、最終9群を再実行した。未確認項目をPASSにしていない。

固定fixture（展開後）SHA-256：`e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832`。生成配列SHA-256：`7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。

## 製品ファイル照合

| ファイル | bytes | SHA-256 | 状態 |
|---|---:|---|---|
| index.html | 3,789,047 | `a4ba6a92c90bcceab8117fc9406447f7fdd5802469ae9a7afa7f172f35a1e431` | +13,497 bytes、UTF-8/CRLF |
| sw.js | 2,320 | `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a` | mainと同一 |
| manifest.json | 762 | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` | mainと同一 |

index.html Git blob：`433a37c97253cde3a3d0311fc426b446d1cc6491`。基点blob：`67abdcc632af594687739ae331d00d224d41ff9f`。

Character1390、人物基本外見1384、Creature species94、基本外見60、features275、候補500、共通adapter1444を維持。

## 未実装・対象外

- 通常人物への上書き取込み、Native特徴の自動移植、未確認候補・原作固有衣装・自由入力の取込み。
- 原作形態ごとの擬人化外見の自動推定。取込み元の形態選択は保存済みsemi/fullであり、元Creatureへ原作形態を自動適用しない。
- 衣装セット名だけから未選択部位を生成へ追加する変更。既存生成はセットを部位で表すため、プレビューの説明どおり部位を個別選択する。
- motif人物の成人向け許可、Creature本番資格追加、新しい成人タグ生成、漫画の成人連携。現行のdenied契約では実施不可。
- 実機スマホ、OS完全再起動、公開PWA更新、main反映。

## main反映前の注意事項・第3回以降

今回のbranchはレビュー対象であり自動公開しない。mainが進んだ場合は差分・保存契約を再確認し、固定baselineを差し替えず再検証する。公開時のSW cache更新の要否/更新名、旧タブ共存、HTTPキャッシュ、初回保存移行、オンライン→オフラインを別途確認する。現在のSWを変更して公開更新を先取りしていない。

成人向け再利用は、信頼できる成人・独立創作・人間主体の構造、元の未成年/年齢不明個体の単純な年齢変更ではないこと、相手を含む全当事者条件、importからの資格復活防止を別工程で調査する。現行metadataにはこれらの根拠がなく、許可APIとして既存人物checkboxを流用できない。任意ローカルJSONの由来を暗号学的に保証する機構もない。まずWork Highで必要根拠と実施可能範囲を確定し、承認済みの非露骨なUI/保存改善だけをCodex Highへ渡す。現時点で成人向け開放は実装可能と確約しない。

関連報告：`REPORT_Creatureモチーフ独立人物_第2回_仕様影響分析.md`、`REPORT_Creatureモチーフ独立人物_第2回_候補対応表.md`。再検証手順：`tests/README-creature-motif-person-integration2.md`。

![再取込み360×640](tests/results/creature-motif-person-integration2/ui/reimport-360-640.png)
