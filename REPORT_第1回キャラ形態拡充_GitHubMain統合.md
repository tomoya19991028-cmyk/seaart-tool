# Version 7 GitHub main統合報告

GitHub main：**成功**。調査・検証日：2026-10-17 UTC。実行証跡：`/workspace/seaart-v7-release-20261017/`。検証用Sitesは変更していない。

2026-10-17 ユーザー申告により、今回の公開PWA側の必要な保護とバックアップ読取確認が完了。Codexによる端末内ファイルの直接確認ではない。

## 基準と統合方式

| 項目 | HEAD／設定 |
| --- | --- |
| 更新前main | `5b5bb03589dcc9a661402395d6c3db20cfd4cf52` |
| 現在／更新後main | `894d5fbfdfa65e68a50b77acdaa3e497ed31aeca` |
| Version 7提出HEAD | `51e75fb1f88425b407c42817d006e8926376c46e` |
| Version 7製品commit | `5ced87e14d00c35d2069ce11926abc4b338396a2` |
| Version 6検証HEAD | `3fd1bb9fc34be09d85e3eef71cc1f6122f9054b8` |
| 統合ブランチ | `integrate/version7-main-20261017T035341Z` |
| 製品＋Pages設定commit | `894d5fbfdfa65e68a50b77acdaa3e497ed31aeca` |
| 復旧ブランチ | `backup/old-public-pwa-20261017T035341Z` |

調査開始時点のmainは報告値から進んでおらず、Version 7提出HEADの祖先。統合方式は検証済み統合HEADへのfast-forward。既存検証ブランチは保持。公開直前にmain・Pages設定・旧配信6資産を再取得して不変を確認し、復旧用参照とバックアップ確認を照合してからpushした。

Version 7に対するアプリ製品コードの変更はない。HTML・SW・manifest・3アイコンは提出版と同一。追加する `_config.yml` は既存Jekyllの `exclude: [validation]` 設定だけであり、配信方式を変更しない。

## 公開準備で発見した問題と修正

未修正の提出HEADは、`validation/tg-yugioh-phase1/attempts/*/fixed/baseline` の絶対パスのシンボリックリンク4個によりJekyllが `Errno::ENOENT` で失敗した。証跡をGitに残したまま、実行資産ではない `validation` を処理対象から除外した。既存と同じ `ghcr.io/actions/jekyll-build-pages:v1.0.13` で再ビルドし、6製品資産のSHAが提出版と一致することを確認済み。製品HTML・SWへのパッチで回避していない。

## 機能と変更ファイル

人物カタログは旧1,390行を保持し、新15行を加えた1,405行。東京喰種は旧6名を維持して新15名、計21名。新15標準外見と赫眼8形態、金木の旧3形態を保持する。孫悟空5形態、黒崎一護3形態も保持。遊戯王は7分類・14名を表示上1分類に統一し、内部ID・value・groupと詳細シリーズ検索を維持する。

Version 6の怪異6構造、手動候補84件、背景場所44・状態48追加、光色13色＋未指定、固有候補切替、モバイル・結果画面を継承。Creature、2人物＋Creature、通常／漫画・コマ別・下書き・部分確定、Undo、保存／履歴／JSON、7モデル、分離モードを回帰対象に含める。

旧mainからの製品変更は `index.html` と `sw.js`。Version 7提出版に含まれるソース・scripts・テスト・既存報告・証跡も統合済み。旧mainの59ファイルをすべて保持し、削除は0。全差分は `validation/version7-public-release-20261017/changed-product-files.tsv`。公開mainの提出HEADからの差分は `_config.yml` のみ。今回の最終4資料と新たな検証証跡は、公開後に専用統合ブランチへ保存する。

## 製品SHA-256

| ファイル | SHA-256 |
| --- | --- |
| index.html | `a8754a15f383ff603aa642b2e863eebbde646b4c15c5de33686f3014f2f5cb98` |
| sw.js | `cd8d2fa1b8ab21749303a6d32d2c9734ed9cd9ffac22c5b934b9d5a6f69aa78c` |
| manifest.json | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` |
| icon-192.png | `dfd2f354a90fe0dbd78c89f28d112307d6a138c91e9e303ae7540aa8ed8b6c5a` |
| icon-512.png | `4880287ca510eb8dbd9b0d11969602b651ac84c103cf3f51a5b2d9e1f3388149` |
| icon-maskable-512.png | `3ae1880344865f9c1512ce5cab2799c99c7ed5a0e94b389e5f7ab3b60bec9a78` |

## 今回の検証

735 PASS／0 FAIL（既存回帰714件＋今回の公開準備検査21件）。対象外SKIP 4件。 公開後の実HTTPS・隔離ブラウザ6件もPASS／FAIL 0。今回の合計は741 PASS／FAIL 0。

初回の並行実行でcard-pwa・normal-contracts・normal-uiの3本、その後の補助forms-reproでも30秒のロード待ちtimeout。製品・元テスト・アダプター・制限時間を変えずに単独で再実行し、全ケースPASS。初回FAILと親runnerのexit 1は保持し、最終採用ケースへ二重加算しない。同じ今回の実行中のPASSだけを製品／テスト／アダプターSHA一致で再利用し、過去タスクのPASSは利用していない。追加の更新試験では準備条件2点を訂正した。旧mainの仕様は表示4コマでも保存6枠、ブラウザの旧版favicon.ico自動要求404はアプリ依存資産ではない。旧main実装に照合した訂正であり、製品コードとアプリ資産のサブパス検査は変更していない。訂正前の記録も保持した。

旧試験の期待値・生成全文は変更しない。既存アダプターによる新カタログ行等の投影は元報告と同じ。未回収の旧モチーフ第2回の専用3テストは未回収のまま、独立代替M01〜M14を別枠として識別する。R1の865 matrix、旧通常252・漫画252全文等はケース総数へ二重加算しない。

保存version／namespaceを追加変更せず、v3／v4／v5 JSON、形態所有、UUID、自由形態、名前付き保存、履歴、Undo・保存／インポート失敗のrollbackを隔離ブラウザで再検証済み。公開PWA側の実ユーザーデータには接続しない。

## 保護・未確認

旧mainのGitHub復旧ブランチ、完全Git bundle、旧配信6資産、旧main全ファイルtar、公開設定・workflow／deploymentメタデータ、SHA一覧を保存した。これはソースのバックアップであり、ユーザー端末の保存データのバックアップではない。

Android実機・日本語IME・実SeaArt画像生成は未実施。自動Chromiumと物理端末を区別する。端末内データは直接検査せず、ユーザーによる更新前保護・読取確認の完了申告を記録した。mainと配信状況は実測値に従って区別する。

既存第1回製品の小さな表示上の制限は継承する。ウタの標準衣装は既存候補と値を共有し、候補ラベルも継承。形態状態表示は身体特徴・effectの一部手動編集を比較対象に含まない場合がある。実データ保存と形態適用は別の試験で確認しており、今回これらの表示処理は変更していない。
