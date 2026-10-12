# 通常画像優先UIの検証証跡

製品commit `1a8394d19c04ef9f0282fbeb90432e2ad074fed0`。HTML SHA-256 `3bf2d5c753fb69ad402aa08f32f720a03834679f7b1921dd56973b5ad8d0a33c`。

最終22runner・360ケースは同じ改善版bytesで実行し、全exit0。各executionに対象URL、開始終了時刻、実行時HEAD、製品SHA前後、試験ソースSHA、commandを保存した。実行時HEADは基点統合commitであり、後で同じ検証済み製品を上記commitへ保存した。

| 保存場所 | 内容 |
| --- | --- |
| `summary.json` | 最終群・360ケース・全文構成数・原本不変・未実機・Sites無操作 |
| `final/` | 完走結果、execution、stdout／stderr、画面画像、観測全文 |
| `attempts/` | 修正前red、初回サーバー不在、解除確認の誤判定、中間成功、URL指定ミス、中断・OOM時の原結果。最終PASSに加算しない |
| `misrouted-environment-note.json` | 複製runnerの旧TARGET_URL指定ミスと停止・やり直し |
| `resource-incident.json`, `resource-round2-note.json` | 8GB cgroup OOM記録・T08／M02のTarget crashed・低並列全群再実行 |
| `initial-state.json` | remote基点、worktree状態、保護製品とsourceのSHA |
| `source-identity.json` | 生成HTML全bytes一致とsource／producer SHA |
| `original-tests.json` | 基点tests内の123原本・fixture・保存記録が不変 |
| `remote-product.json` | GitHubから製品／source／producer12ファイルを再取得して照合 |
| `public-before.json`, `public-after-product.json` | 公開4ファイルとPages source／buildの読取比較 |
| `preview-package.json` | 別origin用のローカルZIP、全製品bytes一致、非公開・Sites未変更 |
| `excluded-artifacts.json` | 大きな重複模擬export／importの外部原保存先・SHA |
| `records-sha256.json` | 証跡ファイルSHA。manifest自身を除外。gzipは展開後のSHAも記録 |

大きな観測全文はgzipで可逆圧縮し、元JSONと展開bytesを比較した。新しいexpected baselineではない。FAIL・中断記録を最終PASSで上書きしていない。

完全な原記録と保護製品・生成HTML・ZIP展開原本は `/workspace/seaart-normal-first-audit-20261012T021937Z/` に保持した。認証情報、巨大な重複HTML、不要な巨大ログをGitへ含めない。通常の選択データは模擬データであり、利用者のスマホ保存を使っていない。

旧T28の元assertionsは漫画の従来buffered操作用なので、新しい漫画モードを明示選択して実行する。cache／URLを設定するwrapperも元expectedを変えない。新しい通常操作はN01〜N20・新UI6画面・新PWA5確認点で独立に実行した。再実行は[手順](../../tests/normal-first/README.md)を参照し、出力先を新しく作る。

実Android・実IME／OS picker・SeaArt実画像・公開origin更新は未実施。旧本人限定Sitesは操作していない。詳細は[検証報告](../../REPORT_怪異タブ_通常画像優先UI検証.md)と[実装報告](../../REPORT_怪異タブ_通常画像優先UI改善.md)を参照。
