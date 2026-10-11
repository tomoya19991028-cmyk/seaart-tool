調査日：2026-10-11（日本時間）。調査基点：GitHub main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。

対象：`tomoya19991028-cmyk/seaart-tool`。mainを新規cloneし、remote HEADを再照合した。製品コード・既存テスト・GitHubを変更していない。第2回モチーフ人物の未公開差分は基準に含めない。

本文の「現行」はコード確認結果。「設計案／推奨」は未実装。「要確認」はユーザー承認を要する仕様判断。設計案の関数名は新規API案であり、現行に存在する関数として扱わない。

# D. 段階的実装・総合検証計画

## 1. 依存関係と順序

UIより先にID・保存・純粋resolverを固める。下書き機能の後で保存を付け足す順序は、データ損失を生むため避ける。以下は別途承認後の計画であり今回実施していない。

| 工程 | 目的／変更対象 | 依存・リスク | 完了判定 | 推奨 |
|---|---|---|---|---|
| H0 最終承認・baseline | Q1～Q12、初期候補／value／構造条件を確定。main照合・R1固定 | 未決定のschemaを先に実装しない | 基点・承認範囲・固定fixtureが確定 | Work High→Codex High |
| H1 ID・保存基盤 | mangaId/panelId、working.horror、settings.horrorWorkspace、v5/new5key案、旧reader、transaction | H0。旧PWA・quota・migrationが最大リスク | v3/v4読込、新5key原子保存、旧HTML共存、怪異未設定全文一致 | Codex High |
| H2 resolver・候補基盤 | source-aware feature schema、state／構造／競合、確認dependencies | H1。文字列だけの元特徴mask不可 | normalゼロ、元state不変、三値・条件・重みを純粋試験で確認 | Codex High |
| H3 基本UI・対象連携 | 独立タブ、3×6カード、人物／Creature／独立怪異、候補adapter | H2。スマホnav幅、motif strict validator | 6viewport・no autofocus・候補値不変・別actor独立 | Codex High |
| H4 通常生成 | generate、normalSubjectOutput、profile/Creature adapter、Krea/strong | H3。単独経路の漏れと属性混線 | 7×3全経路、対象block、未設定固定全文、Negative不変 | Codex High |
| H5 漫画連携 | ID操作、コマ別state/override、shared identity、コマ単独、range | H4。index参照・画像合成・preset undo | reorder/insert/delete、normal抑制、全体／単独整合、簡易漫画不変 | Codex High |
| H6 下書き・部分確定 | 差分plan、確認hash、独立Undo、transaction receipt、manual mapping | H5。部分更新・global Undo混線 | 変更直前再照合、残item保持、成功1Undo、障害原子rollback | Codex High |
| H7 merge・trash・救出 | 名前付きsnapshot/export options、merge、tombstone30日、trash30日、保留 | H6。古いbackup・期限延長・容量 | 3way比較／ancestorなし競合、期限boundary、明示救出、孤立無期限保持 | Codex High |
| H8 総合・公開準備 | R1全回帰、PWA更新、旧タブ、offline、容量、6viewport | H1～H7。公開originの差 | 必須検証PASS、専用branch remote照合。mainは別承認 | Codex High、公開判断Work High |

H1～H7は機能flagとstage別entryで進め、未接続の下書きが生成に混ざらない。コードの公開を工程完了と混同しない。最初のCodex指示はEのH0/H1限定を使う。

## 2. 変更予定箇所

index.html：保存foundation（L1252～1511）、capture/restore（L3654／各wrapper）、normalizeManga（L3774）、漫画の作成／preset／editor／生成（L4198～4327／5597）、人物／Creature出力adapter（L1209／3424／3547／5500）、UI CSS／showMobileTab（L3／2623）、Undo（L5672／6366）、JSON import/export（L3661／8884／9288）。

怪異専用registry・resolver・workspace関数を小さく新設する。成人処理と既存候補の本文は編集対象にしない。final function bindingは既存末尾wrapperを尊重する。全UI共通化などの大規模リファクタリングはしない。

sw.jsは公開準備段階でだけ更新名・shellの整合を確認する。manifest／アイコンは変更不要の見込み。実装branchのローカルSW更新と本番公開は別。既存testsは削除／baseline再生成しない。

## 3. 回帰テストの必須表

以下は将来テスト計画であり、今回の怪異試験PASSを意味しない。

