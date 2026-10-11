調査日：2026-10-11（日本時間）。調査基点：GitHub main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。

対象：`tomoya19991028-cmyk/seaart-tool`。mainを新規cloneし、remote HEADを再照合した。製品コード・既存テスト・GitHubを変更していない。第2回モチーフ人物の未公開差分は基準に含めない。

本文の「現行」はコード確認結果。「設計案／推奨」は未実装。「要確認」はユーザー承認を要する仕様判断。設計案の関数名は新規API案であり、現行に存在する関数として扱わない。

# C. 怪異タブ・漫画・下書き管理 最終仕様案

## 0. 仕様の位置付け

ユーザー指示の必須要件は以下に具体化する。BのQ1～Q12は未決定で、対応箇所は【承認待ち】。未決定案を確定済みとして実装しない。新機能は未実装であり、C記載のAPI／schemaはすべて設計案。

## 1. 画面構成

独立screen `horrorSection`、内部page1～3、各page2列×3行。上部は対象selector、ページ番号、短い状態要約。常設管理ボタンを増やさず、作成・削除・管理は対象dialog／下書きdialogへ置く。

| page | 6カード案 | 操作 |
|---|---|---|
| 1 基本 | 対象／変化状態／主種類／補助種類／変化強度／元の外見 | 対象は人物・Creature・独立怪異を分類。作成は対象dialog内 |
| 2 特徴 | 頭・顔／目・口／皮膚・体表／四肢・体型／翼・角・尻尾／演出・動作 | 身体構造の三値、features、適用条件、競合を選択dialog内で表示 |
| 3 漫画・下書き | 登場コマ／コマ別状態／継承・固定／一貫性範囲／差分・部分確定／下書き管理 | ゴミ箱／救出／対応先不明は下書き管理dialogの絞り込み |

【承認待ちQ6】既存5タブを改名せず、第6「ホラー・怪異」を追加。横スクロールはタブnavだけに限定し、選択タブを見える位置にする。文書全体には横スクロールを作らない。少なくとも隣のタブ端／スクロール可の手掛かりを示す。tab押下でページ本体のscroll位置を保存復元する。

カード枠・配色・タグ・×・重み・検索・分類・すべて／選択中／★は既存UI準拠。dialog75～85dvh、header/footer固定、body1個だけスクロール。footer actionsは折返し可能、min-width:0、overflow-wrap。閉じる／保存／確定は別名称と役割。searchへ自動focusしない。閉じる際は起動buttonにfocusを戻す。新規主要操作44px以上。

6viewport（360/393/430×640/800）、portrait、ダークテーマを合格対象にする。下部固定操作バーが通常生成と漫画生成を現行どおり使う。怪異タブからの生成先は上部に「通常画像／漫画」を明示する案。下書き保存ボタンを生成バーへ混ぜない。

## 2. 対象と軸

人物・Creatureの元recordとIDは保持する。怪異外見は別overlay。原作形態、Creature representation normal/semi/full、怪異normal/partial/completeは独立。

人物は標準候補IDまたはoriginal/motif IDを利用。取り込みで候補IDが再発行された場合、既存restoreWorkingの明示idMapで、ownerのcanonical valueが一致する場合だけ同じ対象へ再解決する。それ以外は対応先不明として保持。同名／同じコマ番号では対応付けしない。【Q3】customは先に独立originalへ明示作成する。

【Q2】独立怪異は新しいCreature UUIDを生成し、horror.byActor[ref].origin:'independent'で表示分類する推奨案。Creatureレコードは既存候補からユーザーが基本種類を選ぶ（ghost／demon／undead creature等は現行値）。種類を選ぶだけで怪異featureを自動選択しない。新しいマスターspecies・Characterを追加しない。元対象へのリンクなし。独立kindを増やす代替案は別仕様承認を要する。

## 3. 確定状態schema案

