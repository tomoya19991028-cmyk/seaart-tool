# ホラー候補・漫画プリセット一括検証

総合判定：条件付き合格。自動評価510件PASS、FAIL 0。実機・実SeaArtは未実施。

製品commit：`bf961907fc5c35247cddeb2514809863a6b2e507`。全最終runnerの開始／終了HTML SHAは `67b979ec6739872a74ae914975e29582c86ecc357493edb8ebcad201867090f7` で一致。試験ファイルとadapterのSHAも照合した。

## 最終集計

33 browser runnerで498評価単位、独立した旧プリセット比較2件、静的品質10件の計510件。旧30 runnerの451件と新29契約・12画面・6 PWAの47件で498件となる。R1内865 assertions、6プリセット×1〜6コマの36組合せなどを重複加算しない。作成した自動試験の未実施は0。元第2回3テストの未回収と実機・画像未検証は別記する。

|runner|評価単位|結果|
|---|---:|---|
|story-pwa|6|PASS|
|unified-compatibility|8|PASS|
|unified-pwa|6|PASS|
|story-ui|12|PASS|
|unified-contracts|24|PASS|
|unified-ui|12|PASS|
|story-contracts|29|PASS|
|card-pwa|6|PASS|
|card-contracts|19|PASS|
|card-ui|12|PASS|
|card-persistence|4|PASS|
|normal-pwa|5|PASS|
|normal-ui|6|PASS|
|faults|14|PASS|
|normal-contracts|20|PASS|
|legacy|21|PASS|
|boundaries|20|PASS|
|r1|49|PASS|
|contracts|25|PASS|
|motif-boundaries|20|PASS|
|motif|52|PASS|
|ui|7|PASS|
|pwa-regression|9|PASS|
|round2-retest|14|PASS|
|prompts|8|PASS|
|combined-pwa|7|PASS|
|pwa|8|PASS|
|integration|18|PASS|
|ui-extra|6|PASS|
|motif-prompts|8|PASS|
|fixed|1|PASS|
|edges|36|PASS|
|combined-ui|6|PASS|
|旧プリセット独立比較 SP01／SP02|2|PASS|
|品質チェック|10|PASS|
|合計|510|PASS（FAIL 0）|

別途、18 inline script構文、CRLF・UTF-8、ソースからの再生成一致、既存141テスト／fixtureのbytes不変もPASS。


## 検証条件

- 基準：remote `feat/person-creature-ui-unified-update` / `ede9fa02a0088816509b20f216b652c3237d87fd`。
- 対象：`feat/horror-catalog-manga-story-presets` のソース再生成HTML。
- Playwright／Chromium、隔離browser context、模擬人物・Creature・保存・画像。
- 通常検証origin：localhost:8765。SW更新／offlineは専用のlocalhost originを使用。公開originはHTTP GET／hash確認のみ。
- 実Android、実SeaArt画像生成、実利用者の保存データは未検証。

## 新規試験

|試験|内容|
|---|---|
|S01／S02|72追加・84特徴の一意性、6種類・1〜6コマ展開|
|S03|保存状態・人物切替・タブ開閉・再描画でも身体／ダメージ2カード表示|
|S04|適用の原子性・通常Undo1回で元状態へ復元|
|S05〜S10|6プリセット×各1〜6コマ、36組合せの実適用・状態・特徴・傷・全文生成・Undo|
|S11／S12|人物Bのみ変更、人物Aの基本／コマ設定不変、Creature独立、負傷は人物専用|
|S13／S14|対象・候補定義の変更で再プレビュー要求、キャンセル無変更|
|S15／S16|quota書込失敗のRAM・disk・Undo rollback、不正markerの安全拒否|
|S17|名前付き保存・履歴・下書き・ゴミ箱を含む実JSON読込・統合確認・reload|
|S18／S19|依存変更後の再確認、通常Undo／下書きUndo、部分確定・ゴミ箱・復元|
|S20／S21|import lock、通常画像の基本状態と漫画コマoverlay分離・normal抑制|
|S22／S25|全72追加タグの解決・重み出力、解除／Undo全文一致、全84候補表示|
|S23／S24|同内容自タブ保存後の適用、お気に入りUndoの星・絞り込み同期|
|S26／S28|実別タブ更新と確認中編集の競合拒否・変更保持|
|S27|実PNG decode後のプリセット適用／Undo、コマID・画像・配置維持|
|S29|コマ編集に適用中の値を表示、実操作で別コマへ混入せず編集、reload後表示|
|UI 12|360／393／430×640／800、横3、文字150％3。検索・★・×・Undo・多数タグ・6プリセット一覧／適用・身体2カード|
|PWA 6|旧版SWから更新、旧タブと未保存入力保持、明示reload、offline適用／保存／reload、解除Undo、再online・生成|
|SP01／SP02|基準版の全ストーリー・シーン構成・scene choicesを保持、旧怪異定義不変|
|quality 10|旧候補／enum、72追加一致、ID・名称・タグ一意性、36＋36、既存6特徴群、保存基盤不変、cache名のみ変更、全旧テスト原本不変|

