# 人物・生物・擬人化UI 一括更新

8項目を新規ブランチ `feat/person-creature-ui-unified-update` で実装しました。main・公開PWA・既存Sitesは更新していません。Android実機の確認は別途必要です。

製品commit：`0fa5c73f57437c090018f18e266542bdc518a35e`。基準は最新 `feat/horror-card-selected-tags` HEAD `023bb6d2b24395551c06d756faac16440f88b7b5`（検証済み製品 `b0363c04cff073df21a3bc7635f6d3db1d3d4479` を包含）。開始時mainは `5b5bb03589dcc9a661402395d6c3db20cfd4cf52` でした。mainのみに戻さず、怪異・モチーフ・通常画像優先・カードタグの全16scriptを引き継ぎました。

## 8項目の実装結果

| 項目 | 変更前 | 変更後・維持した範囲 |
| --- | --- | --- |
| ① 人物 | 基本8カード、身体と傷が基本に混在、モチーフ作成ボタンあり | 基本は位置・表情・体勢・体格・肌・視線の6カード／1ページ。通常の身体と傷を「身体・ダメージ」へ移動し、怪異の状態・コマ変化との役割を説明。人物から怪異対象を開く入口を設置。作成ボタンだけを除去し、モチーフ人物のUUID・metadata・選択・編集・再取込みと内部作成機能は保持 |
| ② 擬人化 | 表現切替が種類カード内、衣装9カードに防具、装備は多数の細分カード | 通常／半擬人化／完全擬人化を生物一覧の上へ移動。外見editorのモードはheader直下、ページ送りはカードの下。既存4タブを維持。衣装6カード＋衣装セット、装備4カード（武器／盾・防具／携帯品／エフェクト）。過去のエフェクトは折りたたんで全候補を保持 |
| ③ 管理 | 生物は現在の1個体のみ、人物と操作が異なる | 登録済み生物を全件一覧化。人物／生物とも「選択・設定」「編集」「保存」「基本設定を適用」「外す／削除」「閉じる」を共通化。名前は編集bufferを保存してから反映。候補人物等の読取専用差異は維持。基本設定の既存controlsを編集付近へ移動。未登録の基本設定は適用を無効化 |
| ④ 種類 | 旧系統分類と作品が混在 | 全生物／オリジナル／版権の表示filter。オリジナルは動物・幻獣・ドラゴン・モンスター・その他、版権は登録作品別。既存94候補（34オリジナル・60版権）を一意に参照。filterから外れる選択済み候補も表示して保持 |
| ⑤ 生物カード | 種類だけ高く、表現切替がtag欄を圧迫 | 2列・同じ行高、見出しとタグ位置を統一。長い名前と複数タグを折返し、解除44pxを確保。拡大文字と横画面に対応。表現切替を外へ出して余白を整理 |
| ⑥ 選択一覧 | 通常生物のみ、擬人化内容なし | 通常／半／完全を分けて表示し、両モードの髪・目・基本・衣装・装備・継承を確認。編集入口は個体UUIDとモードを指定してdraftを開く。表示や開閉だけで保存済みモードを変えない。保存時だけ明示反映。身体・傷のリンクも新しい移動先へ対応 |
| ⑦ 内部 | 管理・カード・タグ表示の重複 | 共通の管理row、button、summary、擬人化group card、既存pickerのscope adapter、★変更transactionを整理。人物・生物・擬人化draft・怪異・漫画の状態は別のまま。既存のpicker／所有者検証／保存／Undoを利用し、保存形式と生成処理を維持 |
| ⑧ その他 | 一般★変更にUndo記録なし、位置9方向に解除入口なし | 人物候補・一般・生物・候補管理の★を通常Undoへ対応。お気に入りだけを戻し、workingや下書きを巻き戻さない。10件上限と保存失敗rollbackを維持。位置の「指定なし」を9方向の上へ設置し、奥行きは独立して保持。SWはcache名のみ更新し、隔離originで更新・offlineを確認 |

盾は既存 `detail.weapon` に入っている候補を表示上分けています。保存先を移さず、盾の部分編集で武器や重みを消さないscope adapterを使います。防具は既存 `detail.armor` のままです。候補ID・日本語名・英語タグ・順序・選択状態を変更していません。

人物基本の身体・傷は通常の外見であり、ホラー・怪異の部分／完全怪異、元特徴のkeep／replace／exclude、人物別・コマ別設定を複製しません。基本設定の共有関係は従来どおりです。擬人化へ成人機能を移植していません。

## 保存・Undo・生成元

v5の既存namespaceとtransaction／journalを維持しました。通常Undo・下書きUndo・漫画画像のsession限定仕様は変更していません。★は既存の選択使用履歴キーと人物お気に入り設定を利用し、新しい保存キーは作っていません。legacy preferenceの書戻しに失敗した場合は復旧情報を保持して書込みを停止し、既存の緊急JSON救出へ含めます。

名前の保存と擬人化pickerは個体・所有者・保存前の設定を照合し、対象が変わった操作を拒否します。選択一覧から未使用モードを開く処理はdetached draftで、キャンセルは元データを変更しません。モードだけの保存も通常Undoで戻せます。

