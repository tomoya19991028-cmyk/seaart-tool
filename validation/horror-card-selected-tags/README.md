# 怪異カード選択済みタグ：原記録

summary.jsonは最終26runner／401評価単位の機械集計です。新検査はC19・UI12・CS4・PWA6の41単位。前回の360単位を実再実行し、全文構成数・865 assertions・198候補は重複加算しません。

final-records.tar.gzに、同一最終HTML SHAの各runnerのexecution.json、結果、stdout／stderr、全文比較、画像を保存しています。auditには実行・再実行・集計スクリプトと選択した結果ディレクトリの対応を記録しています。元fixtureのsymlinkはarchiveに混ぜません。検証用の模擬データだけです。

development-records.tar.gzは途中のFAIL、指定ミス、修正前の製品、製品変更をまたいだ結果を保存しています。これらを最終PASSへ加算していません。旧HEADで名前付き保存がhorrorを含めない再現、低いタグ欄、コマscope、local OFFの余分なenabled、文字拡大での欠け、PWA検査設定の過剰なcache名置換を含みます。

structural-verification.jsonは、元HTMLに対する許可した差分、既存ソース5ファイル・元テスト／fixture／記録128ファイルの同一性、16 script構文、製品bytes／SHAを記録します。CRLFを保持し、gitのwhitespace検査もcr-at-eolを指定して確認しました。

Gitの実行HEADは基準commit6044上のworking treeです。各executionの製品SHA・元テストSHA・適用wrapper SHAを最終製品と照合し、同じbytesをsummaryのproductCommitへcommitしました。sourceとindexを孤立パスへ再生成して全bytesを比較しました。

main・公開PWA・既存Sitesへ書き込んでいません。Android実機の保存を採取・バックアップしていません。第2回原本3テストは未回収で、M群は独立代替です。新検査の再実行手順は ../../tests/card-tags/README.md を参照してください。