workingの追加fieldだけに確定済み怪異を持つ。actorExtensionsのstrict motif entryへ混ぜない。名称が似ていてもadultやform catalogのdataを流用しない。

```json
{
  "horror": {
    "version": 1,
    "byActor": {
      "creature:UUID": {
        "ownerSnapshot": {"kind":"creature","value":"ghost"},
        "origin": "linked",
        "state": "partial",
        "primaryTypeId": null,
        "secondaryTypeIds": [],
        "intensity": "medium",
        "features": {
          "horror-feature-UUID": {"enabled":true,"weight":1,"parameters":{}}
        },
        "originalFeaturePolicies": {},
        "structure": {"wings":"unset","horns":"unset","tail":"unset"}
      }
    },
    "byManga": {
      "manga-UUID": {
        "byPanel": {
          "panel-UUID": {
            "byActor": {
              "creature:UUID": {
                "state": "inherit",
                "features": {},
                "structure": {},
                "originalFeaturePolicies": {}
              }
            }
          }
        },
        "continuityRanges": []
      }
    },
    "unresolved": []
  }
}
```

`origin`はlinked／independent。人物refはperson:ID。ownerSnapshotは既存actorOwnerForRefから取得できる識別情報＋必要なappearance基準のみ。存在確認・ownerの不一致を検出するための情報であり、成人資格や許可情報ではない。

feature IDは固定、value／日本語label／分類／適用state／構造requirements／conflictGroup／semanticKey／continuity（persistent/transient）を専用registryに持つ。個別parameterとweightは選択state側。既存タグを参照する場合も新候補の重複登録はせずsource参照を保持。標準定義はHTML、ユーザー候補はsettings.horrorCatalogChangesへ分離。候補の具体的な初期一覧は【Q7】。

身体構造はpresent／absent／unset。unsetは情報なしで、absentと同じではない。現在の元bodyで分かっている構造は読み取り推定の根拠をUIに示すが、種名だけから断定しない。原作Creatureに元々ある翼と、怪異overlayに追加する翼はorigin/sourceが異なる。

originalFeaturePoliciesはsourceRefごとのkeep／replace／exclude。replaceのfeatureRef等を明示する。曖昧な文字列検索で元featureを消さない。自由入力・複合文で分離できないsourceは「個別除外未対応」で保存候補に留める。

## 4. 評価規則

純粋resolver `resolveHorrorActor(context)`案はsource付きtoken／採用理由／除外理由／競合を返し、stateやprofileを変更しない。

1. 対象の存在、owner、候補、漫画ID、コマID、登場を検証する。
2. コマstateがinheritなら基本state、それ以外はコマstate。
3. **実効stateがnormalなら怪異features、強度、元外見mask、怪異構造上書き、継続範囲の怪異出力をすべて無効化する【Q8】。保存値・固定ONを削除しない。**
4. partial/completeでは基本選択を読み、確認済み継続range、コマ固有overrideを解決する。コマのfixedOffがrangeや基本より優先。fixedOnでも候補のstate／構造条件は満たす必要がある。
5. original keep/replace/excludeを対応できるsourceだけへ適用する。
6. 構造requirements、排他group、別個体依存を評価し、矛盾なら報告。自動修正しない。【Q9】競合のある怪異生成は中止する。
7. 明示semanticKeyと完全一致tokenの範囲で重複整理し、個別weightを保つ。weightが異なる同義候補はユーザー確認。部分文字列／推測同義語の削除は禁止。

主種類1／補助最大2は検索の優先順位だけへ利用。補助同士・主と補助の重複禁止。類型を選んだだけで英語tagを追加しない。強度は怪異featureの対応parameterとしてのみ使い、品質／個別weightを勝手に変更しない【Q7】。completeも無条件の元外見消去ではない。

## 5. 漫画ID・コマID

【Q4/Q5】通常漫画最大6を維持。怪異の利用開始時にmangaState.mangaIdとpanels[].idを追加、normalizeMangaはその2fieldを明示検証・保持する。怪異未使用の旧snapshotには必須化しない。IDの初回付与は1回保存し、reload／Undo／export/importで同じIDを保持する。

