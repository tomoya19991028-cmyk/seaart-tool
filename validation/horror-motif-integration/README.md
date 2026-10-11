# 統合検証の証跡索引

製品merge commit `f1de74cb99d2d4e89c5be36aaa65e2a2cea40405`。HTML SHA-256 `3525ec8b2e856928031198b80505310393c6d796533e9b9e8a07b9516d04d24e`。

最終19runnerは同じworking treeの製品で実行した。記録のgitHEADはmerge前の怪異HEADだが、実行前後のHTML SHAは全て上記と一致し、後で同一bytesを製品commitへ保存した。最後の報告commitは製品を変更しない。

| 保存場所 | 内容 |
| --- | --- |
| `summary.json` | 329ケースの粒度別集計、全文構成数、198実取込み、未実施の区分 |
| `final/` | 各群の結果、executionの時刻・command・製品SHA・試験ソースSHA・exit code、stdout／stderr、UI画像 |
| `attempts/` | 単純同居状態のred、fixtureミスの初回FAIL、限定診断、最初の統合／第2回／PWA試行。最終PASSへ加算しない |
| `initial-state.json` | 開始時remote HEAD、merge-base、worktree状態、保護した製品SHA |
| `source-identity.json` | HTML再生成全bytes一致、製品とsource／producerのSHA |
| `immutable-tests.json` | mainの既存50ファイル・怪異原本の不変確認 |
| `original-test-recovery.json` | 第2回原本3件・元READMEが未回収、代替であること |
| `remote-product.json` | GitHubから製品commitの11ファイルを取得した全bytes照合 |
| `public-before.json`, `public-after-product.json` | Pages source／buildと公開4ファイルの読取確認。公開ブラウザSW更新はしていない |
| `changed-files.json` | 怪異HEADから最終報告同梱までの変更ファイル一覧と総数 |
| `excluded-artifacts.json` | 大きな重複模擬export/importの原保存先・bytes・SHA |
| `records-sha256.json` | 証跡ファイルのbytes・SHA。manifest自身は除外。gzipは展開後SHAも記載 |

大きな観測全文JSONは可逆gzipで保存し、展開結果を元の実行出力とbytes比較した。expectedの再生成・置換ではない。例えば `python -m gzip -d -c final/round2-final/round2-fulltext.json.gz` で読める（サイズによって未圧縮のJSONで保存される場合もある）。

原記録一式は `/workspace/seaart-integrated-audit-20261011T232933Z/` に保持した。保護製品、生成HTML、read-only merge-tree、大きな模擬JSONもそこにある。元のFAILを消さず、実行ごとに出力先を分けた。重複製品HTML・巨大merge-tree・認証情報・不要な巨大ログはGitへ含めない。

再実行は[統合手順](../../tests/integration/README.md)。この証跡を上書きしない。実機、実IME、SeaArt画像品質、公開origin更新はPASSと報告しない。詳細は[総合検証報告](../../REPORT_怪異モチーフ第2回_総合検証結果.md)。
