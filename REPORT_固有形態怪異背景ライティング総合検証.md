# 総合検証結果

## 判定

`自動検証：649 PASS／0 FAIL。総合判定：条件付き合格（Android実機・実IME・実SeaArt画像は後続確認）。`

自動検証の最終結果を記載する。Android実機、実IME、実SeaArt生成、公開origin更新試験は未実施。既存本人限定Siteへの反映も未実施。

## 製品とGitHub

- main開始HEAD: `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`
- 基準: `feat/horror-auto-features-mobile-ui` / `7b16f4914372131f4f93677bf645b41e40f07258`
- 検証ブランチ: `feat/person-forms-horror-background-lighting-ui`
- 製品commit: `a669edc3367083cdab3b67177ab988b12420de9f`
- 保存先の最終HEADは最終応答とGitHubブランチを参照。
- 最終HTML: `4088549 bytes / SHA-256 841b871b885875ccd1ab0f2edd8005afe9cb8e1bcf8369289adfb3113014925d`
- 最終SW: `2339 bytes / SHA-256 76810e80a2fb4bd969705da3bd05353b07462c63426a983c515629742c94d5dd`
- cache: `seaart-tool-pwa-v5-forms-structures-environment-ui-v1-http-cache-v1`

ソース再生成と製品HTMLを全bytes比較。23 inline scriptと各JSの構文を確認。SWはcache名のみ変更。manifest・3iconは基準と同一。

## 最終テスト

`|試験群|PASS|FAIL|
|---|---:|---:|
|既存41runner|556|0|
|contracts|32|0|
|ui|12|0|
|persistence|9|0|
|candidate-ui|6|0|
|environment-faults|2|0|
|result-area|3|0|
|pwa|4|0|
|structure-visibility|3|0|
|forms-repro|2|0|
|quality|19|0|
|build|1|0|

合計649 PASS／0 FAIL。未実施は実機・実IME・実画像・公開origin更新・Sites配信の5区分。`

件数は契約／ケース単位。R1の865 assertions、全文比較の210通常／210漫画／420コマ、Native252通常／252漫画は上記件数に重ねて加算しない。

旧41runnerには怪異T01〜T30、追加独立I01〜I36、PWA群、通常画像優先、カードタグ、人物生物UI、6漫画プリセット、統合試験、モチーフ第1回、第2回代替、R1、Native、成人21構成、簡易漫画snapshot等を含む。

元のexpected／fixture／旧テストのbytesは変更していない。追加候補によって全カタログ数は増えるため、旧ID／値と旧adapterの投影を厳密比較する。R1の12dataset fingerprintはこの旧部分の比較。新規を含む全テーブルが旧版と同一とは報告しない。旧通常／漫画／コマの生成全文は変換せず厳密比較する。

現在のUIに対応する入口・cache名・6ボタン数等のadapter変更は `tests/forms-environment/replay.cjs` とREADMEに明記。元試験の期待値を書き換えていない。第2回の専用3試験・元手順書は未回収のままで、代替14ケースを正規試験のPASSとしない。

## 保存互換性

settings v5、working v2、actorExtensions v4、horror v1、既存namespaceを継続。背景と光色は既存選択配列へ候補IDを追加する方式。形態所有記録・複製付加情報は任意項目。旧3構造しかないデータは同一のまま読込でき、新3項目は未指定表示。旧保存を読んだだけで新項目を有効化しない。

実JSON読込は旧v3／v4／v5で確認。名前付き保存、履歴、JSON往復、reloadを確認。settings／working／history／marker／journalの5箇所で形態適用失敗を模擬し、RAM・disk・Undoを変更前へ戻す。背景・光色の保存失敗、別タブrevision競合、import中の編集停止も確認。旧キーやlocalStorageを消していない。

原作形態・怪異・モチーフmetadataを混同しない。人物／Creature、通常画像／コマ別設定、通常Undo／下書きUndoを維持。画像・配置はsession限定のまま。

## UI・PWA

360／393／430 × 640／800、横画面、150%文字を自動検証。さらに6構造のクリップ、親のスクロール経路、ボタンのhit testをストレス確認。小画面ではカード領域を必要な分だけ縦に動かせる。

