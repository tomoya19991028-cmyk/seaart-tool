# 背景・風景／画面エフェクト

基準はmain `177a057c512a7887b9bbc5273900080bb6148be3`。背景構成・画面効果・10プリセット・互換と漫画対応を同じ更新に含む。新PRとAndroid確認版まで。merge・公開更新は対象外。

## 操作

選択の「背景・風景」から、場所／風景構成／状態・細部／プリセットを開く。前景・中景・遠景は同じ背景カタログの参照であり、未指定の層を自動で埋めない。カードの×で層や見せ方を個別解除できる。
仕上げの「画面エフェクト」は光学／色調／ぼかし・動き／質感。強さのある効果は弱・中・強を選んだ時点で有効になる。粒の粗さや範囲を先に操作しても有効にならない。
漫画のコマ編集には背景・風景と画面エフェクトの入口がある。背景内容、見せ方、画面効果は独立して継承／OFF／個別指定を持つ。背景OFFでも共通の「風景のみ」は継承する。背景の天候・時間・光はコマ個別値または共通値を使う。

## 既存との対応

|既存の保存元|新UIとの関係|
|---|---|
|`selected.background` と `catalog.background`|平坦な共通背景をそのまま保持。層へ自動割当しない|
|構図 `composition-21` / shallow depth of field|背景ぼかしの有効状態の正本。新rootは強さ等の補足のみ。旧重みは維持|
|構図 `composition-44` / environment-focused composition|風景中心の正本。新rootには正本を示す参照マーカーのみ|
|`colorStyle` / `renderingExpressions`|vibrant colors・high saturation、low saturation、pale colorsを新カードと共用|
|構図 `composition-67` / sharp face, directional motion blur in the background|複合指定を保存。新しい流れは明示確認後に出力だけ置換。キャンセルは無変更|
|ライティングの木漏れ日・光の筋・霧を照らす光・光源色|既存の3タブと保存元を維持。新しい画面効果へ複製しない|
|高コントラスト、画風・線・塗り|既存の表現として共存。色調の完全一致タグのみ共用|
|背景のmorning mistと天候の霧|意味が確定した標準値の組合せだけ重複を抑制|
|地面の花びらと舞う花びら|別の意味として併用可能|
|人物・Creatureの魔法・オーラ・武器の発光|人物側の保存元を維持。風景のみの出力には含めない|

IDと標準英文の完全一致で既知の意味を判断する。画面効果の共用候補そのものの英文を独自編集した場合も旧構図・旧色調から切り離す。独自効果の選択で旧値を勝手にON／OFFにせず、保持した旧指定を確認できる案内を表示する。独自編集英文を部分一致で分解・削除しない。同じ背景参照が複数の層にあれば各層で出力する。同じ参照の平坦な指定は層を優先し、重複を画面に通知する。

## 初回候補

新規IDは下表の接頭辞とslug。既存の場所・地面状態・照明はそのIDを再利用。新規45背景候補を既存カタログへ一度だけ追加する。灯籠用に `bd-light-lantern`（暖かい灯籠の光 / warm lantern light）を既存ライティングへ1項目追加する。

|種類・接頭辞|slug = 日本語名|
|---|---|
|場所 `bd-place-`（12）|highlands=高原、wetlands=湿原、rice-terraces=棚田、glacier=氷河、sea-cave=海食洞、canal-town=運河の街、mountain-village=山間の集落、sky-garden=空中庭園、giant-tree-forest=巨木の森、underground-lake=地下湖、sand-dunes=砂丘、sky-corridor=天空の回廊|
|水面 `bd-detail-`|ripples=さざ波、calm-water=穏やかな水面、water-reflections=水面の反射、shallows=浅瀬、shoreline=波打ち際|
|草木・地面 `bd-detail-`|fresh-leaves=新緑、winter-vegetation=冬枯れ、swaying-grass=揺れる草、dewy-leaves=露のついた葉、tree-roots=木の根、rock-surface=岩肌|
|建物・道 `bd-detail-`|lit-windows=窓明かり、weathered-stone=風化した石、wood-texture=木造の質感、paving-joints=石畳の継ぎ目、narrow-path=細い路地へ続く道|
|空間 `bd-detail-`|airborne-petals=舞う花びら、airborne-dust=空中の埃、fireflies=蛍、falling-leaves=舞う落ち葉|
|補助物体 `bd-object-`（13）|flowers=草花、leaves=葉、branches=木の枝、rocks=岩、gate=門、window-frame=窓枠、boat=小舟、bridge=橋、road=道、shrine-path=神社の参道、horizon=水平線、lanterns=灯籠、giant-ruins=巨大遺跡|

画面効果IDは `screen-` + slug。既存と共用する4項目も一つの効果として数え、合計21。

|分類|slug = 日本語名|補足|
|---|---|---|
|光学（5）|bloom=光のにじみ、lens-flare=レンズフレア、starburst=星状のにじみ、vignette=周辺減光、chromatic-aberration=色収差|全項目に強さ。最初の3項目は全体・背景中心・前景中心。後2項目は全体|
|色調（6）|warm-tone=暖色寄り、cool-tone=寒色寄り、vivid=鮮やか、muted=落ち着いた彩度、pale=淡い色、faded=退色|全体。暖／寒は排他。後4項目は彩度・色の同一役割として排他|
|ぼかし・動き（6）|foreground-bokeh=前ボケ、background-blur=背景ぼかし、soft-focus=ソフトフォーカス、background-flow=背景の流れ、radial-blur=放射状のブレ、sharp=全体を鮮明に|sharp以外に強さ。前ボケは前景、背景ぼかしと流れは背景、soft-focusとradial-blurは範囲選択|
|質感（4）|film-grain=フィルム粒子、noise=細かなノイズ、vintage-photo=古写真風、paper=紙の質感|全体。古写真風以外に強さ。粒子・ノイズだけ細かい／標準／粗い|