count変更で隠れたslotは削除しない。新設する挿入／明示削除／並び替えはpanel object全体を移動し、関連story、people、creatures、horror、画像配置、編集target／結果の表示番号をIDから解決し直す。6slot上限を超える挿入は拒否。画像はblobをJSONへ保存する新機能を前提とせず、既存のRAM画像配置を同じIDへ再対応させる。

プリセット／ストーリーの適用・Undoは既存panelのIDを保持する。漫画resetは新しいmangaIdを作る【推奨】。旧漫画の下書き・rangeを削除せず、対象不明へする。duplicate ID／同IDで異なるpanel payloadは勝手にnew UUIDへ直して対応付けず、importの競合として扱う。

## 6. 継承・固定・一貫性

コマfeature overrideはmode:inherit／on／off。onはfeature payloadをコピーして固定する。onだけでは基本featureのparameter改変に追従しない。offは新feature追加やrangeでも優先される。inheritは基本選択へ追従。

基本変更前に`previewHorrorBaseChange`案で影響するactiveコマと非表示slotを区別して表示する。変わるfeatureの有効値だけ比較し、normalコマで出力ゼロの項目を「外見変更」と数えない。必要なら保存値への影響も別表示する。

旧外見を維持する一括固定planは変更前snapshotを使う。基本変更のUndoと一括固定のUndoは別。前者を先に確定しても、後者planが再照合で有効なら部分確定できる。同じ原因の差分groupにまとめ、コマ例外は個別に外せる。

rangeは{rangeId, actorRef, startPanelId, endPanelId, featureIds}でinclusive。表示順は現在のpanel順。前後逆転、端点削除、対象不明は競合／対応先不明であり、自動で範囲を縮めない。featureのcontinuity:transientはrange継続に含めない。

範囲内へ挿入したコマはそのrangeの対象になる。既にユーザーが確定したpersistentの継続規則はresolverで適用でき、コマへ新しい固定レコードを勝手に書かない。新規feature・例外・前後からの推測は未確認候補を作るだけ。normal／fixedOff／明示的な局所構造が優先。競合するrange同士は自動優先しない。

## 7. 独立下書きschema

settings.horrorWorkspaceに確定漫画とは別のstoreを持つ。working snapshot／通常historyには初期状態で含めない。自動保存では必ずworkspaceを同じ新bundleへ保存し、アプリ終了後も復元する。

```json
{
  "horrorWorkspace": {
    "version":1,
    "drafts": [{
      "draftId":"draft-UUID", "name":"固定案", "revision":1,
      "items":[{
        "itemId":"item-UUID", "incarnationId":"incarnation-UUID",
        "originalRefs":{"mangaId":"manga-UUID","actorRef":"creature:UUID","panelId":"panel-UUID","featureId":"horror-feature-UUID"},
        "displaySnapshot":{"actorName":"参考名","panelNumber":2,"featureName":"参考名"},
        "mapping":null,
        "candidate":{"operation":"set-feature","value":{"mode":"on","weight":1,"parameters":{}}},
        "review":{"status":"unreviewed","baseline":null,"dependencyDigest":null},
        "dependencies":[], "appliedReceipt":null
      }]
    }],
    "trash":[], "itemTombstones":[], "mergeLog":[], "recoveryPending":[]
  }
}
```

review.baselineは確認時の必要field実値、dependencyDigestはそのcanonical化digest。digestだけで内容の意味を復元する前提にしない。dependenciesはowner／feature definition revision／base選択／実効state／構造／range端点／関係先等、実際に使った値だけ。全workingのhashで一律失効させない。

保存statusを信用せず、現在resolverでstatusを再計算する。表示は「確認済み・有効／再確認待ち／未確認／無効・対応先不明」。競合理由を併記。もともと未確認だったものは未確認のまま。比較資料不足は再確認待ち、対象がなければ対応先不明。