## 既存回帰

旧30 runnerの対象：

- 人物・生物UI契約24、画面12、生成／保存互換8、PWA6。
- 怪異カードタグ契約19、UI12、PWA6、保存4。
- 通常画像優先契約20、UI6、PWA5。
- 怪異T01〜T30の各runner、保存障害14、追加境界20、独立I01〜I36、P01〜P08／全文168組合せ、追加UI6。
- R1 49契約／865 assertions、通常210／漫画210／コマ420全文。
- Native通常252／漫画252、成人既存21構成。
- モチーフ人物第1回36契約＋作成障害8＋保存移行8、追加境界20。
- 第2回M01〜M14代替、198候補、通常21／漫画21／コマ42。
- 統合Z18、統合UI6／PWA7、モチーフ全文比較168組合せ、固定baseline fingerprint、簡易漫画snapshot、旧SW9ケース。

旧テスト・expected・fixtureは書き換えない。UC01の全カタログ比較だけは、承認された72追加があるため旧12特徴の射影を照合し、追加分はS01／SP02／qualityで別に検証。cache名、明示漫画入口、削除済みボタンの内部入口は実行時adapterで設定する。UC02〜UC08の生成関数・全文・保存キーの期待値はそのまま。手順と適用範囲は `tests/horror-stories/README.md`／`replay.cjs` に記載。

第2回の元専用テスト3ファイルは未回収。保存済み製品と承認済み仕様から作った既存M01〜M14代替を再実行する。元の48契約や元障害7ケースを実行したという報告はしない。

## 保存互換性・Undo・生成

保存形式v5・namespace・UUID・モチーフmetadata・元Creature・保存transaction／journal基盤は変更しない。旧v3／v4移行、v5読込、名前付き保存・履歴・JSON、下書き／ゴミ箱／削除履歴は既存と追加試験で確認する。新しい状態enumや新保存キーは追加していない。候補IDを知らない旧開発版への戻しは、新候補の解決を保証しないため行わない。

通常Undoはsession内10件まで。プリセット適用は通常Undo1件、下書きUndoは独立。画像・配置はsession限定で、JSON永続保存へ変えていない。保存失敗時は既存transactionが変更前を保護し、成功表示を出さない。他タブ更新・import進行中・確認中変更は拒否する。

旧候補の英語タグ・出力順・重み・人物単位の構造・normal抑制・ネガティブ・成人利用条件は不変。R1通常210／漫画210／コマ420、Native通常252／漫画252、第2回代替通常21／漫画21／コマ42などの固定全文比較はPASS。12datasetと固定baselineは不変。固定output fingerprintは `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。新プリセット使用時の全文は36組合せの原記録へ保存し、対象・コマ別の設定と対応させた。実SeaArtでの人物分離品質やタグ再現性は自動試験の対象外。

## FAIL・修正と証跡

- 製品不具合：既存ダメージカードuiOff残留、自タブ保存による新プレビュー無効化、お気に入りUndo後の星／filter残留、新プリセット値のコマ編集空表示。再現・修正・再試験は実装報告の修正履歴を参照。
- 試験準備：4コマから6段階を選ぶ対応の誤認、JSON下書きの統合確認未操作、不正marker例外を返り値拒否として期待したケースを是正。元FAIL記録を保持し、製品不具合数へ混ぜない。
- 修正途中のrunnerは中断理由と原記録を保存し、最終版のPASS件数へ加算しない。

## 未確認・公開前条件

実Androidのタッチ・文字拡大・日本語キーボード・PWAインストール、実SeaArtモデル別タグ効果／人物分離／回復表現は未確認。実利用者のスマホ保存をバックアップしたとは主張しない。現公開PWA・Sitesは旧版のまま。

自動検証合格後も、実機チェックリスト確認とユーザーの別途承認がmain／公開切替の条件。今回の作業で公開操作は行わない。

## 証跡・GitHub保存

`validation/horror-catalog-story-presets/summary.json`／`verified-results.json`、`final-records.tar.gz`（全最終実行／全文／ログ）、`development-records.tar.gz`（元FAIL・途中版ソース・中断理由）、画面PNG、再生成／構文記録、remote-product.jsonを保存。全製品35ファイルをremoteで照合し、HTML・SW・主要ソースなど9実blobをRESTでも再取得して一致した。

SW SHA：`8054d6420339a732ae7a9d17cc78caed74c87feec595b383bc0de8cd5e48e7c2`。cache名以外は旧SWとbyte比較で不変。公開4 endpointはHTTP200・旧bytes／hashで不変、mainは5b5bb03589dcc9a661402395d6c3db20cfd4cf52、Pages sourceはlegacy main `/`、最新buildは同commit／built。既存6 worktreeはHEAD・statusとも不変。Sites操作は行っていない。

技術判断：作成した自動試験の範囲に未解決の回帰はなく、統合レビューへ進める状態。実Androidチェック・実SeaArt画像確認と別途承認を経てからmain／公開切替を判断する。今回の公開は実施しない。
