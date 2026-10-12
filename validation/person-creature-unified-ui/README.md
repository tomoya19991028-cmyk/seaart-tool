# 人物・生物UI一括更新の検証証跡

最終HTML SHA-256 `ed8da8f0978a0249a61778b1433c139c22cad9c95721c7874d11e6493cf610bb`。製品commit `0fa5c73f57437c090018f18e266542bdc518a35e`。採用した30runner・451評価単位がPASS、FAIL 0です。Android実機は未検証です。

- [機械集計](verified-results.json)：件数、最終HTML SHA、実行した元試験とwrapperのSHA。
- [採用記録](selected-final-runners.json)：最終採用結果の対応先。
- [生成元・構文・不変性](final-7-invariants.json)：17script、孤立再生成、旧HTMLとのbytes比較、既存140ファイル不変。
- [GitHub製品照合](remote-product.json)：専用ブランチのref、git fetch、REST実blobのbytes／SHA照合。
- [保護確認](protected-after.json)：main・旧ブランチ・5worktree、Pages source／build、公開4 endpointの全bytesとSHA。
- [最終実行記録](final-records.tar.gz)：正しいURLと最終HTMLで完走したexecution・結果・全文・stdout／stderr。UIの最後の追加検査はfinal-8、他はfinal-7です。
- [途中記録](development-records.tar.gz)：途中FAIL、中断、旧製品・誤URLの記録、修正前の新moduleと製品SHA。

途中の結果を最終PASSへ混ぜていません。途中の全HTML・全文・画像・最初の圧縮archiveも `/workspace/seaart-unified-ui-audit-20261012T062120Z` に保持しています。GitHubには必要な再現記録を圧縮して保存し、重複する巨大出力は含めていません。既存の原本・fixture・expected・前回証跡を削除していません。

途中HTMLは共通基準commit `023bb6d2b24395551c06d756faac16440f88b7b5:index.html` に、`source-snapshots` のmoduleを最後の `</body>` の直前へ挿入すると、`snapshots.json` の全bytesとSHAで再現できます。module以外が基準HTMLとbyte一致することも確認済みです。

## 確認画像

模擬データ・隔離Chromeでの画像です。端末や実データの画面ではありません。一時的な移行通知が表示されている場合があります。

[人物基本6カード](person-393x800.png)／[生物・基本適用・モード](creature-360x640.png)／[装備詳細](equipment-393x800.png)／[文字150%](font150-430x800.png)

再実行は [手順書](../../tests/unified-ui/README.md) を参照してください。古い第2回の元3テストは未回収で、M01〜M14を独立代替として扱っています。既存作成ボタン専用の表示試験は今回の削除仕様と両立しないため原型では実施せず、内部機能とdialogを保持した統合UIで確認しました。
