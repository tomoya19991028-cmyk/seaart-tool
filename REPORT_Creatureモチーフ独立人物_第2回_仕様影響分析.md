# Creatureモチーフ独立人物 第2回：仕様・影響分析（工程A）

調査日：2026-10-11。最新GitHub main：`5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。参照基準と一致。GitHub fetch・commit APIを照合。対象は現行`index.html`、`sw.js`、`manifest.json`、第1回8テスト・固定fixture・公開/実装報告書。過去のschema v3調査を現行仕様へ流用していない。

## 現行構造と取込み仕様

`humanProfile.version=1 / byMode.semi,full`の保存済み外見を`mfSavedAppearance`でコピーし、`mfImportPreview`→`mfBuildCreatePlan`→`mfCreatePerson`のtransactionで独立人物を作成する。参照元はプレビューRAMに限り、人物record/profile/extensionには永続化しない。現行3項目はhairColor/eyeColor/hairStyle。人物の衣装はcatalog ID、部位はdetail value、色・重みはvalueをキーとする。

第2回は一般衣装、upper/lower/feet/legwear、bodyFeaturesの耳・角、一般accessory、選択した衣装・部位・装飾のitemColorsへ拡張する。別紙の明示allowlistに加え、標準ID/value/名前/分類、現在候補一致、所有者なし、非表示・編集なしを再検証する。未知・独自・原作固有・未確認候補は近似せず対象外として候補名と理由を表示する。Native特徴・species/identity・自由入力・動物主体の構造・年齢・成人設定・相手参照はコピーしない。耳・角は新しい身体構造を推定せず、擬人化外見で明示選択された一般候補のみ。

項目単位のON/OFFで作成予定を更新し、元外見・旧人物・成人資格は変更しない。色は選択した取込み項目の検証済み値にだけ適用する。色OFFでは再取込み先の色を維持する。色ONでも参考元に色指定がない候補の既存色は消さない。空の項目は取込み不可とし、暗黙の解除には使わない。

衣装セットは既存生成がセット名を省略して部位を出力する。未選択部位を自動展開しないため`outfitExpandedFrom`を現行セットに合わせ、部位を個別選択することをプレビューへ明記する。既存の生成処理そのものは変更しない。セットだけを選んでも未選択部位を追加しない。

## 再取込み

モチーフ人物選択時だけ既存の操作列へ再取込みボタンを表示。通常人物への上書きは対象外。同じ作成ダイアログを利用し、人物名・identityを読取り表示し変更しない。対象UUID/record/extension/profileをプレビュー時にスナップショットし、適用前に最新版・候補・元外見とともに照合する。選択したfield配列・対応する重みのみを置換し、detailCustomの同一field自由入力は置換予定として事前表示。未選択field/色/重み・metadata・形態・成人stateは保持する。保存・描画・競合失敗はRAM/disk/Undoを復元、成功時のみUndo1回。元Creatureとのリンクを保存しない。

## 成人向け基盤の結論

`mfIsMotif`の予約ID、record/extensionの`motifPerson`、profileの`motifPersonId`、`mfValidateMetadata`/`mfValidateWorking`が`adultAccess:'denied'`を強制する。`adultReady`/`adultReadyFor`/`mfAdultPeople`、相手収集・カード参照・重み検証、`mangaPeople`のstoryAdult除外、生成直前validationによって拒否する。一般identityのadult woman/manは成年根拠ではない。

人物UIのカード・検索・分類・重み・保存transactionは一般機能で再利用可能。人物向け成人確認checkboxや共有stateをそのままモチーフ人物へ流用すると、許可・相手・共有演出が混線するため再利用不可。Creatureの`creatureAdultSubjectDefinitions`は凍結された空配列であり、`evaluateCreatureAdultEligibility`は信頼定義・個体owner・identity/form・human構造・根拠・scope・partner・session receiptを照合する。この資格を独立人物へ継承しない。

現行metadataには参考元の年齢・原作個体を残さないため、後日、原作未成年の単純な年齢変更ではないことを現行metadataだけで証明することもできない。名前変更・checkbox・metadata書換え・importからの許可は認めない。今後の再利用は、独立した新規人間の創作根拠、成人根拠、非人間構造の排除、未成年の年齢変更ではないこと、全当事者条件、専用の厳格な保存・失効契約を別調査・承認するまで保留。本工程では全モチーフ人物と本番Creature0件の拒否を維持し、成人候補・生成処理は設計/追加しない。

## 保存互換性と影響

root JSON4、actorExtensions4、adult1、humanProfile1、actorFormCatalog1、namespace `creature-adult-v1/result-access-v1/motif-person-v1`および現行5キーを維持。変更は既存profile外見field内の値のみで新schema/namespace/移行は不要。source UUID/owner/formなどの永続fieldを追加しない。第1回のrollback・journal・名前付き保存・履歴・import/export・失効処理を再利用する。

変更対象は末尾`creatureMotifIndependentPerson`スクリプト内の取込み・transaction/UIと新規テスト・報告書のみ。Character/Creature候補・共通adapter・成人資格・既存生成本文・SW/manifestを変更しない。mainへの公開は別承認。公開時はHTML更新に合わせたSW cache更新と旧HTML共存検証を別途実施する。

## 工程Bの確定範囲・受入条件

1. 明示allowlistと厳格resolver、部位・色プレビュー。
2. 個別ON/OFFで予定を即時表示、選択変更時の確認解除。
3. motif人物だけへの再取込み、対象スナップショット検証、原子的保存/Undo。
4. 6viewport、候補非表示/改変/owner、元外見更新/別タブ競合、容量不足/描画例外、保存・reload・favorite・履歴・JSON・Undo、7×3生成を検証。
5. R1固定全文・12data fingerprint・第1回36契約/障害/migrationを再実行し、baselineを書換えない。

未確認をPASSにしない。実機スマホ/公開PWAは今回対象外でChromiumローカル検証と分ける。一般機能はCodex Highで実装可能。成人利用の再開放はWork Highの別調査と承認が必要。

## 成人向け依存関係の照合表（現行のまま保持）

| 項目 | 現行処理 | 第2回の扱い |
|---|---|---|
| 人物成人確認 | renderAdult、adultScene.confirmed、adultReady/adultReadyFor | motif checkbox無効、一般identityは根拠にしない |
| 対象収集 | mfAdultPeople、subjectActors({adult:true}) | motif除外、Creatureへ流用しない |
| 個別成人state | adultScene.people[id]、adultPersonPrompt | motif本人/相手を拒否、profileへコピー禁止 |
| 共有成人state | adultScene、adultScenePrompt | motif混在時は共有出力なし |
| 相手参照 | renderAdultFields内mfAdultPeople、mfValidateWorking | motifを相手にできない |
| 標準6カード/追加カード | adultEditorGroups、renderAdultFields、scTags、mfProfileRestricted | 既存人物のみ。取込みとは無関係 |
| 生成/漫画 | generate/ generateMangaの直前validation、mangaPeople、subjectActors | 既存本文を維持、storyAdultではmotif除外 |
| Creature資格 | creatureAdultSubjectDefinitions、evaluateCreatureAdultEligibility、creatureAdultEditorGate | 本番0件。原Creature資格は継承せず、Native拒否 |
| セッション | receipt/contextKey/epoch、creatureAdultAuthorizations、resultAccessPermissions | 保存・再取込みから復活させない |
| データ検証 | mfValidateMetadata/Extension/Working、afValidateBackup | ID/owner/metadata三者一致、deniedのみ許容 |
| 保存・履歴・Undo | captureWorking/restoreWorking、persist、favorite、restoreAccessHistory、journal | 一般外見のみ変更。adult状態は保存前後で不変 |

本工程の成人連携調査は既存参照関係と拒否条件の分析に限る。既存の候補内容を再掲載・収集したり、新しい性的出力接続を提案していない。既存人物用確認を汎用人間資格APIと誤認しない。現在のdenied契約とroot/namespaceを維持したまま、将来の利用許可を追加することはできない。許可を検討する場合は、独立した創作人物としての根拠と全当事者の条件を別途確認し、明示的なschema/失効/旧HTML互換性設計と別承認が必要になる。第2回の保存version変更は不要である。

参照資料：最新mainコード、および`REPORT_Creatureモチーフ独立人物_第1回統合_実装検証結果.md`、`REPORT_Creatureモチーフ独立人物_第1回統合_main反映_PWA公開検証結果.md`。資料の結果を今回のPASSとして転記せず、今回実行ログと分けて扱った。

## 由来保証の限界

現行検証は予約ID・owner・record/profile/extension間の整合性とdenied契約を検証する。単一のmetadata改変、由来付きIDの通常化、許可値の変更、旧保存の復元による許可は拒否される。一方、任意編集可能なローカルJSONに電子署名や別の信頼台帳はなく、由来情報のない通常人物データが本当に独立創作かを暗号学的に証明する機構はない。全体を別データへ偽装した場合まで防げるとは断定しない（本工程でそのような偽装の生成・保存・許可テストは行っていない）。これも成人向け基盤を現行motifへ開放しない理由である。将来は由来・成人・人型構造の根拠と、検証不能なimportの拒否方針を別途確定する必要がある。

## 形態選択と取込み元

作成・再取込みダイアログで選ぶ形態は、参考元UUIDに保存されたsemi/fullの一般外見である。`humanProfile.byMode`は原作形態ID別の外見マスターではない。未保存の擬人化ドラフトや、未適用の原作形態から外見を推定しない。原作形態の切替・適用が必要な場合は元のCreature編集で明示保存し、その保存済み外見を取込み元に選ぶ。ダイアログから元Creatureへ原作形態を適用する処理は追加していない。