`src/person-creature-unified-ui.js` を最後の独立moduleとして埋込みます。`scripts/build-integrated.py` から同じHTMLを再生成でき、HTMLから新moduleだけを除くと旧改善版の全bytesに一致します。従来の生成関数と候補表はbyte／runtime比較で一致しています。

## 修正履歴

| 問題 | 原因と修正 |
| --- | --- |
| 一般★にUndoがない（旧版で再現） | 直接preference writerだったため、既存transactionとUndo metadataを使用する共通処理へ整理 |
| 新擬人化groupが開かない | 存在しないguardへの参照を、実在する個体・所有者・変更前設定の検証へ置換。U08・U10・U18で確認 |
| 選択一覧から別モードを開いた後、モードだけを保存できない | 元モードをdraftの比較基準へ保持し、保存まで実データを変えない。U09で開閉・保存・Undoを確認 |
| 新管理画面の操作後にrenderが失敗 | 旧rendererが参照する削除buttonをDOMから失っていた。非表示の互換hostに保持し、管理UIの表示buttonと分離。U13・U19・UIで確認 |
| 生物タグの解除が44px未満 | 旧ID selectorのCSSが優先していた。怪異や人物のCSSに波及させず、対象selectorで修正 |
| 擬人化時の種類カードだけ高い | 旧mode selectorの行定義が残っていた。各modeの行高を統一し、UIで実測確認 |
| false値のお気に入りが1タップでONにならない | keyの存在とON状態を分け、通常Undoで元のfalse値も保持。U24を先にFAILさせて修正 |
| 旧人物type省略データを改名できない | 省略値を表示上の既存既定「person」で照合。U23を先にFAILさせ、保存・既定値の維持を確認 |
| 未登録の基本設定も適用可能に見える | 登録形態の有無を使ってbuttonを無効化。U22で確認 |

初期のFAIL記録、検査URLの設定ミス、PWAの検査fixture修正も削除せず保存しています。旧expectedやfixtureを変更していません。

## 変更ファイル・保留

基準改善版からの変更は **29ファイル**（製品・source・試験・報告・証跡を含む）です。

- `CHECKLIST_人物生物UI一括Android確認.md`
- `REPORT_人物生物UI一括更新.md`
- `REPORT_人物生物UI一括検証.md`
- `index.html`
- `scripts/embed-horror.py`
- `src/person-creature-unified-ui.js`
- `sw.js`
- `tests/unified-ui/README.md`
- `tests/unified-ui/compatibility.cjs`
- `tests/unified-ui/contracts.cjs`
- `tests/unified-ui/pwa.cjs`
- `tests/unified-ui/replay.cjs`
- `tests/unified-ui/run.py`
- `tests/unified-ui/ui.cjs`
- `validation/person-creature-unified-ui/README.md`
- `validation/person-creature-unified-ui/creature-360x640.png`
- `validation/person-creature-unified-ui/change-files.json`
- `validation/person-creature-unified-ui/development-records.tar.gz`
- `validation/person-creature-unified-ui/equipment-393x800.png`
- `validation/person-creature-unified-ui/final-7-invariants.json`
- `validation/person-creature-unified-ui/final-records.tar.gz`
- `validation/person-creature-unified-ui/font150-430x800.png`
- `validation/person-creature-unified-ui/person-393x800.png`
- `validation/person-creature-unified-ui/protected-after.json`
- `validation/person-creature-unified-ui/protected-refs-before.txt`
- `validation/person-creature-unified-ui/public-before.json`
- `validation/person-creature-unified-ui/remote-product.json`
- `validation/person-creature-unified-ui/selected-final-runners.json`
- `validation/person-creature-unified-ui/verified-results.json`

製品HTML SHA-256：`ed8da8f0978a0249a61778b1433c139c22cad9c95721c7874d11e6493cf610bb`（3,958,894 bytes）。SW SHA-256：`13f3f88e81d13cfefcec19a49d091561b24d78a2a158e42aad10a22d066b15c3`。

cache名：`seaart-tool-pwa-v5-person-creature-unified-ui-v1-http-cache-v1`。network-first、失敗時旧cache維持、更新通知、非強制reloadは従来どおりです。manifest・保存namespace・公開設定は変更していません。

仕様矛盾による実装保留はありません。Android実機・OS文字サイズ・実IME・PWA導入・SeaArt画像生成品質は未検証です。第2回モチーフの元専用テスト3ファイルは従来から未回収で、既存の独立代替試験を再実行する扱いです。

[検証報告](REPORT_人物生物UI一括検証.md)、[Android確認](CHECKLIST_人物生物UI一括Android確認.md)、[再実行手順](tests/unified-ui/README.md)を参照してください。

GitHub保存先：[専用ブランチ](https://github.com/tomoya19991028-cmyk/seaart-tool/tree/feat/person-creature-ui-unified-update)。製品commitはREST blobとfetchで照合済みです。報告・証跡・UI検査強化を含む最終branch HEADは最終応答に記載します。