弱=`subtle`、中=`moderate`、強=`pronounced`。範囲可変の効果は `concentrated in the background/foreground`、背景ぼかしは `with the background out of focus` 等を使う。数値weightは既存の強調度であり、効果量とは別。モデル固有の既存weight処理を維持する。全体鮮明と強いぼかし、白黒と色調、粒子とノイズ回避は競合を表示する。

## プリセット

10種類：雨上がりの街、木漏れ日の森、湖と雪山、夕暮れの港町、灯籠の参道、幻想的な遺跡、海岸の夕景、静かな月夜、雪の街の夜、壮大な冒険風景。
`environment-design-presets.js` の安定IDレシピから、独立した変更計画と日本語の追加・保持・置換一覧を作る。選択・プレビュー・キャンセルではRAM、disk、Undoを変更しない。
既定の補完は、既存の場所・時間・光・見せ方・効果の設定を保持する。すでに候補がある層にも不足する候補を追加し、既存参照と補足は保持する。置換はレシピの明示した関連範囲だけ変更する。人物・Creature・武器・モデルは変更しない。適用は既存の `hTransaction` 一回、Undo一回。

## 保存schemaと互換

`working.environmentDesign` は省略可能なversion1拡張。初回表示や旧JSON読込では作成しない。明示編集時にsharedマーカーを作成する。

```js
environmentDesign?: {
  version: 1, shared?: true,
  layers?: {foreground?: Ref[], middle?: Ref[], distant?: Ref[]},
  density?: {[backgroundId]: 'sparse'|'normal'|'dense'},
  view?: 'subject'|'balanced'|'landscape-only'|'composition:composition-44',
  viewWeight?: number, viewColor?: string,
  effects?: {[effectId]: {strength?, scope?, grain?, value?, name?, standalone?, replaceCompound?, weight?}}
}
// Ref = {source:'background', id, value?, name?, density?}
panel.environmentOverrides?: {
  version: 1,
  background?: {mode:'inherit'|'off'|'custom', value?: {selected:Ref[], layers?, weather?, time?, lighting?}},
  view?: {mode, value?: 'subject'|'balanced'|'landscape'|'landscape-only'},
  effects?: {mode, value?: effectsMap}
}
// weather/time/lighting: [{source:field,id,value,name}]
```

共通の平坦な背景・天候・時間・照明は既存selectedが正本。rootは新しい層・パラメータと明示した新機能利用を記録する。旧構図・色調の有効値を二重に保存しない。コマ上書きはカード単位。OFFや継承にしても保存済み個別値を保持できる。コマIDに属するため並べ替え・複製で混同しない。
未知・削除参照は保存値を保持し、生成には出さず、選び直しの案内と解除を用意する。未来version、不正な層・型・強さ・範囲等は取り込む前に拒否する。名前付き保存・履歴・JSON・自動保存・Undo・原子的rollbackすべて同じ拡張を保持。resetは対象範囲だけ解除する。
保存キー、namespace、journal codec・競合ガードは変更しない。raw rollback snapshotにもrootを含める。簡易漫画専用キーと画像合成のセッション専用仕様は維持する。

## 出力境界

共通設定とコマ上書きを一度解決した計画を通常画像、漫画ページ、コマ別に渡す。旧データは従来の生成経路を継続し、main177との21設定×5出力群を完全一致比較する。
風景のみでは人物・Creatureの保存データを削除しない。人物定義・外見・装備・形態・怪異・ポーズ・関係・人数・分離補助・人物由来の光と自動ネガティブを対象出力から除外する。月光等の環境光と背景物体は残す。人物設定を編集してから人物ありに戻しても最新値を使う。顔アップ・全身・上半身・肩越し等の既知の人物用コマカメラは出力から除き、あおり・俯瞰・引きの全景と独自英文は保持する。旧構図の独自編集英文は画面効果のOFF／個別指定から推測で消さない。
漫画の人物共通定義は実際に登場するコマから求める。全コマ風景なら共通人物定義を出さない。ユーザー指定によりネガティブはページ共通のまま。一部コマが風景なら人物向けの自動補正をページ共通から省く。コマ別ネガティブ欄は追加しない。
自由入力・独自編集英文・セリフ・擬音は自動削除しない。風景のみで併用する場合は内容の確認を表示する。プロンプトの層・優先度・範囲は指示であり、領域マスクや画像再現率を保証しない。

## ビルドと検証

`src/current/manifest.json` のscript0 prependSourcesに4つの責務別モジュールを追加し、既存の37script構成を維持。基準ソースへのアンカー差分から新規ファイルへビルドして製品とbyte比較する。

```sh
npm ci
npm run build:check
npm run test:quality
npm run test:background-effects
npm run test:audit
npm run test:weapons
npm run test:storage
npm run test:remaining
npm run test:stability
```

新試験は契約、旧main実出力比較・モデル行列、UI実操作・レイアウト、保存全経路・実quota、人物化Creature/怪異境界、隔離PWA更新で構成。元のgoldenは更新しない。cacheの期待値だけ新しいcache名に合わせる。
PWAのcache名のみbackground-effects版に更新し、scope・manifest・アイコン・6資産の境界と他アプリcache保護を維持。旧main177→更新失敗→成功→オフライン編集保存復元→オンライン復帰を隔離originで確認する。
Android実機、実IME、SeaArt/PixAIの実画像生成は未確認。file://の利用可否・保存領域は端末依存。HTMLコピーとPWA更新は別の確認手順。HTMLは保存データのバックアップではなく、事前に既存UIから設定JSON・必要画像を別保存する。
