# Workへの引継ぎ（配信未実施）

- GitHub: `tomoya19991028-cmyk/seaart-tool`
- 検証ブランチ: `feat/person-forms-horror-background-lighting-ui`
- 製品commit: `a669edc3367083cdab3b67177ab988b12420de9f`
- 最終remote HEAD: `製品・報告書の保存後、最終応答のremote HEADとGitHubブランチ参照で確認`
- 配信ファイル: `index.html`、`sw.js`、`manifest.json`、`icon-192.png`、`icon-512.png`、`icon-maskable-512.png`。
- HTML／SWのbytes・SHAは検証報告と `validation/forms-environment/summary.json` を使用する。
- SW cache: `seaart-tool-pwa-v5-forms-structures-environment-ui-v1-http-cache-v1`。

既存本人限定Siteを保護する。Codexの読取時点で最新はVersion 5。配信前にWork側で最新version・source commit・アクセス設定を再確認する。新規Siteは作らず、本人限定アクセスを変更しない。main・公開PWAへ反映しない。

ユーザーの別途指示後に、検証済みcommitから製品を取得する。古いHTMLを混ぜない。現在のSite固有のmanifest名・説明等の差分があれば比較し、scope／start_urlや保存originを勝手に変更しない。

ユーザー自身が更新前のJSON・名前付き保存・未保存編集を保護したことを確認する。Codexが実機の保存データをバックアップしたとは扱わない。

更新時は従来のnetwork-first・旧cache保持・更新通知を維持する。旧タブを強制reloadしない。HTML取得失敗で旧cacheを消さない。新配信のHTML／SWを再取得し、SHAを照合する。反映遅延中は完了としない。

Androidチェックリストを実行し、実機とSeaArt実画像の結果を記録する。問題があれば旧versionとJSONを保持して原因を調査し、データを消去しない。Codexの自動テストPASSは実機／実画像PASSを意味しない。
