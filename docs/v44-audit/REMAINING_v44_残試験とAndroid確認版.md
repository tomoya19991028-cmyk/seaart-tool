# v44 残試験の追補とAndroid確認版

PR #1・`codex/seaart-v44-full-audit`の続きです。作業開始時のPR HEADは`e584b955140d5d359be411c38b1191a4082c40a1`、mainは`894d5fbfdfa65e68a50b77acdaa3e497ed31aeca`。open・draft・未mergeを再取得して確認しました。未監査の添付を製品へ戻していません。

## 今回修正した製品と試験

| ID | 製品不具合・再現 | 修正と回帰 |
| --- | --- | --- |
| B07 | mainのCSV取込で`"不正な行","value","閉じない`が有効行として追加される | `parseDelimited`で閉じていない引用符を解析時に拒否。取込前後の全カタログ・各追加定義・working・保存ディスクを比較。通常の引用符／カンマ／改行・日本語・BOM・重複・空値・保存失敗は別試験 |
| B08 | 簡易漫画の候補CSVをBOM付きで貼り付けるとヘッダーが1候補として追加される（2行の予定が3行） | `cmParseRows`で先頭BOMだけを除去。貼付と実ファイルの往復、編集前の候補全体とメタデータ、重複、引用符エラーを比較 |
| B09 | 簡易漫画の保存失敗時、保存データは残るが`saveStatus`要素がないため警告が表示されない。追加した編集はRAMに残る | 保存失敗時だけ永続した`role=status`の警告をヘッダー直後と開いているdialog内に作成。成功時は非表示。既存ディスク・候補を保持し、未保存RAMも捨てない。隔離したquota注入で可視性と内容を検証 |

新しい機能・候補、保存schema・namespaceは追加していません。B01〜B06、他ownerの固有候補、カード配置と保存・出力制御を保持しています。変更は保守ソースのアンカー付き差分に反映し、37script順序を維持しています。

試験側では、旧6カードの期待を現行8カードへ、通常の内部ラベルによる分割を人物名・種族と属性の対応へ、旧cache名をscope付き名へ更新しました。旧ファイルは編集せず、理由を明記した`tests/v44-remaining/replay.cjs`を使用します。起動timeoutの延長でPASSにしていません。
初回の新しい試験実装にも、旧カードIDの取り違え、labelの完全一致、存在しないDOM ID、未登録のテスト候補等のfixture不備がありました。モチーフの人数要約にも人物名が出るため、単なる名前の回数では本文を識別できず、成人種別＋名前の本文識別子へ修正しています。これらは製品不具合と分けて記録します。

## 13 FAILと1 SKIPの対応

原記録のコマンド、元製品SHA、原テスト／adapter SHA、失敗case・assert・ログ抜粋とログSHAは[原失敗・SKIP](../../validation/v44-remaining/original-failures-and-skip.json)に保存しました。元の`validation/v44-audit/inherited-attempts.json`、baseline、原テストは残しています。