| ID | ケース | 必須期待結果 |
|---|---|---|
| T01 | 怪異未設定・旧v3/v4 | 通常210／漫画210／コマ420、固定全文・12deep fingerprint同一 |
| T02 | 怪異解除／normal | 元人物・Native・semi/fullは残る。固定ON保存値も残り、怪異outputゼロ |
| T03 | 同種Creature2／人物2＋Creature | actor ID別にfeatures・weights独立、他blockへタグ移動なし |
| T04 | 三値構造 | unsetとabsentが別。元翼と追加翼のorigin別。矛盾は自動修正なし |
| T05 | コマ追加・削除・並び替え | panel IDと外見・登場・damage・story・画像配置が同じ主体に付随 |
| T06 | countを減らす→増やす | hidden slot復帰。明示削除と区別 |
| T07 | 基本feature変更 | 変わるコマとparameterだけ検出。normal outputはゼロのまま |
| T08 | 一括固定 | before/afterと原因group、例外選択。基本変更と固定は別Undo |
| T09 | partial commit | 確認済み有効subsetだけ1Undo。未確認／競合／不明は残る |
| T10 | 確定直前変更 | owner/feature/state/target/dependencyが変われば再確認。自動再承認なし |
| T11 | 下書き保存・reload・pagehide | durable復元、漫画・profile・生成に無作用 |
| T12 | 下書きUndo／漫画Undo | 互いに無関係項目を消さない。基準変更の影響itemだけ再評価 |
| T13 | 同draftId merge | 非競合候補と同field競合。日付／revisionだけで上書きしない |
| T14 | 同ID・ancestor欠落 | 完全同内容no-op。それ以外は安全な競合確認 |
| T15 | item tombstone | 30日未満・直前・丁度・超過、古backup自動復活なし、期限延長なし |
| T16 | trash | 30日内明示復元、期限切れlocal整理、容量不足で有効trash無断削除なし |
| T17 | 期限切れbackup | 救出／読まない／保留。救出はactive未確定、元日時保持 |
| T18 | 救出review | 同基準だけvalid、影響itemだけ再確認、不足pending、未確認保持 |
| T19 | 対応先不明 | actor/panel/feature/manga削除後も無期限保持、生成／確定禁止 |
| T20 | 手動mapping | 元Refs保持、名前／番号autoなし。関係先依存のみ再確認 |
| T21 | range | 内挿入、外挿入、端削除、逆転、normal、off例外、transient非継続 |
| T22 | 漫画全体／単独 | 共通identityに通常コマを汚す変化tagなし。resolver値一致 |
| T23 | 7モデル×3分離 | 単独／複数／Krea／strongを網羅。既存BREAK・品質・Negative保護 |
| T24 | 書出しoptions | draftとtrash独立OFF。draft ON/trash OFF、逆、両ONすべて検証 |
| T25 | 不正JSON | unknown version、ID重複、future日時、危険key、>10MB、未登録featureを拒否／隔離 |
| T26 | 成人／result protection | motif拒否・本番定義0・receipt非復活・history/copy保護を緩和しない |
| T27 | 簡易漫画 | snapshot／Positive／Negative全文が変わらない |
| T28 | 6viewport | 360/393/430×640/800でdialog／tag／footer重なりなし、navだけ横scroll |
| T29 | 旧PWA共存 | main旧版・第1回・第2回branch・旧stage版による新5key破壊なし |
| T30 | offline | app起動・draft編集・merge・trash復元・保存、再起動、session grants非復活 |

新たな生成期待値は新機能専用に作る。旧固定fixtureは変更しない。候補・12dataset・adapterは未変更ならdeep同一。horror registryが増えることを既存マスター件数変更として扱わない。

## 4. 障害注入と保存合格条件

settings／working／history／marker／journalの各setItem・removeItem、quota、JSON encode／validate、描画例外、二重click、pagehide、別タブrevision、lease失効、初回migration、rollback自身の失敗を注入する。

各ケースは操作前RAM・disk5キー・漫画Undo・draftUndo・workspace・成人Map／result indexを取得。成功は一貫した1bundleだけ、失敗はbeforeと完全一致、または復旧journalを残した保存停止状態であること。保存停止中に編集を続けて次saveで上書きしない。partial commit・merge・restore・purgeにも同じ注入を行う。

localStorageは複数キーの真のACID transactionではない。現行journalはlease検証と復旧を提供するが、同時起動を無条件に排除する保証ではない。navigator.locksが使える場合はorigin単位mutexを検討し、使えない場合も現行revision/所有journalチェックで競合を中止する。両タブread同revision／write割込の実interleavingを試験する。

large workspaceはRAM／diskのprevious+next journal複製を含めて測定する。容量上限を超えたとき有効trash／orphanを消して救う方式は不可。exportと不要dataのユーザー操作を案内する。

性能試験案：下書き1,000項目、複数draft・trash・orphanを含む合成データで、startup／検索／差分作成／局所再確認／保存journalの時間とbytesを記録する。これは容量上限の決定ではない。ID索引Map、必要項目だけのdependency計算、長い一覧の段階表示を優先し、候補検索のたびに全履歴を再hashしない。実機未確認時にスマホ性能を保証しない。

## 5. 公開前／公開後

公開前：固定回帰、v3/v4 migration、v5旧版拒否、新namespace旧writer隔離、mixed journal拒否、SW install失敗→再試行、6viewport、旧tab共存、offlineをローカル試験。保存キー・UTF-8/CRLF・ファイルhash・remote専用branch HEADを報告。

公開後だけ確認：GitHub Pagesの実配信commit／HTMLhash、実origin HTTP cache、SW controller更新、スマホホーム画面、実機キーボード、実offline起動とOS再起動。今回と実装branchだけでは公開後PASSにしない。

rollback：旧HTMLを新namespaceへ書かせない。配信rollbackとデータrollbackを分離する。旧版で新怪異データを編集・exportして往復することは保証しない。新bundleは残し、ユーザーが新対応版へ戻ったとき復元する。migration前旧bundleへの切替は明示選択とバックアップを前提にする。

## 6. 中止条件

未設定baselineの差、候補fingerprintの無関係な差、adult資格緩和、通常コマに怪異tag混入、別actorへfeature混線、参照を名前だけで自動対応、quotaで部分更新、未確認draftの生成使用、期限の自動延長、Undoで残draftを消去、old writerによるnew key破壊、schema未承認。

中止時は固定baselineを更新して通さず、原因と変更必要範囲を報告。main反映は完了条件に含めず、別途明示承認が必要。
