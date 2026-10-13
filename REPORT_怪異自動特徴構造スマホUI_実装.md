# 怪異自動特徴・構造連動・スマホUI 実装報告

## 基準・保護

- 開始ブランチ: `feat/horror-catalog-manga-story-presets`
- 開始／取得したremote HEAD: `cf0336d03e3edf104fdaa911b9bc568a3609bf50`
- 新規ブランチ: `feat/horror-auto-features-mobile-ui`
- 製品検証commit: `c583cb529ae54b3a6db5d1a08476de8be74dee69`
- 最終remote HEADは最終回答およびGitHubの当ブランチを参照。報告書追加commitも製品HTML／SWを変更しない。
- main: `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。mainへのcommit／merge／pushなし。

Sites Version 4の取得可能な保存ソース `4fd7c6192ffa84e5746a5b360bf411bc2dcf3d99` と基準GitHub製品を照合。HTML、SW、3アイコンは全bytes・SHA-256が一致。manifestは検証用のname／short_name／descriptionだけが異なり、scope／start_url等は同一。推測で旧版を選ばず、対応を確認してから作業した。Sitesの書込・配信・アクセス変更は実施していない。

既存worktreeのHEAD／状態を記録し、基準HTML／SW／主要ソースを作業外のbackupへコピー。既存ブランチと成果物は変更せず、新規worktreeだけで実装した。生成は既存の再生成手順と最新版の全ソースを使い、過去HTMLへ戻して開発していない。

## 実装方式

保存済みの手動 `features` に自動選択を混ぜず、既存resolverの後で状態・主種類・補助種類・構造・元特徴から派生候補を合成する。合成用actorはコピーであり、元の人物・Creature・UUID・モチーフmetadataを変えない。生成呼出・人物ブロック・コマID・画像処理・成人許可の実装は保護した。

既存84候補、ID、日本語名、英語タグ、6種類、3状態、主1・補助最大2、6特徴カード×14候補、3ページ×6カードは不変。50個の派生定義（身体12＋構造36＋獣性の瞳／牙2）を別Mapで保持し、84件の手動候補一覧へ追加しない。既存候補でも表現できる特徴は既存IDを利用する。

自動未設定の旧データはOFFで、従来の出力を維持する。種類を変更すると「種類から自動特徴を選ぶ」がONになる。種類カードから明示的にON／OFFできる。通常状態では手動・自動の怪異出力を抑止し、設定は残す。

主種類は身体方向を決め、補助は局所特徴だけを追加する。基本の自動重みは低1.0／中1.2／高1.4、補助はその0.8倍を小数1桁に丸める。手動のID／英語タグ／重みを優先し、同じタグを重複出力しない。既存84件の手動候補順序や個別強度、全体重みは保護する。自動／手動の表示用originを漫画の共通外見判定から除外し、同じ派生身体・構造を手動固定しても派生slotを維持する。AP01で同タグ・同重みの身体固定前後の共通外見・漫画・コマ全文が一致した。

## 6種類・状態・構造の対応

|種類|部分怪異の身体|完全怪異の身体|
|---|---|---|
|霊体|`partially translucent spectral body`|`fully manifested ghostly body`|
|異形|`localized body mutations`|`fully mutated aberrant body`|
|人形|`partially doll-like body`|`full-body articulated doll form`|
|獣性|`partial beast transformation`|`fully transformed beast-like body`|
|影|`partially transformed body of living shadows`|`fully manifested body of living shadows`|
|呪い|`partially cursed body`|`body fully overtaken by a curse`|

|主種類|翼：部分／完全|角：部分／完全|尻尾：部分／完全|
|---|---|---|---|
|霊体|`partially manifested translucent spectral wings` ／ `fully manifested translucent spectral wings`|`partially formed spectral horns` ／ `fully formed spectral horns`|`partially manifested ghostly tail` ／ `fully manifested ghostly tail`|
|異形|`partially mutated misshapen wings` ／ `fully mutated misshapen wings`|`partially mutated horns` ／ `fully mutated horns`|`partially mutated aberrant tail` ／ `fully mutated aberrant tail`|
|人形|`partially unfolded artificial wings` ／ `fully unfolded artificial wings`|`partially formed artificial horns` ／ `fully formed artificial horns`|`partially extended articulated artificial tail` ／ `fully extended articulated artificial tail`|
|獣性|`partially grown beast wings` ／ `fully grown beast wings`|`partially formed beast-like horns` ／ `fully formed beast-like horns`|`partially formed beast-like tail` ／ `fully formed beast-like tail`|
|影|`partially manifested shadow wings` ／ `fully manifested wings made of living shadows`|`partially manifested horns of living shadows` ／ `fully manifested horns made of living shadows`|`partially manifested tail of living shadows` ／ `fully manifested tail made of living shadows`|
|呪い|`partially formed cursed wings` ／ `fully formed cursed wings`|`partially formed curse-marked horns` ／ `fully formed curse-marked horns`|`partially formed cursed tail` ／ `fully formed cursed tail`|

主種類の構造を使用し、補助から翼・角・尻尾を勝手に生やさない。「あり」だけに対応タグを生成。「なし」「未指定」では自動構造を出さない。元構造の処理は既存resolverの保持／変更／除外規則を使う。

例：影＋翼あり、強度中。部分は `(partially transformed body of living shadows:1.2)` と `(partially manifested shadow wings:1.2)`、完全は `(fully manifested body of living shadows:1.2)` と `(fully manifested wings made of living shadows:1.2)`。既存の影候補も状態に応じて合成する。全文実測は検証証跡A01／A09／A10を参照。これらはツールのタグ出力であり、SeaArtモデルの画像再現性を保証しない。

## 優先順位・競合・固定・Undo

1. 通常状態を優先して怪異出力を止める。
2. コマの状態／構造／自動モードを優先し、未指定のコマ設定は基本を継承する。種類・強度は従来の共有設定。
3. 手動固定ON／OFF、元特徴の処理、同一タグの手動重みを維持する。
4. 自動側の除外IDは自動だけを止める。カードの「自動」×、OFF、再適用、コマの基本継承を提供する。手動OFFは再適用で消さず、手動の再選択で変更する。
5. 霊体／影の構造と物理的な翼等、身体材質、固定済みの別身体と新しい自動身体が矛盾する場合は競合。固定身体同士も排他グループで検査する。黙って上書きせず、生成を止めて前の結果を保護する。

自動の身体・構造IDは既存の下書き候補・固定・部分確定経路でも解決可能。種類／自動方針／強度の依存変更で確認済み下書きを再確認にする。変更前外見の固定試験で6コマの自動タグを保持した。通常Undoと下書きUndoの独立性、10件上限、コマ画像の対応処理は既存のまま。

カード操作は既存v5 transactionに参加し、1回の変更を通常Undo1件で戻す。所有者・表示範囲・コマID・現在設定tokenを照合する。保存失敗・別タブ・JSON読込中は変更を確定しない。共有漫画へ影響する変更と競合は既存の確認を残す。

## UI

- 対象切替は上部選択と連動。対象カードは従来の独立怪異／自由入力管理を開く。
- 状態3ボタン・強度3ボタンはカード上で直接選択。重複する詳細起動の見出しを整理し、現在値を表示する。
- 構造は翼／角／尻尾の3ボタンを横並び。基本は未指定→あり→なし、コマは継承→未指定→あり→なし。継承を保存値へ混ぜず、既存フィールドの欠落で表す。
- 種類と元特徴の詳細画面を保持。自動タグは日本語名＋「自動」、手動タグは既存表示と必要な「手動」表示。×は親カードへ伝播しない。
- 候補名／選択／小型★／詳細を同じ行に配置。★は詳細の左、44px操作領域を維持。コマの固定モード・詳細の重み欄も保持する。
- 英語表示は初期OFF。ON／OFFは表示だけを変え、開き直しても維持する。sessionだけの設定で、再読込ではOFFへ戻る。保存schema／Undoには入れない。
- 通常候補画面の下部「閉じる」を除去し、上部ヘッダーは一覧スクロール外に残す。コマの保存／キャンセルと他のダイアログの必要なfooterは保護する。
- 検索・★のみ・選択済み表示・件数・開閉時のスクロールを保持。必要な共有確認の後も同じコンパクト画面へ戻す。
- 640px高でも基本6カードが収まるよう重複表示とrow高さを整理。文字拡大時は必要な既存スクロールを使い、タップ領域を縮めない。

## 保存・PWA

settings5／working2／history2／horror1、既存namespaceと5保存キーは不変。追加は任意の `autoFeatures` のみ。

```js
// 基本actor
{version: 1, enabled: true, excludedIds: []}
// コマactor（未設定なら基本を継承）
{version: 1, mode: 'inherit', excludedIds: []} // 'on' / 'off' も可能
```

旧v3／v4／v5、Version 4の怪異・モチーフ・名前付き保存・履歴・JSON・下書き・ゴミ箱を既存移行経路で維持する。新形式の不正値は検証で拒否し、旧データを削除・初期化しない。自動の固定済み新IDは今回版で解決し、旧Version 4では新機能の再現対象外。

SWはcache名だけを `seaart-tool-pwa-v5-horror-auto-mobile-ui-v1-http-cache-v1` に更新。network-first、HTML取得失敗時の旧cache保持、オフライン、更新通知、未保存RAM保持、旧タブ非強制reloadの処理は不変。localhostで検証し、公開originの更新試験はしていない。

## 修正記録

|項目|再現・原因|修正／確認|
|---|---|---|
|B01|コマ表示中の共有強度を誤ったscope guardで拒否|共有値としてのguardを維持し変更、A07|
|B02|空footer非表示が別設定画面にも残る|共通open時に表示用classを解除、A08|
|B03|close後の隠れたbodyからscroll0を記録|閉じる前とcancel時に記録、12UI|
|B04|コマ行のselect選択肢がlabel照合を妨げ★がない|候補ID／名前照合と同じ行の★／詳細、12UI|
|B05|対象カード整理で独立怪異作成のUI入口を失う|従来の対象管理を保持、A31|
|B06|共有確認後の直接normal再開が新UIを経由しない|その再開経路もdecoratorで処理、AS01|
|B07|固定した身体と新自動身体／固定身体同士が混在|明示競合と派生身体の排他group、AF01〜03|
|B08|新しい直接操作の基本カードが640pxで大きすぎる|重複見出し整理・構造横並び・必要高さの計算、既存NUI6|
|B09|コマで自動×／ON-OFFすると継承中の別除外が失われる|現在の有効除外を保持して局所変更、AH01／02|
|B10|origin表示情報で共通外見を落とし、同じ派生身体固定で順序が変わる|originを共通外見判定から外し、派生構造の生成slotを保持、AP01|

初期FAIL、テスト側selector・仮ID・模擬画像の修正記録、途中の検証中断記録を削除せず保存した。期待値変更で合格させていない。実装・再検証の最終判定は別検証報告を参照。

## 変更ファイル・製品識別

- `index.html`
- `sw.js`
- `scripts/embed-horror.py`
- `src/horror-foundation.js`
- `src/horror-auto-definitions.json`
- `src/horror-auto-runtime.js`
- `src/horror-auto-ui.js`
- `tests/horror-auto/` の追加試験・replay・検証手順
- 本実装報告、検証報告、Android確認チェックリスト
- `validation/horror-auto/` の最終集計・保護確認・圧縮証跡

- `index.html`: 4,031,478 bytes／SHA-256 `cb2f9a724086db710eb4af50092f2062e7581e1483ad74556c0a6106d232654e`
- `sw.js`: 2,329 bytes／SHA-256 `137e3e2a58c90a0f449310288b60573b3adfd02f1c8a9cb22b363755130f12f2`
- `manifest.json`: 762 bytes／SHA-256 `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f`

## 未実施・次工程

Android実機、実IME、実SeaArt画像、今回版のSites配信、main統合・公開更新は未実施。実機確認とSites配信は別工程。現時点でmain／公開PWA／Sites Version 4を切り替えない。
