# 怪異＋モチーフ第2回：保存・移行安全性

判定：隔離された模擬データで、指定の保存・復旧・移行・操作交差を検証しPASS。実利用者の保存データは使用していない。スマホ本体のデータをバックアップしたとは主張しない。製品commit `f1de74cb99d2d4e89c5be36aaa65e2a2cea40405`。

## 保存形式とキー

settings／backupはversion 5、actorExtensionsは既存version 4、horror state／workspaceはversion 1を維持。motif metadataはversion 1、UUIDとrecord／profile／extensionの一致・adultAccess deniedを維持。キーとnamespaceは怪異側のものから変えない。

| bundle要素 | キー |
| --- | --- |
| settings | `seaart-prompt-builder-v5-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1` |
| working | `SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1` |
| history | `SeaArt_generated_prompts_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1` |
| marker | `SeaArt_actor_forms_commit_creature_adult_v1_result_access_v1_motif_person_v1_horror_v1` |
| journal | `SeaArt_actor_forms_recovery_creature_adult_v1_result_access_v1_motif_person_v1_horror_v1` |

モチーフ作成・再取込みは`hTransaction`を経てv5 bundleへ保存する。第2回のv4専用キーで保存し直さない。workspaceはsettings側で確定設定／通常Undoと分離し、人物・Creature、mangaId／panelIdはworking・名前付き保存・履歴で維持する。

## 旧データ・名前付き保存・履歴

| 対象 | 実行した確認 | 結果 |
| --- | --- | --- |
| v3旧writer | I24・第1回移行8、working／お気に入り／履歴 | PASS、旧bytes保持 |
| v4 main・第1回 | 第1回移行・I24、失敗・途中bundleでblocked | PASS、旧キー非削除 |
| v4第2回 | Z10：実保存済みモチーフ衣装／部位、UUID、名前付き保存、生成履歴 | PASS、v5移行・旧5キーbytes不変 |
| 怪異側v5 | 旧怪異→統合の実SW更新、workspace・UUID・コマID | PASS、同namespaceで保持 |
| 統合v5 | Z09・Z12・Z18、保存・履歴復元・JSON・reload | PASS、両機能と未解決データ保持 |
| 旧版writerとの共存 | T29：異なる4世代を実際に同originで保存 | PASS、新5キー不変 |

未知schema、重複ID、不正metadata、危険key、不正日時、10MB超を拒否する。motif由来IDの通常化、adult metadata欠落／許可値注入、通常人物への再取込みは拒否。移行失敗で旧データを削除せず、新bundleが不正なら黙って旧保存へfallback・初期化しない。

古い怪異v5で確認されたモチーフ下書きに一般外見依存がない場合、統合版では再確認になる。下書きそのもの・UUID・削除履歴を消さず、以前の確認を新しい外見の承認として扱わない。

## 原子性・rollback・journal

settings／working／history／marker／journal、journal作成・refresh・remove、encode・validation・render、容量、別writer介入を14障害試験で再実行した。第2回再取込みでもZ03で5キー・render・stale、作成はZ04、UndoはZ14で変更前を保持することを確認した。失敗時は成功toastを出さず、通常／下書きUndoを余分にpopしない。

Z17は再取込み保存をworking段階で失敗させ、rollbackのsettings書込も失敗させた。操作を拒否してRAMを戻し、blockedとjournalを保持。注入を解除してreloadすると以前の完全v5 bundleとモチーフUUID・profile・下書きを復旧した。復旧情報を勝手に削除・初期化しない。

I20では実transactionの6中間保存状態を別contextで起動し、4地点は以前、marker確定後2地点は次の一式へ復旧した。I29は隔離Chromeの実容量を使い切り、実QuotaExceededErrorで保存拒否と旧bundle保持を確認。どちらも利用者データやスマホの物理電源断を使った試験ではない。

Z13は実2タブで勝った下書き保存を保持し、古い側の再取込みを拒否してreloadで復元した。JSON File.text待ち中の作成・再取込みはZ11、実通常入力欄のキー入力はI34〜I36で拒否・解除・rollbackを確認。

## 保護対象・Undo・JSON

Z18で人物・metadata・元Creatureと、通常下書き、孤立下書き、ゴミ箱、削除記録、救出保留を作り、再取込み→保存→reloadで保持した。対応先不明データを名前一致で自動対応させず、manual mapping後に再確認する。30日履歴・期限切れ救出・古いbackupからの再削除防止・3way mergeはT群とI群で再検証した。

Z05／Z06／Z07／Z14では、通常・receipt・下書きUndoの交差、10件上限、保存失敗を検証。通常Undoがworkspaceを戻さず、下書きUndoがprofileや確定receiptを勝手に戻さない。UUID・コマID・画像配置との対応を維持する。

Z12は両機能を含むv5を実ファイルから読み込み、選んだ下書き／ゴミ箱をプレビュー後に統合して確認した。名前付き保存・履歴の元データとadult拒否も保持。通常exportでは下書き／ゴミ箱は利用者が選んだものだけを含め、救出保留の全件自動exportへ仕様変更しない。復旧資料の書出しは別経路。

## オフライン・画像の範囲

隔離originで旧怪異SWから統合SWへ更新し、両機能のprofile／怪異／workspace／コマIDを保持。offlineで第2回再取込み→再確認→部分確定→下書き追加→保存し、reload後も全設定とdeniedを保持した。online復帰でも不変。PWA既存9ケースとT30もPASS。

画像・配置、通常Undoと下書きUndoはsession限定。JSONやreloadで画像blob・永続Undoを復元する新機能は追加しない。session内では実PNGの画素とIDを比較し、移動・削除・連続Undo・decode中の再取込み・保存失敗でも別コマへずれないことを確認した。

実機の保存容量・IME・OS picker・端末再起動は未確認。公開前は利用者がJSONの保存先を確認し、[Androidチェックリスト](CHECKLIST_怪異モチーフ第2回_Android実機確認.md)で確認する。main・公開PWAは未変更。

証跡：[総合検証結果](REPORT_怪異モチーフ第2回_総合検証結果.md)、[機械集計](validation/horror-motif-integration/summary.json)、[証跡索引](validation/horror-motif-integration/README.md)。
