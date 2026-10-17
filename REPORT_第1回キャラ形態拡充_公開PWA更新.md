# Version 7 公開PWA更新報告

公開PWA：**成功**。調査・検証日：2026-10-17 UTC。実行証跡：`/workspace/seaart-v7-release-20261017/`。検証用Sitesは変更していない。

2026-10-17 ユーザー申告により、今回の公開PWA側の必要な保護とバックアップ読取確認が完了。Codexによる端末内ファイルの直接確認ではない。

## 公開方式

公開URL：<https://tomoya19991028-cmyk.github.io/seaart-tool/>。

APIで `build_type: legacy`、`source.branch: main`、`source.path: /`、`public: true`、`https_enforced: true` を確認。GitHub管理の `dynamic/pages/pages-build-deployment` が有効で、独自 `.github` workflowはない。直近のbuild→deploy→report-build-statusの成功ステップを記録。公開元、公開範囲、origin、リポジトリ可視性は変更しない。

mainへのpushがそのまま公開を開始するため、ユーザーのバックアップ確認を含む最終条件をすべて確認してからpushした。

## 更新前の実配信

6資産をHTTPSから実取得し、旧mainと全バイト一致。旧HTML SHAは `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72`、旧SW SHAは `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a`。manifest SHAは `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f`。HTMLに外部実行依存はなく、参照は相対manifest・iconと登録SW。必要な実行資産は保護した6ファイルで完結する。

## 更新対象

| ファイル | 新版SHA-256 |
| --- | --- |
| index.html | `a8754a15f383ff603aa642b2e863eebbde646b4c15c5de33686f3014f2f5cb98` |
| sw.js | `cd8d2fa1b8ab21749303a6d32d2c9734ed9cd9ffac22c5b934b9d5a6f69aa78c` |
| manifest.json | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` |
| icon-192.png | `dfd2f354a90fe0dbd78c89f28d112307d6a138c91e9e303ae7540aa8ed8b6c5a` |
| icon-512.png | `4880287ca510eb8dbd9b0d11969602b651ac84c103cf3f51a5b2d9e1f3388149` |
| icon-maskable-512.png | `3ae1880344865f9c1512ce5cab2799c99c7ed5a0e94b389e5f7ab3b60bec9a78` |

SW差分はキャッシュ名のみ。APP_SHELL、install／activate／fetch、network-first、offline fallback、skipWaiting／clients.claim、旧キャッシュ整理は旧版と同一。新しい更新通知機構は追加していない。SWはlocalStorage・IndexedDBを操作しない。

manifestの `start_url: ./index.html`、`scope: ./` と3アイコンは旧版から不変。`/seaart-tool/` 配下でURL解決・SW scope・APP_SHELLを検証済み。Sites originの混入なし。

## ビルド・ブラウザ・オフライン

735 PASS／0 FAIL（既存回帰714件＋今回の公開準備検査21件）。対象外SKIP 4件。 公開後の実HTTPS・隔離ブラウザ6件もPASS／FAIL 0。今回の合計は741 PASS／FAIL 0。

初回の並行実行でcard-pwa・normal-contracts・normal-uiの3本、その後の補助forms-reproでも30秒のロード待ちtimeout。製品・元テスト・アダプター・制限時間を変えずに単独で再実行し、全ケースPASS。初回FAILと親runnerのexit 1は保持し、最終採用ケースへ二重加算しない。同じ今回の実行中のPASSだけを製品／テスト／アダプターSHA一致で再利用し、過去タスクのPASSは利用していない。追加の更新試験では準備条件2点を訂正した。旧mainの仕様は表示4コマでも保存6枠、ブラウザの旧版favicon.ico自動要求404はアプリ依存資産ではない。旧main実装に照合した訂正であり、製品コードとアプリ資産のサブパス検査は変更していない。訂正前の記録も保持した。

提出版そのままのPagesビルドは検証用絶対リンクで失敗。`_config.yml` でvalidation証跡を除外する最小修正を加え、同じ公式Jekyllイメージでビルドし、出力6資産のSHAを照合済み。公開方式の切り替えや検証証跡の大量削除は行わない。

隔離localhostの `/seaart-tool/` に旧版を配信して旧SWを制御状態にし、2人物・Creature・自由形態・漫画・名前付き保存・通常／漫画履歴・IndexedDB sentinelを作成後、Version 7のSWへ更新する。旧namespaceの保持、新版への移行、オフラインでの新キャラ／赫眼・保存・再読込、オンライン復帰を確認済み。実ユーザー保存領域は利用しない。

## 実公開状態

main更新済み：True。HTTP新版配信確認済み：True。

実Pages workflow：39005407894。Deployment：7135170980。HTTPの6資産を取得し、上記の新版SHAと一致することを確認。証跡はdeployment-observations.json／public-after.json。公開HTTPSの隔離Chromiumでも、新規キャラ・形態・遊戯王表示、SW登録、保存・Undo、オフライン再読込、オンライン復帰をPASS。物理Android端末ではない。

## 復旧と未確認

復旧参照：`backup/old-public-pwa-20261017T035341Z`。詳細は `ROLLBACK_第1回キャラ形態拡充_公開PWA.md`。旧版再配信とユーザーデータ復旧は別工程。Version 7で保存した新15人物・8形態は旧版では未知参照になり得る。

Android実機、端末PWAの更新タイミング、物理端末オフライン、日本語IME、実SeaArt画像生成は未実施。サイトデータ削除・強制キャッシュ削除・アンインストール／再インストールは行わない。
