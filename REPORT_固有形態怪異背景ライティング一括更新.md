# 固有形態・怪異構造・背景・ライティング・スマホUI 一括更新

## A. 作業基準と保護

- リポジトリ: `tomoya19991028-cmyk/seaart-tool`
- 開始時main: `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`
- 実装元: `feat/horror-auto-features-mobile-ui` / `7b16f4914372131f4f93677bf645b41e40f07258`
- 作業ブランチ: `feat/person-forms-horror-background-lighting-ui`
- 製品commit: `a669edc3367083cdab3b67177ab988b12420de9f`
- 最終remote照合: `製品・報告書の保存後、最終応答のremote HEADとGitHubブランチ参照で確認`

最新remoteを再取得して比較した。mainだけでは怪異・統合・通常画像優先・選択済みタグ・人物生物UI・漫画6プリセット・自動特徴が欠落するため、これらを保持する最新検証ブランチから専用worktreeを作成した。既存8worktreeは開始時すべてclean。HEAD・status・製品hashを `/workspace/person-forms-audit/before.json` に記録した。reset、clean、既存ブランチへの上書きを行っていない。

mainとの差分には上記の未統合機能も含まれる。今回の追加分と継承済みの機能は区別してレビューする必要がある。

## B. 8項目の実装結果

|項目|結果|変更内容|
|---|---|---|
|怪異構造6項目|実装済み|翼・角・尻尾に触手・追加腕・追加脚を追加。3列×2行、未指定／あり／なし、漫画の継承を維持|
|人物固有形態|実装済み|既存形態管理へ3キャラ11形態を追加。「適用」で1操作。従来の選択と適用の分離、自由形態作成・複製・編集も保持|
|汎用／固有候補|実装済み|既存スイッチを再利用。初期OFF、ONは現在のキャラのみ。選択済みはOFFでも確認・解除可能|
|背景追加|実装済み|場所44件追加。既存115件は維持。既存同等9件は重複追加しない|
|背景2タブ|実装済み|既存Pickerを「場所／状態」に変更。状態48件、複数選択。場所と共存、人物のダメージに影響しない|
|光色|実装済み|既存ライティングの簡易Pickerへ13色と未指定を追加。共通パレット・検索・既存色チップCSSを再利用|
|横スクロールバー|実装済み|横スクロール用コンテナだけを対象に非表示。スワイプ・選択表示は維持。縦の候補／結果スクロールは維持|
|生成結果の表示|実装済み|上部余白・設定の高さを調整。モデル説明を折りたたみ、文字・タグ・直接編集・下部操作を維持|

小画面で構造カードが画面外へ押し出される問題は、項目名／値の表示整理とカード領域の必要時スクロールで修正した。カード数・ページ数は3ページ18カードのまま。文字拡大・漫画の継承表示でも操作領域を確保した。

## C. 候補と形態

### 形態

既存の各「標準」はID・名前・タグを変更せず維持。

|キャラクター|追加形態|
|---|---|
|金木研|白髪形態、赫子（カグネ）展開、半赫者（百足）|
|孫悟空|超サイヤ人、超サイヤ人2、超サイヤ人3、超サイヤ人ゴッド、身勝手の極意（銀髪）|
|黒崎一護|卍解（天鎖斬月・初期）、虚化（仮面）、完全虚化（ウルキオラ戦）|

異なる時期の外見を混同しないよう、身勝手は銀髪、卍解は初期、完全虚化はウルキオラ戦と明示した。カグネは `red rinkaku kagune extending from the lower back` として汎用触手と区別。赫眼は左赤／右灰の設定を使用する。完全虚化は角付き仮面・虚の孔・白い身体・黒い袴を指定する。

固有候補11件、汎用候補3件（眉なし、銀白色のオーラ、長い逆立つ髪）を補填。衣装セットと部位が同じタグを参照する場合は、既存のセット／部位の仕組みを用いる。髪・目・一般装備等は既存候補を優先した。

調査では既存カタログ・標準形態を抽出し、下記の公開資料を読んだ。Fandomの参照はHTTP 402で取得できなかった。登録は代表外見を簡潔なタグへ対応させたもので、全時期・細部の網羅や実画像の再現性は保証していない。