| 原ジョブ（原FAIL/SKIP） | 原失敗assert・case | 判定と現在の検査 |
| --- | --- | --- |
| r1 | `shared six-card candidate adapter unchanged` | 仕様変更。実際は`pgAdultDefinitions()`の6要素配列一致で停止した。前報の「関数本文の一致」とした説明を訂正。現行8区分だけを更新し、権限・draft拒否・owner/mode独立・Undo・保存・取込・read-only・marker非出力を維持 |
| legacy | `catalog`の完全一致、追加pose行を拒否 | 仕様変更。保全添付v44をbeforeにして全データ・通常252・漫画252・確認制御を比較。旧mainの全行保持は主スイートfeaturesで独立検証 |
| unified-compatibility | UC01 tables、UC02 producers、UC03〜07全文（UC08 storageは旧PASS） | 仕様変更。保全v44との全表・producer・通常／Native／semi／full／怪異／漫画の比較。実動作は主スイート・属性試験でも確認 |
| auto-compatibility | AC01 36行の全文deepEqual | 仕様変更。保全v44を独立参照にしてresolved・通常・漫画・全コマを比較。旧36構成と非空の特徴は残す |
| prompts | P01〜08、旧ラベル分割が`1 !== 4` | 仕様変更。モデルごとのBREAK有無に依存せず、成人種別＋Attribution A/Bの本文識別子とghost本文の唯一性・順序、各属性の所属を確認。怪異の非混入・元設定read-only・漫画ラベル・コマ不在・重み・置換／除外を維持 |
| motif-prompts | P01〜08、同じ旧ラベル分割 | 同上。APIから取り込んだ2人を使い、元Creature・モチーフの所有情報を維持した同じ検査 |
| auto-contracts | A07/A08 goto load 30秒timeout、A27 explicit actor blocks | A27は仕様変更。ラベルだけを置き換え、A/B所属・negative・抑制・Undo全文一致を維持。A07/A08の旧タイムアウト原因は未確定で、原assertの反復結果を別記 |
| auto-ui | AU-360x640-1 goto load 30秒timeout | 原因未確定。原ソース・同じ360×640・mobile/touch・scale1で反復。他のviewportも元の試験で検証 |
| unified-pwa | reload後のworking/workspace文字列一致 | 既知の初期値補完。adultSceneのsoundEffect/reactionEffectの配列・soundEffectText/reactionEffectText、および各Creature adult semi/fullの同2配列について、undefinedの場合だけ既定値補完。他は全件比較。非空の同項目・free textは独立の全working再読込一致で検証 |
| card-pwa | `caches.keys().includes(旧固定名)` | 仕様変更。root scope名へ対応させ、それ以外のoffline・選択／解除・Undo・再読込の原assertを維持 |
| normal-pwa | 同じ旧cache名 | 仕様変更。通常／漫画・保存・UUIDの原assertを維持 |
| pwa-regression | 新cache待機で`SW condition timed out` | 仕様変更。ネストしたreplay先も含め現行scope名を適用。実SWのinstall失敗→再試行、旧画面の未保存draft、旧タブの保存競合、offline編集保存を維持。別アプリcache保護は主PWA試験 |
| round2-retest（代替） | M14、新state→旧参照が`成人設定に未対応のfield`を拒否 | 逆方向非対応。元試験が欠けた時に作った代替である出自を維持。現行比較は保全v44参照と手動プロフィールに対して実行。実旧main→新版、および新typed pose→実旧mainの拒否後RAM・disk・Undo保持を独立検証 |
| fixed（SKIP） | r1失敗に依存して未実行。旧CRLF／生のproducer／全文hash固定も現行仕様に不適合 | 独立実行するFIXED試験に置換。保護済みgzipのSHAと旧全文hashを保持し、12データセットを旧fixtureから比較。既知の表示差はbustのラベルとfacing each otherの分類だけを明示。producer・構文・LF・生成は現在の品質／R1／属性試験へ対応。旧書式の全文一致を現行要件として主張しない |

上表の「保全v44」は修正前の添付SHA`0c8b08ee906737152aa7b0971edafbc611868c8c524b3fb7f850586f0b5ede5e`です。`e584b95`の既知バイトから、保全原本との差分6箇所だけを逆適用するfixtureで再現し、そのSHAを照合します。現行の出力をgolden化せず、製品には一切投入しません。旧mainと当該fixtureは別資料です。

R1/legacyの既存adapterが行う承認済み追加行の投影は残しています。完全な現行データは主スイートで別に検証します。
旧R1固定fixtureではbustラベル「胸の大きさ（成人のみ）」→「胸の大きさ」、facing each other分類「関係」→「向き・姿勢」だけを明示的な表示差として許し、他データは除外しません。この期待は元のv44仕様にも存在するもので、修正後の出力を丸ごと採録したものではありません。

## 初回CIと再現状況

初回run `40215568009`のrun/jobログを再取得し、artifact APIも確認しました。artifactは0件、ログには`include-hidden-files: false`と`No files were found`があります。UI 12 PASS／1 FAILまでは分かりますが、case ID、assert、画面が記録されていないため初回原因を特定できません。B05が初回原因だったとは断定しません。
現在のUI全14件を5回、毎回fresh contextで実行し70 PASSでした。さらに原A07/A08と原AU-360x640-1を各5回ずつ検査して15 PASSでした。反復PASSで過去の原因を解消済みにはしません。

今後の失敗はcase ID・expected/actual・console/pageerror・request failure・可視dialog／共有ボタン状態・screenshot・traceを保存します。BOOT失敗も採録します。意図した隔離assert失敗を起こして採録経路を検証し、その子試験の期待FAILを製品FAILと混同しません。CIはhidden filesを含め、証跡が無ければartifact uploadをFAILにします。

## 補った未網羅経路

