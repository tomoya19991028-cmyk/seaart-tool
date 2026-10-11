調査日：2026-10-11（日本時間）。調査基点：GitHub main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。

対象：`tomoya19991028-cmyk/seaart-tool`。mainを新規cloneし、remote HEADを再照合した。製品コード・既存テスト・GitHubを変更していない。第2回モチーフ人物の未公開差分は基準に含めない。

本文の「現行」はコード確認結果。「設計案／推奨」は未実装。「要確認」はユーザー承認を要する仕様判断。設計案の関数名は新規API案であり、現行に存在する関数として扱わない。

# E. Codex向け更新指示書案

推奨環境：Codex。推奨思考量：High。

**この文書の作成は実装承認ではない。今回のWork工程ではコードを変更していない。以下はユーザーが対象工程を明示承認した後に使用する。**

## 共通指示（各回の冒頭へコピー）

対象repo：tomoya19991028-cmyk/seaart-tool。main/index.htmlを現在の正とする。開始時にmain HEAD、HTML blob・SHA-256・bytes、git status、既存テストを確認する。調査基点は5b5bb03589dcc9a661402395d6c3db20cfd4cf52だが、mainが進んだ場合は最新との意味差分を確認し、本仕様の行番号を照合し直す。古いHTMLへ戻して実装しない。

専用branch例：feat/horror-stage-h1-foundation。既存作業ツリーに未commit成果物がある場合は上書きせず、別worktreeを使う。承認された工程のみ実装・検証し、成果物だけcommit/pushしてremote HEADを確認する。mainへのmerge/push・公開PWA更新は別承認。承認がない工程へ進まない。

保護：Character1390、人物基本外見1384、species94、Creature基本外見60、features275、候補500、adapter1444、既存日本語名／value／固定ID、adult本番定義0、motif成人拒否、既存保存キー、既存生成fixture、7モデル×3分離、通常／漫画／簡易漫画。既存adult処理・内容を改修しない。

参考：A現行構造、B整合性とQ一覧、C仕様案、D検証計画。新規horror registryとstateは既存Creature features／profileへ混ぜない。元recordへの自動外見適用・負の全体tagによる除外・new BREAK構文・baseline再生成は禁止。

## 第1回 H0/H1：IDと保存保護だけ

実装目的：今後の怪異state・下書きを失わない保存基盤と安定漫画IDを整える。怪異UI／新タグ生成／ゴミ箱操作はこの回では実装しない。

開始条件：ユーザーがB Q1のroot v5＋新5key案、Q4/Q5の通常漫画1～6と非表示／削除区別を承認していること。未承認なら現在コードの読取確認と具体的な差分計画まで実施し、承認依存のschema変更は着手しない。

変更対象：index.htmlの保存foundation L1252～1511、normalizeManga L3774、captureWorking/restoreWorking最終wrapper、downloadJson/backupFileのvalidatorとtransaction、reset/presetがIDを落とさない経路。新規testsを追加する。

具体的実装：

1. 現行mainを固定検証しR1 wrapper＋固定fixture比較を実行。旧R1源・gzip期待値を変更しない。
2. horror schema1のvalidators／空stateを定義。確定working.horrorとsettings.horrorWorkspaceを分離。unknown schemaや危険keyは拒否。空の怪異は旧stateで未設定として扱う。
3. 既存actorExtensions v4／adult v1／humanProfile v1／actorFormCatalog v1を維持。motif entry whitelistへhorrorを追加しない。
4. 新settings.version5と新namespace、5キー文字列はC案を採用。旧v4 bundle専用readerを別に残す。新marker/journalで旧bundleを読まない。
5. 新bundleを最優先。壊れた新bundleから旧journalへ自動退避しない。新bundleなしの時だけ、旧確定bundleを別stateで検証・変換し新5keyへcommit。旧キーは削除しない。migration失敗時はRAM/disk/Undo不変か保存停止。
6. root v3/v4 importは新版でサポート。root v5 exportは現行旧版で明示拒否されることを試験。下書きがない旧importで現在workspaceを消さない。
7. mangaId／panel.idを任意追加fieldとして扱う。初回付与は明示利用時の1transaction、reload／import／Undoで保持。怪異未使用旧snapshotに無条件UUIDを挿入して固定baselineを変えない。
8. count減少は既存hidden slot方式維持。現時点のpreset／story／resetにおけるID方針をCに沿って明示し、勝手な番号対応／new UUID補修をしない。未知・重複IDを隔離して元資料を保持。
9. workspaceは自動保存対象、working snapshotからは通常除外。既存history・global Undoでworkspaceが巻き戻らないことを試験する。新しい下書きUIは不要。
10. 初回startup persistより前にnew validators/readersを使えるよう配置する。末尾wrapperだけでstartup migrationを直したことにしない。

変更禁止：怪異featureタグ・成人生成・既存candidate変更・新成人許可・通常/漫画の出力本文変更・SW cache名の先行公開変更・main更新。新形式を旧5keyへ書き戻さない。

