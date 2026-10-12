# 怪異カード選択済みタグ：検証報告

**条件付き合格。** 最終HTMLと同一SHAで確認した26runner、401評価単位がPASS／FAIL 0／作成済み自動検査の未実施0です。Android実機・実IME・OSのフォント拡大・実SeaArt画像品質は未確認です。main・公開PWA・既存Sitesは更新していません。

対象製品commit `b0363c04cff073df21a3bc7635f6d3db1d3d4479`、HTML SHA-256 `62c801d21fc33476e46e44b611e1c273c28e22e51fa71602a0c5ea4c1c26afc6`。実行は最新改善版HEAD上の専用worktreeで行い、前後の製品SHA・検証URL・元テストSHAを記録しました。検証済みbytesをこのcommitへ保存しています。ラッパーは適用したソースSHAも照合しました。

## 最終自動結果

評価単位は前回と同じ契約・操作ケース・viewport・成人構成・PWA確認点です。865 assertions、全文組数、198候補は重複加算していません。

| 試験群 | 結果 |
| --- | --- |
| 新C01〜C19 | 19 PASS：未選択、日本語名、複数、×、親起動防止、Undo、対象、基本値、保存失敗、reload、コマ、継続範囲、OFF、元特徴、stale/import/2タブ、JSON、明示コマ、余白 |
| 新UI | 12 PASS：縦6、横3、文字150%3。各通常／漫画、長い日本語14タグ、可視高さ、44px、末尾タップ、Undo、横幅、タイトル・状態の欠け |
| 新CS01〜CS04 | 4 PASS：名前付き保存・履歴復元、Undo10、6グループの到達、名前付き保存の実JSON roundtrip |
| 新PWA | 6確認点PASS：online cache、offline×、Undo、reload、解除保存、online復帰 |
| 通常画像優先N群 | 20契約・6viewport・5offline確認点 PASS |
| 怪異T群 | T01固定比較、T02〜T26の25契約、T27簡易漫画、T28の6viewport、T29の4旧writer、T30の4offline確認点 PASS |
| 怪異独立・保存境界 | I01〜I36、保存障害14、追加境界20、UI6 PASS |
| 怪異プロンプトP群 | P01〜P08 PASS |
| 統合 | Z01〜Z18、両機能UI6、PWA7、モチーフ版P01〜P08 PASS |
| 第2回代替 | M01〜M14 PASS、198候補を全件実再取込み。元3テストは引き続き未回収で、原本PASSと称していない |
| R1 | 49契約・865 assertions PASS |
| Native／既存成人 | 通常252・漫画252・成人21構成 PASS |
| 第1回 | 36契約・作成障害8・移行8・追加境界20 PASS |
| SW更新回帰 | 9確認点PASS |
| 合計 | 前回360＋今回41＝**401 PASS** |
| JavaScript／生成元 | inline script 16の構文、孤立再生成の全bytes比較 PASS（401件に重複加算しない） |

## 生成・保存・Undoの確認

×で対象だけを外し、他タグ・他人物・Creature・他コマを維持しました。通常Undo1回でタグ・重み・プロンプト全文が戻ります。共有設定の解除はコマ別ONを残し、コマ別解除はlocal OFFだけを書き、継続範囲の端点と他コマを残します。通常状態は選択を保持して怪異出力を抑制します。

カードscopeの切替・モード切替はworking、disk、Undo、下書き、コマIDへ無作用です。下書きUndoと通常Undoを分離し、10件上限を維持しました。元特徴replaceの変更先は誤った×解除を防止しました。

workingへのQuotaExceededError注入で、RAM・disk・タグ・Undo・workspaceが変更前へ戻り、失敗表示を確認しました。stale handler、import pending、実2タブ競合も拒否しました。名前付き保存／履歴／実JSON読戻し／reloadで怪異設定を維持しました。

