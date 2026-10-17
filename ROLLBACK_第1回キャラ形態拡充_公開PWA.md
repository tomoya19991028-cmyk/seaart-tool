# Version 7 公開PWA復旧手順

作成日：2026-10-17。旧版コード、旧配信資産、端末保存データを別々に扱う。保存データを消去して復旧しない。

## 保護した参照とファイル

- 旧main：`5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。
- GitHub復旧ブランチ：`backup/old-public-pwa-20261017T035341Z`。
- ローカル完全Git bundle：`backup/old-main.bundle`。`git bundle verify` で完全履歴を確認。
- 旧main全59ファイル：`backup/old-main.tar`。
- 旧実配信：`backup/public/` のHTML・SW・manifest・3アイコン。
- 配信SHAとHTTPヘッダー：`backup/public-sha256.json`。
- 公開元・workflow・Deployment：`backup/pages-settings.json`、`actions-workflows.json`、`workflow-latest-run.json`、`workflow-latest-jobs.json`、`deployments.json`。
- 全バックアップSHA：`backup/SHA256SUMS.json`。ユーザー端末内データは含まれない。

## A. main統合の失敗

1. `git ls-remote origin refs/heads/main` とPagesの現配信SHAを取得し、どこまで反映したか確認する。
2. fast-forward pushが拒否されただけなら旧mainと公開版は保たれる。新しいmain変更を強制上書きせず、差分を調べる。
3. 復旧ブランチが旧HEADを指すことを照合する。ネットワークから復旧できない場合もbundle／tar／実配信資産を使える。

## B. Pages配信の失敗・コードの旧版再配信

まず現mainと保存データへの影響を確認する。GitHub Pagesの公開元（mainルート）・公開範囲は変更しない。force pushや履歴の巻き戻しを避け、クリーンな専用checkoutで現在mainから復旧用作業ブランチを作り、旧実行資産を復元する新しいcommitで戻す。

```sh
git fetch origin
git switch -c rollback/old-public-pwa-UNIQUE_TIMESTAMP origin/main
git restore --source=origin/backup/old-public-pwa-20261017T035341Z -- index.html sw.js manifest.json icon-192.png icon-512.png icon-maskable-512.png
sha256sum index.html sw.js manifest.json icon-192.png icon-512.png icon-maskable-512.png
```

6資産が `backup/public-sha256.json` と一致することを確認する。検証証跡の絶対リンクが残るため、今回検証した `_config.yml` のvalidation除外は保持する。埋込HTMLだけで動作する旧実行資産の復旧とし、無関係なソース・証跡を大量削除しない。必要な保存互換確認・ビルド・公開前判定を行ってから、6資産だけを明示的にstageし、復旧commitを通常のfast-forwardでmainへpushする。

Pagesのbuild→deployが成功したことを確認し、公開HTTPSのHTML・SW・manifest・3アイコンを取り直す。旧HTML `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72`、旧SW `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a` と一致すること、`/seaart-tool/` の起動・SW・offlineを再検証する。

これは旧製品コードを新commitで再配信する方法。mainのGit履歴自体を旧HEADへ強制変更する手順ではない。旧HEADの完全なソースは復旧ブランチ／bundleから別checkoutへ取り出せる。

## C. Android重大不具合とユーザーデータ

1. 端末で開けるうちにVersion 7の最新JSON・画像・下書き・未保存編集を保護し、更新前JSONも別ファイルで保持する。
2. Version 7の新15人物・新8形態は旧版で未知参照になり得る。旧版の保存namespaceと新版namespaceも区別し、隔離環境の複製データで読込可否を調べる。
3. 旧版が新データを安全に扱えない場合は、影響をユーザーへ説明してからコードrollbackを行う。旧データの表示に戻っても新データが統合・復元されたとは扱わない。
4. コードの復旧だけで端末データを自動復旧したと報告しない。JSONインポートは置換範囲を説明し、既存データを保護したうえで別工程として実行する。
5. localStorage／IndexedDBの削除・初期化、サイトデータ削除、強制cache削除、PWAアンインストール／再インストールは行わない。

通常の更新確認は作業保存後の再読込、必要に応じてPWAを閉じオンライン再起動で行う。復旧後もHTTPS・6資産SHA・起動・保存・SW・offlineを再確認する。