動作確認：T01/T11/T12/T24/T25/T26/T29に加え、5key別障害・migration途中・stale tab・rollback failure。root schema変更による旧テストのversion assertionはportability/schema adapterで理由を明記し、実質assertionや固定全文を弱めない。

完了条件：ID・保存の必要契約がPASS、元R1生成全文／12deep fingerprint一致、旧HTMLが新5keyを触らない、workspaceがhistory/Undoから巻戻らない、製品変更範囲と保存hashを報告、専用branch remote HEAD照合済み。未接続UI/生成は未実装と明記。次H2は別承認。

## 第2回 H2/H3：resolverと基本UI

目的：怪異設定を元外見と分離して編集可能にする。変更対象は新registry／resolver／専用UI＋showMobileTab限定CSS＋候補adapter。B Q2/Q3/Q6/Q7/Q8/Q9の決定を前提とする。

実装：Cのstateと構造三値、primary1/secondary2優先表示、source付き元feature policy、競合一覧、3ページ6カード、独立怪異作成、selected tags／×／weight。既存context setterへ人物IDを仮装して渡さない。候補が未確定なら自分で大量生成しない。

禁止：生成接続、成人資格変更、旧候補rename、元profile破壊。検証：T02～T04/T19/T28、6viewport、search autofocusなし。完了：pure resolverとUI保存・取消・Undo、actor独立、元候補deep不変。新生成はまだ未接続と報告。

## 第3回 H4：通常生成

目的：確定怪異overlayを対応actorのblockだけへ出力。変更対象はgenerateの単独／複数／Krea／strong、normalSubjectOutput、人物／Creatureのsource-aware appearance adapter。

実装：normal最優先ゲート、state条件・構造・競合、明示semantic重複整理、個別重み。怪異未設定は元producerへ直接委譲。raRunGenerationのrollback／resultAccess／historyを迂回しない。

禁止：成人／global Negative／品質／BREAK文法変更、draft出力。検証：T01～T04/T23/T26。完了：7×3、全単独／複数経路、source独立、旧全文一致。

## 第4回 H5：通常漫画

目的：安定IDでコマstate・features・rangeを生成まで接続。変更対象はmanga normalize/editor、panel ID→index解決、preset保持、composeのRAM画像配置、generateManga／mangaCreatureIdentity。

実装：inherit/on/offとpayloadコピー、normal固定ON抑制、影響コマpreview、前後から未確認候補の提案、range inclusiveと端点不明保留、shared identityの不変部分／コマ差分分離。全体／コマ単独は同resolverを使用。

禁止：簡易漫画の新連携、7コマ以上、勝手な原作形態適用、成人漫画タグ変更。検証：T05～T08/T21～T23/T27。完了：通常コマ混入なし、ID誤移動なし、preset・damage・人物独立と簡易漫画全文不変。

## 第5回 H6：下書き・差分・部分確定

目的：未確定項目をdurable独立storeへ保存し、確認済み有効subsetだけ原子的に適用。変更対象はhorrorWorkspace UI／planner／transaction／draftUndo／partial receipts。

実装：originalRefs不変とmapping、項目ごとのbaselineと実依存selector、局所digest再照合、原因group＋例外、確定前subset変更の再確認、1partial commit1漫画Undo、残draft保護、saved confirmed文字列非信用。

禁止：draftから直接生成、global working snapshotでworkspace全体をUndo、名前／コマ番号auto mapping。検証：T09～T12/T19/T20＋全保存障害。完了：アプリ終了後保持、対象不明無期限、漫画本体無作用、partial rollback一貫性。

## 第6回 H7：統合・削除・救出

目的：任意同梱の下書き／trashのimportと30日管理。変更対象はsave/export options、merge planner、item tombstones、trash、recoveryPending。

実装：draft/trash初期OFF独立、ancestorありの3way比較とancestorなし競合、同deleteIdの期限不変、古backup自動復活禁止、未確認として明示復活、30日trash、期限切れbackupの3選択、救出新draftと元日時保持、項目別review再計算。

禁止：有効trashをquotaで消去、保留の自動救出、orphan期限削除、mergeによる漫画自動変更。検証：T13～T20/T24/T25＋日時mockと障害。完了：各選択と期限境界、mergeUndo独立、旧backup再読込no-op／適正競合。

## 第7回 H8：総合検証・最終調整

目的：DのT01～T30を統合検証する。変更は再現した不具合の最小修正とテスト補強に限定。固定baseline差を隠す更新は禁止。

6viewport、実SW/offline、旧HTML共存、実interleaving、quota/recovery、結果表示/copy/historyを確認。実機・公開originで確認できない項目は未検証と記載。SW更新は公開承認の前に具体的な更新案と検証を準備し、main／公開PWAへ反映しない。

完了報告：基点／専用branch／commit／remote HEAD、変更ファイルhash、保存schemaとmigration、旧生成比較、候補fingerprint、実装済み／未接続／未検証、公開前注意。main反映は別途ユーザーの明示承認を待つ。