旧v3・v4・v5、旧writer、journal、rollback、モチーフUUID／metadata／再取込み、成人拒否、コマ移動中の画像decode、部分確定、ゴミ箱・3wayは既存試験を実再実行して確認しています。v5と既存namespaceは不変です。画像・配置・Undoのsession限定仕様を変更していません。

R1通常210／漫画210／コマ420、Native通常252／漫画252、第1回21／21／42、第2回21／21／42は固定全文に一致しました。合計は通常504・漫画504・コマ504構成です。怪異ONの通常人物版・モチーフ版P群は各168組を比較し、標準／強いの人物ブロック分離を確認しました。「なし」は共有列という既存範囲です。SeaArt実画像の品質判定ではありません。

固定fingerprint `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。元expected SHA `e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832`。12datasetとraw生成関数は不変、既存テスト・fixture・記録128ファイルはbyte不変です。HTMLからCARD_TAGSと名前付き保存のoptional field補完だけを除くと旧改善版HTMLに全bytes一致します。

## 再現した問題と修正

| 問題 | 再現・原因 | 修正・確認 |
| --- | --- | --- |
| 既存名前付き保存が怪異を欠く | 旧HEAD6044でもworkingにはhorrorがある一方、favorite builderが含めないことを実再現 | 既存optional fieldをbuilderへ追加。CS01・CS04で保存、呼戻し、履歴、実JSONを確認 |
| 初期実装のタグ欄が低い | 360×640の画像で×・日本語名が隠れる。空欄も含めた初期検査は見逃した | 可視46px以上と実タップを検査し、選択行の高さを確保 |
| 明示コマ入口でカードscopeが共有のまま | C18を先に失敗させ、コマdialogとカードIDの不一致を確認 | 既存dialogの同じ安定IDへ追従。C18 PASS |
| コマ別OFFに共有用enabledをコピー | C09でlocal保存のキーを検査してFAIL | mode／weight／parametersだけを保存。C09 PASS |
| 文字拡大で未選択説明が欠ける | 文字150%でタイトル・説明がカード下端を超える検査を先にFAIL | 実測高で行を確保。12 UIケースPASS |

上記は修正済みです。再現製品不具合の未解決は0件です。初期の誤った候補ID、閉じたdialogのエラー要素参照、空chip欄への可視高判定は新検査側の指定ミスで、元expectedを書き換えずに訂正しました。PWAの途中FAILは検査設定が旧cache名まで置換したことが原因です。対象ごとのcache設定に限定し、旧cache→新cache→offlineを再検証しました。

製品更新をまたいだ途中結果は最終PASSに含めません。最終集計は同一HTML・同一試験ソース・正しい対象URLで完走した26runnerだけです。途中のFAIL・中断・旧製品結果を消さず、development-recordsへ保存しました。

## PWA・未確認・判定

検証はlocalhostの隔離originと模擬保存だけで実施しました。SW SHA-256 `dc4c432469f5324189b3b57dd373246bda8f7e303685424ec10437ec194ed5b5`、cache名以外は旧改善版とbyte一致です。network-first、HTML失敗時の旧cache保持、更新通知、非強制reloadを回帰確認しました。

Android実機、実IME／OS picker、OS設定としての文字拡大、端末のPWA導入、SeaArt実画像品質は未確認です。公開origin更新と既存Sites上書きは今回の禁止範囲で行っていません。新しいSitesも公開していません。Codexが実機保存をバックアップしたとは主張しません。

mainは `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。公開HTMLは `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72`、公開SWは `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a` の旧公開版です。Pagesのsourceはmain:/、buildは同じmainです。

自動検証範囲ではmain反映を検討できる状態ですが、[Android確認](CHECKLIST_怪異カードタグAndroid確認.md)と成果物の確認後、別途承認が必要です。今回main・公開PWA・既存Sitesを変更していません。既に怪異設定を欠いていた旧名前付き保存の内容は本修正だけでは復元できません。

[実装報告](REPORT_怪異カード選択済みタグ改善.md)、[実行手順](tests/card-tags/README.md)、[最終機械集計・原記録](validation/horror-card-selected-tags/README.md)を参照してください。
