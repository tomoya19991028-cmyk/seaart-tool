# 検証証跡

模擬データ・隔離ブラウザの検証結果です。実Android・実SeaArt・実利用者の保存バックアップの証拠ではありません。公開originはHTTP GETとhash確認のみで、SW更新試験はlocalhostだけです。

- `before.json`：基準HEADと保護した製品／主要ソースのbytes・SHA。
- `worktrees-protected.json`：既存worktreeのHEAD・状態。
- `quality-5.json`：72候補、旧定義／保存基盤／旧テスト不変、cache名のみ変更の10チェック。
- `duplicate-review.json`：全旧候補との完全一致0件、語句が近い例のレビュー。
- `invariants-5.json`：18 inline script構文、CRLF、ソース再生成一致、最終HTML／SWのSHA。
- `development-records.tar.gz`：再現FAIL、途中試験・中断理由と、各途中HTMLの追加モジュールを復元するsource-snapshots。HTML本体の繰り返しコピーや認証情報はGitへ含めません。元HTML・元記録は削除せず、作業auditディレクトリにも保持します。
- `final-records.tar.gz`：最終版33 runnerと旧プリセット比較の実行記録・全文・ログ。
- `verified-results.json`／`summary.json`：全入力HTML SHAと試験SHAを確認した33 runner／498件＋比較2＋品質10＝510 PASS、FAIL 0。
- `preset-compatibility*.json`：旧10ジャンル／60パターン、シーン構成76件・旧候補を保持した独立照合。
- 4枚のPNG：模擬データを使った縦画面・横画面・文字150％のブラウザ確認。
- GitHubの製品保存照合はremote-product.jsonへ記録し、最終ブランチHEADは最終回答で報告します。

旧テスト・expected・fixtureは未変更。実行時adapterのUC01は承認済み追加を除いた旧12特徴の射影で比較し、追加72件は別チェックで照合します。第2回の元テスト3ファイルは未回収で、既存の独立代替試験を使用しています。再実行方法は `tests/horror-stories/README.md` を参照してください。