原Refsは不変。mappingは新しい参照とmappedAt等の別field。名前・コマ番号での自動対応付けは禁止。別人へのmappingはactor依存itemだけ再確認、別人との関係を使うitemも再確認。無関係なitemの確認は維持。

## 8. 部分確定transaction

`buildHorrorCommitPlan`→差分group表示→個別選択→`commitHorrorDraftItems`案。

確定直前に対象・owner・候補・基準値・依存・mapping・別タブrevisionを再照合。itemの「確認済み」文字列だけで確定しない。新たに変わったitemは再確認待ちへ戻して確定対象から外す。その場で対象subsetが変わったことを表示し、更新されたsubsetをユーザーが確認してから確定する。

同一target fieldへの競合itemは全候補を除外して説明する。依存groupの片方だけを確定できない場合は、そのgroup全体を未確定に残す。確認済み・有効で独立した項目だけが部分確定対象になる。

1transactionで漫画設定の差分、選択itemのappliedReceipt、必要なworkspace更新を新5キーへ保存。RAM・disk・漫画Undoは成功時だけ確定。失敗時はすべて前状態。actorFormTransactionは全project／workspaceを退避しないので、そのまま使わず新`horrorTransaction`で対象範囲を拡張する。

漫画Undoは1単位。下書き全体をsnapshotから置換せず、選択itemだけへのreceiptを記録する。Undoで漫画を戻す際、receipt対象itemが確定後から編集されていなければ未確定へ戻す。編集された場合は現在の下書きを保持し、再確認待ちまたはUndo差分候補へする。残りの未確認item／新しく追加した下書きは消さない。結果保護とセッション許可非復活を維持する。

## 9. 保存・JSON・移行

【Q1】推奨root v5、horror.version1、horrorWorkspace.version1、actorExtensions v4維持。

新5キー案：

| 用途 | キー |
|---|---|
| settings | seaart-prompt-builder-v5-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1 |
| working | SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1 |
| history | SeaArt_generated_prompts_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1 |
| marker | SeaArt_actor_forms_commit_creature_adult_v1_result_access_v1_motif_person_v1_horror_v1 |
| journal | SeaArt_actor_forms_recovery_creature_adult_v1_result_access_v1_motif_person_v1_horror_v1 |

移行：新bundleがある場合は新journalだけで復旧。壊れているとき旧bundleへ自動rollbackしない。新bundleがない場合だけ旧mainの確定5キーを旧契約で読み、別stateで変換・検証し、新5キーへ初回commit。旧キーは消さない。旧v3 importは怪異未設定として扱う。旧v4 importも同様、workspaceは指定なしなので現在の下書きを黙って消さない。

名前付き保存／exportの基本対象は確定設定。オプションは「作業中の怪異下書きを含める」OFF、「怪異下書きゴミ箱を含める」OFFで独立。trash ONならその復元に必要なdelete情報だけ同梱、draft ONなら選択draftに関するitem tombstoneを同梱する。両方OFFならworkspaceを含めない。exportOptionsへ明示し、importでは欠落を削除命令と解釈しない。【Q11】snapshot呼出し時はworkspaceをmerge候補として扱う。

自動保存はworkspaceを常時保存。生成履歴は確定設定だけsnapshotし、history復元でworkspaceを巻き戻さない。workspaceの編集・merge・trashは別Undo stack（session内10件を推奨、永続Undo履歴は初期範囲外）。通常／漫画のUndoではworkspace本体を巻き戻さない。data resetにもworkspace削除を暗黙に連動させず、専用管理操作とする。

## 10. import／merge

parse→型検証／危険key拒否→immutable incoming→IDとitem revision比較→差分plan→確認→保存lease再検証→commit。

