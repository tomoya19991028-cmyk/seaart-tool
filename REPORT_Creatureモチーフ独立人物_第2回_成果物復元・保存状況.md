# Creatureモチーフ独立人物 第2回：添付成果物復元・GitHub保存・回帰再実行結果

2026-10-11。対象：tomoya19991028-cmyk/seaart-tool。専用ブランチ：feat/creature-motif-person-integration2。

**第2回HTMLと報告書3件の復元・専用ブランチ保存は完了。利用可能な既存回帰試験はPASS。第2回固有テスト原本と元の検証記録は未回収で、全必須検証は未完了。main統合・SW公開更新・第2回Pages公開は実施していない。**

## 1. 成果物の復元・保護

本環境には前回の作業ツリーが存在しなかった。ユーザー添付から更新HTML、実装検証結果、候補対応表、仕様影響分析の計4ファイルを回収した。添付原本と同一のコピー、SHA-256／Git blob manifest、内容を検証したtar.gzを/workspace/seaart-artifact-recovery-20261011T112758Zに保存。以前の中止調査記録も保持している。

更新HTMLは3,789,047 bytes、SHA-256 `a4ba6a92c90bcceab8117fc9406447f7fdd5802469ae9a7afa7f172f35a1e431`、Git blob `433a37c97253cde3a3d0311fc426b446d1cc6491`。報告済み3値に完全一致した。報告書3件は添付内容を変更せず正規ファイル名で保存した。

バックアップ済みなのは回収した4ファイルであり、未回収のテストや前回環境の完全バックアップを含まない。実利用者のスマホ保存データは含まない。

## 2. 専用ブランチのcommit／remote保存

製品HTML・原報告3件・復元状況を通常commit／pushした。

- 実装保存commit：`f6326a9ced70ea5abdf281f3c6b942caad9e6f90`
- push後にremote HEADを再取得し、このcommitと一致を確認。
- commit固定のGitHub raw HTTPからHTML、SW、manifest、原報告3件、復元状況の計7ファイルを再取得し、ローカルと全bytes／SHA-256を照合。
- 今回の検証記録と再実行手順は、同じ専用ブランチへ追加commitして保存する。最終remote HEADは保存後に再照合する。

元報告書の未commitという記載は提出当時の記録として保持している。本報告で今回の保存状況を区別する。

## 3. main最終commitと製品差分

最新remote mainは`5b5bb03589dcc9a661402395d6c3db20cfd4cf52`で、指定基点と一致。今回mainは変更していない。製品差分は末尾の`creatureMotifIndependentPerson`スクリプト1件のみ、+13,497 bytes。このスクリプトより前・後のbytesはmainと完全一致。固定baseline比較でも既存generate／generateManga本文不変を確認した。

SWは2,320 bytes／SHA-256 `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a`。manifestは762 bytes／SHA-256 `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f`。mainと同一。既存テスト原本・既存結果ファイル・固定fixtureはSHA-256を比較し変更なし。

## 4. GitHub Pages deployment