- https://en.wikipedia.org/wiki/Goku
- https://en.wikipedia.org/wiki/List_of_Tokyo_Ghoul_characters
- https://en.wikipedia.org/wiki/Ichigo_Kurosaki
- https://bleach-anime.com/character/

### 形態適用と保存

既存のv5 transactionへ接続。形態で変更した項目のbefore／afterを任意の `specificFormOwnership` として保持し、切替時は以前の形態専用項目を戻す。追加の手動特徴は保持する。構造は項目単位で所有を記録し、別途編集した追加腕等を巻き戻さない。傷・汚れ・血・表情・ポーズは適用対象外。

複製形態は任意の `specificExtras` でエフェクト・怪異設定を保持する。既存の自由形態仕様は継続。新項目のない旧データには何も自動適用しない。人物・Creature UUIDや参照を作り直さない。

### 背景・状態・光色

場所は44追加、状態は48追加。9場所は既存と同一のため追加しなかった。峡谷は既存の「渓谷／canyon」を再利用。「散らかった」は「散乱」、「破壊跡」は「破損／戦闘跡」と近いため追加しなかった。詳細は `src/environment-additions.json`。

場所と状態は既存 `selected.background` の独立した候補IDとして共存し、表示タブで切り替える。状態を選んでも場所を解除しない。背景の血液表現を人物ダメージへ書き込まない。清潔と汚れ・血液、整頓と散乱・ゴミ、炎上と凍結等は競合を検出し、選択のrollbackまたは生成停止を行う。判定は候補のID／登録タグに基づき、表示名を編集しても制御を維持する。

光色は既存 `selected.lighting` を使用し、`red lighting` 等を出力する。色を替えても種類・方向・強さの候補は保持。未指定へ戻すと光色だけを解除する。色の元データは既存 `itemColorPalette` を移動して共用しており、別パレットを新設していない。

## 自動構造の対応

|種類|触手|追加腕|追加脚|
|---|---|---|---|
|霊体|spectral tentacles|spectral extra arms|spectral extra legs|
|異形|mutated tentacles|mutated extra arms|mutated extra legs|
|人形|artificial tentacles|artificial extra arms|artificial extra legs|
|獣性|beast tentacles|beast extra arms|beast extra legs|
|影|tentacles made of living shadows|extra arms made of living shadows|extra legs made of living shadows|
|呪い|cursed tentacles|cursed extra arms|cursed extra legs|

部分は `partially manifested`、完全は `fully manifested` を組み合わせる。未指定／なしでは自動追加せず、通常状態では怪異出力を抑制する。自動特徴の無効化・再適用、手動優先・重複排除・材質競合・元特徴ポリシーを継続。既存3構造の定義は変更していない。

## D. 検証と修正

実行数・PASS／FAIL・最終SHAは検証報告を参照。既存expected・fixtureを変更していない。候補の追加で変わる全件数と、旧候補のID／値／タグを分けて照合し、既存生成全文は厳密比較する。

修正した問題は、不足候補、形態保存失敗時のRAM復旧、登録順序による形態の誤隔離、初期化中の未定義関数、構造の所有単位、複製のエフェクト／怪異保持、衣装の部位対応、ライティングの実際のイベント経路、短画面・スクロールバー、背景の使用履歴rollback、追加構造の材質競合、小画面での構造操作領域、編集済み背景名の競合判定。各再現／途中失敗は消去せず記録した。

## E. 保護対象

- mainへのcommit／merge／pushなし。
- 公開PWAの更新なし。公開URLはHTTP GETとhash確認だけ。
- Sitesの保存・デプロイ・アクセス変更なし。開始時に既存Siteの最新はVersion 5だった。
- 新しいSitesの作成なし。
- 保存namespace、settings v5／working v2／actorExtensions v4／horror v1を維持。旧キー削除・localStorage消去なし。
- 画像・配置は従来どおりsession限定。JSONへ勝手に永続化していない。

## F. Workへの引継ぎ

`HANDOFF_Work_固有形態怪異背景ライティングSites.md` を参照。Codexは検証ブランチの保存まで。Android実機・実SeaArt生成・Sites反映は後続工程。

## 変更ファイル

最終ファイル一覧は `validation/forms-environment/summary.json` と検証報告に記載。ソースは `src/`、生成処理は `scripts/`、追加試験は `tests/forms-environment/`。製品はソースから再生成した `index.html`。SWはcache名だけ変更した。