同draftId・同itemIdで完全同内容はno-op。異なるitemIdは追加候補。共通ancestor/base revisionがあり片側だけ変更したfieldは非競合の統合候補。共通ancestorなしで同fieldが異なる場合は、日時・revision数値だけで新しい方を採らず競合として確認する。元Refsが違う同itemIdは対応先変更の競合。delete markerを先に評価する。

incoming review statusは現在のdependency基準で再計算する。対応先がなければ保持し生成／確定不可。workspaceのmergeだけで確定漫画を変更しない。mergeLogと下書きUndoを漫画Undoから分離する。巨大file・未知schema・不正日時・prototype keyは保存前に拒否し既存を保持。

## 11. 30日・削除・救出

30日はUTC timestampから30×24時間。expiresAt=deletedAt+30日。ちょうどexpiresAtで期限切れ。既知の同deleteIdの日時はimportで変更しない。期限切れmarkerを受けてもnow+30日へ置換しない。未来の不自然な日時・不足情報は保留し、期間を勝手に補完しない。オフライン時計は信頼できるサーバー時刻ではなく、時計巻戻し時の限界をUI／報告へ示す。

item削除：itemId＋incarnationId＋draftId、deleteId、deletedAt、expiresAt、最小復元snapshotをtombstoneへ保存する。有効markerがある古いitemは自動復活しない。「復活」選択時だけ未確認itemを新incarnationとして作り、元deleteIdを履歴保持する。削除Undoも明示復活として処理する。期限切れmarkerは整理可能だが、古いbackupから期限を延長しない。

draft全体削除：draft snapshot＋deleteId／deletedAt／expiresAtをtrashへ移す。30日内は明示復元、同IDのactive draftと衝突すればmerge確認。確認statusは現在基準で再評価する。復元操作だけでは漫画を変更しない。

期限切れlocal trashは保存transaction内で整理できる。ただし対応先不明のactive draftをtrashへ勝手に移動／期限削除しない。有効trashを容量不足で消さない。

期限切れbackup trashは「未確定下書きとして救出／読まない／保留」。保留はrecoveryPendingへincoming payloadを保存し、自動でactiveへ移さない。救出は新draftIdへコピーする推奨、rescuedFromで元ID／削除日時を保持する。元の確認基準が十分で一致するitemだけ確認済み・有効、変化影響itemだけ再確認、比較不足は再確認待ち、未確認は未確認。**救出自体に適用機能はない。**

対応先不明のactive draftは無期限保持。期限付きtrashを「対応先不明」として自動的に無期限化する方式ではなく、ユーザーが救出したactive draftだけ無期限になる。

## 12. 出力と漫画shared identity

怪異未設定のbranchは元生成をそのまま呼び、全文一致を維持。全実効state normalかつ出力overlayゼロの場合も元分岐を優先。下書き・trash・mergeLogをgeneratorへ渡さない。

通常：source付きbase appearance→original policies→実効怪異feature→重み→既存人物／Creature block。common／global末尾へ主体featureを足さない。単独・複数・strong・Kreaを全部カバーし、既存prefix/order/BREAK/Negativeは維持。

漫画：共通identityに状態依存appearanceを無条件で含めない。登場するコマで完全一致する外見tokenのみsharedに残し、変化する外見は各コマの対象actor blockへ出力する。通常コマは元外見、部分／完全コマはresolverの結果。全体出力とコマ単独で同じresolver／contextを使う。全体の「外見維持」表現は未変化部分または明示rangeの維持に限定し、全コマ同一外見という矛盾を作らない。

元species／原作identityが暗黙に持つ構造はタグ削除で保証できない。対応できないexcludeを自動Negativeへ変換しない。horns/tail/wings等の全体Negativeを増やさない。既存Negativeで怪異featureが抑制される可能性は警告し、無断で既存Negativeを削除しない。

既存成人条件・result access・コピー／historyのprovenanceを維持。怪異化しても新許可を発行しない。簡易漫画は【Q4】追加接続せず従来全文を回帰保護。