生成結果の同時表示は、360×640で6→13タグ（約142px増）、393×800／430×800で12→21タグ（約150px増）。同じ100/150タグ入力を使用した比較であり、全てのプロンプトで同じタグ数が増えるという保証ではない。モデル説明は初期折りたたみ、文字／タグ／編集と下部操作は維持。

隔離originでSW更新・旧cache保持・HTML取得失敗・offline起動を再実行。新機能・形態・下書き・背景・光色・名前付き保存のoffline編集／reload／online復帰も実行。公開サイトのSWをブラウザで更新していない。

## 修正と証跡

|問題|修正|
|---|---|
|2形態の不足候補|既存色を再利用し、必要な長髪候補を補填|
|形態保存失敗で怪異RAMが残る|v5 hTransactionへ接続|
|reload時に新形態をunknown-formとして隔離|形態registryへ復元前に登録|
|追加候補をユーザーのfoundation差分と誤認、初期化中の関数未定義|builtin seed前に登録、初期化guard|
|構造全体の所有で手動追加構造が残存／巻戻り|項目単位before/after|
|複製で怪異・オーラが不足|任意specificExtrasを保持|
|新衣装を上半身に自動推定|明示した既存セット／部位対応|
|光色UIが旧入口を参照|現在のsimple Pickerへ統合|
|短画面・横バー・パレット操作|対象CSS／スクロールを限定調整|
|背景保存失敗でも使用履歴が変わる|保存成功後に使用履歴を更新|
|追加構造の元特徴材質を判定しない|既存material競合へ接続|
|構造カードが親領域からクリップ|文字整理・必要時のカード領域スクロール|
|状態名編集で競合判定を回避|ID／登録タグの意味で判定、表示名は実データから取得|

途中のFAIL、旧版との全件数比較FAIL、計測の修正、途中製品での実行も保持した。最終PASS数には最終HTMLと同一SHAで完了した実行だけを採用する。

## 未確認・残存制限

- Android実機のタップ、実キーボード、OS文字倍率、PWAインストール／更新は後続確認。
- SeaArtの実画像・モデルごとのタグ効果・形態の細部・属性分離品質は未確認。自動試験はプロンプトの構造・値・順序を検証する。
- 原作の全時期・全変種は登録していない。旧標準は維持し、代表形態を追加した。
- 画像／配置はsession限定。永続JSON保存へ変更していない。
- main反映・公開PWA・Sites配信は未実施。別途指示が必要。

## 保護確認

`main HEADは開始時の5b5bb03589dcc9a661402395d6c3db20cfd4cf52のまま。元8worktreeのHEAD・status不変。公開4ファイルのHTTP 200・bytes・SHA不変。既存SiteはVersion 5、更新日時・アクセスrevisionも読取前後一致。新規Site作成／配信操作なし。検証証跡を削除していない。`

## 変更ファイル

`製品・ソース・試験32ファイル：

- `index.html`
- `scripts/embed-horror.py`
- `scripts/integrate-horror.py`
- `src/builtin-additions.js`
- `src/environment-additions.json`
- `src/environment-ui.js`
- `src/horror-auto-definitions.json`
- `src/horror-auto-runtime.js`
- `src/horror-auto-ui.js`
- `src/horror-card-tags.js`
- `src/horror-foundation.js`
- `src/horror-normal-ui.js`
- `src/horror-runtime.js`
- `src/mobile-result-ui.js`
- `src/person-specific-forms.js`
- `src/person-specific-forms.json`
- `src/person-specific-foundation.js`
- `sw.js`
- `tests/forms-environment/README.md`
- `tests/forms-environment/candidate-ui.cjs`
- `tests/forms-environment/contracts.cjs`
- `tests/forms-environment/environment-faults.cjs`
- `tests/forms-environment/forms-repro.cjs`
- `tests/forms-environment/persistence.cjs`
- `tests/forms-environment/pwa.cjs`
- `tests/forms-environment/quality.py`
- `tests/forms-environment/replay.cjs`
- `tests/forms-environment/result-area.cjs`
- `tests/forms-environment/run-regressions.py`
- `tests/forms-environment/structure-visibility.cjs`
- `tests/forms-environment/ui.cjs`
- `tests/forms-environment/verify-results.py`

加えて実装報告・本検証報告・Androidチェックリスト・Work引継ぎ、validation/forms-environmentのsummary・protection・原本ledger・evidence.zipを保存する。`