- main CSV：表示名／英語タグ／分類の3列。日本語・カンマ・改行・引用符・BOM・空分類、重複・不正・取消、ID維持、編集値の書出し、detail／negative、保存失敗時のRAM・diskを検査。XLSXは今回新たに全経路を再監査していません。
- 簡易漫画：Shadow DOMと専用キー`seaart-studio-mobile-v2`。人物、背景カード独立コピー、漫画種別、生成、専用候補CSV、名前付き保存、専用JSON出入、再起動、リセット取消と設定保持を操作。mainのworking全体と同じ画面操作中の保存キーを比較。再読込時の通常ライフサイクルのrevision更新は専用UIへの混入と混同しません。
- 画像合成：既存I08/I09/I10/I11/I12/I28を最終バイトで再実行し、PNG・pixel・並べ替え・削除・Undo・保存失敗・pending decode・再読込を確認。新規補助試験はファイル取消、戻る／再表示、壊れた画像、合成PNG書出しを対象にします。画像・配置はセッション専用で、main JSONに保存されるとは説明しません。

## 実行結果と成果物

最終製品HTMLは **4,390,465 bytes**、SHA-256 **`62d6c8f24402326f08e48255a4bab21d905862c47df5a88e76e18da5f501e52a`**。SWは前回監査版のまま`8fe1d284721b17791b82ad53af81abe9380bcc03b45c5837348d31bbbbe3c807`です。別出力へのクリーンビルドはbyte一致しました。

| 集計単位 | 今回のローカル実測 | 記録 |
| --- | --- | --- |
| 主スイート | 555 PASS／0 FAIL／1 SKIP | [main-final.json](../../validation/v44-remaining/main-final.json)。file://は管理ポリシーのためSKIP。最終CIで別に確認 |
| 現行向け継承 | 14ジョブPASS／0 FAIL／0 SKIP | [current-inherited-local.json](../../validation/v44-remaining/current-inherited-local.json)。旧FAILに対応する13ジョブと画像6ケースの1ジョブ。R1は49契約・通常210／漫画210／コマ420、legacyは通常252／漫画252等。試験側の版は各実行SHAで区別 |
| 補助 | 16 PASS／0 FAIL／0 SKIP | [supplemental-final.json](../../validation/v44-remaining/supplemental-final.json)。独立FIXEDはこの内数。CSV5、互換3、簡易UI4、画像3、採録経路1 |
| UI反復 | 14件×5 fresh context＝70 PASS | [repeats-final.json](../../validation/v44-remaining/repeats-final.json)。全回0 FAIL |
| 原タイムアウト箇所の反復 | A07／A08／AU-360x640-1を各5回＝15 PASS | 同上。10ジョブに分割。各caseの30秒navigation timeoutは維持 |
| 元41ジョブ | 元の27 PASS／13 FAIL／1 SKIPを保持 | [全41ジョブ対応表](MAPPING_v44_旧41ジョブ.md)。前回PASSの全件再実行とは主張しない |

主スイート・補助・継承ジョブ・反復の数値は合算しません。すべて上記の最終製品SHAで確認しています。継承試験の途中に試験側の識別条件を修正したため個別のadapter版を保存し、最終commitのCIで全ジョブを最終adapterから再実行します。ローカルのgit HEADは作業開始時の親commitを指すため、製品・試験のSHAと区別します。

試験管理の不備として、14ジョブのまとめ実行へ設けた30分上限が親サーバーを終了させ、後続のauto-uiに接続拒否が出た試行を残しています。これは初回CIの不明な失敗とは別です。ファイル単位の15分監視・入力SHAの開始前記録・途中結果保存へ修正し、元caseの待機条件を変えず、影響したUI・PWA全5ジョブを再実行しました。製品変更が途中で入った試行も最終PASS集計から除外しています。[additional-attempts.json](../../validation/v44-remaining/additional-attempts.json)参照。

最終CIのURL・HEAD・結論は[PR #1最新checks](https://github.com/tomoya19991028-cmyk/seaart-tool/pull/1/checks)とPR本文を参照してください。過去の成功runを新commitの結果として使いません。


```sh
npm ci
npm run build:check
npm run test:quality
npm run test:audit
npm run test:remaining
npm run test:stability
python3 scripts/package-android-check.py NEW_DIRECTORY
```

製品と同一バイトの`SeaArt_v44_Audited_Android_Check.html`、同commitの6資産を含むZIP、元commit・bytes・SHA256.json、短い確認表をCI artifactとして提供します。重複HTMLやZIPをGitへcommitしません。artifactのcommitはPR headを明示的にcheckoutしたものです。

mainへのmerge・draft解除・Pages/Sites/PWA公開・公開設定変更は行いません。Android実機・実IME・SeaArt/PixAI実画像は未実施で、次のユーザー確認工程です。旧→新の互換と新→旧の非対応、コード復旧と更新前JSONの復旧を分けて扱ってください。