現在の既存第1回deploymentは6991750150、mainの上記SHAが対象。既存[workflow 38117090150](https://github.com/tomoya19991028-cmyk/seaart-tool/actions/runs/38117090150)はcompleted／success。第2回のmain統合・公開操作は行っていない。公開HTMLは第1回のままであり、第2回公開完了とは報告しない。

## 5. 公開HTML・SWの照合

公開レスポンスの全本文を読み取り、以下を確認した。

| URL末尾 | HTTP | bytes | SHA-256 |
| --- | ---: | ---: | --- |
| / | 200 | 3,775,550 | `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72` |
| /index.html | 200 | 3,775,550 | `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72` |
| /sw.js | 200 | 2,320 | `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a` |
| /manifest.json | 200 | 762 | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` |

## 6. 第2回機能の検証

添付候補対応表は一般衣装65・上半身34・下半身25・靴17・legwear9・耳角20・一般装飾28、計198行で指示書と一致した。これは文書の確認であり、198候補の動作確認ではない。

第2回の48契約、再取込み障害7ケース、拡張一般外見を手動人物と比較する通常21・漫画21・コマ42、第2回作成／再取込み／ON/OFF／色を含む6viewport、新規3テストの構文は未実施。新規テスト3件と元の実行記録を未回収のため、添付原報告の前回PASSを今回のPASSとして扱わない。

## 7. 第1回・既存機能の回帰再実行

Chromium 154.0.8037.57、Playwright 1.62.1、Node v24.19.0、Noto Sans CJK JP、ローカルHTTP。元テストを書き換えず、固定commitから別の読取専用HTTP fixtureを準備して実行した。各試験は隔離ブラウザcontextを使用した。

| 試験 | 今回結果 |
| --- | --- |
| 第1回機能 | 36契約 PASS |
| 第1回作成障害 | 8ケース PASS |
| 第1回保存移行 | 8ケース PASS |
| 第1回生成 | 通常21・漫画21・コマ42 PASS（第2回拡張取込みの比較とは別） |
| 第1回追加境界 | 20契約 PASS |
| R1 | 49契約／865 assertions PASS |
| R1固定全文 | 通常210・漫画210・コマ420 PASS |
| 固定fixture／dataset | 元fixtureとの全文一致、12dataset deep比較・fingerprint PASS |
| Native／旧人物 | 通常252・漫画252・既存人物成人21構成 PASS |
| 第1回スマホUI | 360／393／430 × 640／800、6touch viewport PASS。作成・キャンセル・Undo等 |
| 簡易漫画 | 代表snapshot／Positive／Negative一致 PASS |
| 既存SW／PWA | 過去版から現SWへの9ケース PASS。第1回→第2回公開用cache更新とは別 |
| JavaScript／文字コード | 13 inline scripts＋SW構文、UTF-8／CRLF PASS |

元固定fixtureの展開後SHA-256 `e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832`、生成配列SHA-256 `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`に一致した。既存Character1390・人物基本外見1384・species94・Creature基本外見60・features275・候補500・共通adapter1444も維持。

試験結果は今回専用の別ディレクトリに保存し、元のexpectedや前回失敗記録を上書きしていない。検証環境準備時にcommit SHAの入力誤りでgit showが1回失敗し、fixtureを書き込む前に訂正した記録も残した。製品試験7群はすべてexit 0。

## 8. 保存互換性・成人向け制限

製品の変更は取込みスクリプト内のみ。保存version／namespaceの変更は行っていない。第1回の移行・保存・JSON・復元・Undo・拒否契約、R1のJSONとreload契約がPASS。既存人物成人21構成も変更なし。

既存試験でモチーフ人物のadultAccess deniedと元Creature保護を検証した。ただし第2回の衣装・色・再取込み固有の原子性、metadata／UUID維持、成人state維持の全契約は未試験であり、これらを全てPASSと断定しない。成人向け開放のコード変更は行っていない。

## 9. PWA・オフライン

既存9ケースは、旧R1のcache `seaart-tool-pwa-v4-stage5e-result-access-v1-http-cache-v1`から現cache `seaart-tool-pwa-v4-motif-person-v1-http-cache-v1`への更新を試験する。HTML取得失敗時の旧cache・未保存ドラフト維持、更新再試行、旧タブ共存、オフラインreload／保存等がPASS。

第1回mainと回収第2回のsw.jsは同一であり、上記試験は第1回→第2回の公開更新検証ではない。公開時は新HTMLを確実にprecacheし更新通知を出すためのcache名変更と専用の再試験が必要。必須第2回機能試験が未完了なので公開用cache名変更はまだ実施していない。

## 10. 実機未確認

実利用者のスマホ本体・インストール済みPWA・実保存データ・OS再起動は未確認。実機保存データのバックアップを実施したとは主張しない。公開URLで第2回の作成／再取込み／保存／履歴／JSON／生成／旧保存移行／reload／オフライン／再オンライン受入は未実施。

## 11. 未完了・中止事項と再開条件

回収済み製品と文書のGitHub保護保存は行ったが、指定保存対象一式は未回収。必要な不足物は次のとおり。

- 第2回新規テスト3ファイル。
- `tests/README-creature-motif-person-integration2.md`。
- `tests/results/creature-motif-person-integration2/`の元の検証記録・画像・失敗記録。

不足物を前回Codex環境から内容を消さずに回収し、本HTMLとの対応を確認した後、第2回固有の必須試験を実行する。今回作成する再実行手順は既存試験の再現用であり、未回収の第2回手順書を復元したものではない。

全必須検証が揃うまで、SW公開更新、main統合、第2回Pages公開、公開PWA受入を中止する。force push、reset --hard、clean、旧HTMLによる上書きは行っていない。専用ブランチの回収済みHTMLを保護したまま再開できる。

今回の記録：[recovered validation](tests/results/creature-motif-person-integration2-recovered-validation-20261011T112758Z)、判定表：[mandatory-validation-gates.json](tests/results/creature-motif-person-integration2-recovered-validation-20261011T112758Z/mandatory-validation-gates.json)、手順：[README](tests/README-creature-motif-person-integration2-recovered-validation.md)。圧縮した全文観測記録は期待baselineではない。
