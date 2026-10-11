# 怪異タブ追加独立検証の証跡

対象は `feat/horror-tab-manga-draft-integration`。開始remote HEADは `be4f7f902d533d85614b3b560946e54c735e213a`、検証済み修正製品commitは `e4660a638988c8a7a2e55eed5fb1b1acb3f33bcd`。製品HTML SHA-256は `9fe8950c1d4ecdd936edf635975aebdad4b01633fb6e498da37644cb1827d33d`。

試験は開始HEADに修正を加えたworking treeで実行し、同じbytesを製品commitへ保存した。従って実行記録のgitHEADは開始HEADであり、試験対象の同一性は記録中の製品SHAで照合する。報告書・証跡だけを追加した後続commitでも製品は変わらない。

| 保存場所 | 内容 |
| --- | --- |
| `summary.json` | 必須30項目・追加50ケース・回帰の集計。ケース、全文組数、assertionsは別集計 |
| `final/` | 最終13runnerの結果、実行前後の製品SHA・試験ソースSHA・時刻・exit code・stdout・stderr。固定比較は`fixed/` |
| `before/` | 開始製品での既存試験の独立再実行 |
| `failures/` | 修正前に追加試験で再現したFAILと、試験側fixture等の修正前記録。原因区分は下記報告を参照 |
| `intermediate/` | 中間製品での結果。途中停止したrunnerは`interrupted-note.json`で明示。最終PASSへ含めない |
| `identity/` | 報告製品・生成HTML・最終製品の同一性、既存テスト／fixture50ファイル不変 |
| `motif-investigation.json`, `motif-final.json` | モチーフ第2回とのread-only競合調査。mergeは未実施 |
| `remote-before/`, `public-unchanged.json` | main・Pagesと公開HTTPファイルの読取り確認。公開SW更新試験は未実施 |
| `remote-product.json` | GitHubから修正製品commitのHTML・SW・manifestを全bytes再取得して照合 |
| `excluded-artifacts.json` | 重複する大きな模擬export/importファイルの原保存先・bytes・SHA。原本はworkspaceに保持 |
| `records-sha256.json` | このディレクトリ内の全証跡ファイルのbytesとSHA（manifest自身を除く）。gzipは展開後のbytesとSHAも記録 |

全文の大きなJSONだけをgzipで保存した。これは観測結果の可逆圧縮であり、expected・fixtureの更新ではない。展開bytesは元の実行結果と照合した。例えば`python -m gzip -d -c final/prompts/fulltext.json.gz`で読める。

完全な原記録・模擬データ・生成HTML・read-only merge-tree結果・最初のサーバー未起動による接続エラーは `/workspace/seaart-horror-independent-20261011/` に保持した。一時的な認証情報、製品HTMLの重複、大きなmerge-tree出力、不要な巨大ログはGitへ含めない。初回FAILを再生成したPASSで上書きしていない。

再実行は[追加検証手順](../../tests/horror/README-independent.md)と[既存手順](../../tests/horror/README.md)を参照。未使用の出力ディレクトリを指定し、この原記録へ書き込まない。全てローカル隔離origin・模擬データで検証し、利用者のスマホデータは使わない。

判定・不具合・未実施範囲は[独立検証結果](../../REPORT_怪異タブ_追加独立検証結果.md)、[修正履歴](../../REPORT_怪異タブ_追加修正履歴.md)、[統合影響](../../REPORT_怪異タブ_モチーフ人物統合影響.md)、[実機手順](../../CHECKLIST_怪異タブ_スマホ実機確認.md)を参照。実機・本物の日本語IME・SeaArt実画像品質はPASSの対象に含めない。mainと公開PWAは変更していない。
