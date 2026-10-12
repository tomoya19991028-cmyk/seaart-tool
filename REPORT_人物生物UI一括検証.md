# 人物・生物・擬人化UI 検証結果

**条件付き合格。** 最終HTMLで確認した30runner・451評価単位がPASS、FAIL 0、作成済み自動試験の未実施0です。Android実機と実IME等は未確認です。再現した製品不具合9件は修正済みで、未解決の重大な自動回帰はありません。

最終製品commit：`0fa5c73f57437c090018f18e266542bdc518a35e`。HTML SHA-256 `ed8da8f0978a0249a61778b1433c139c22cad9c95721c7874d11e6493cf610bb`、3,958,894 bytes。旧改善版HEAD `023bb6d2b24395551c06d756faac16440f88b7b5` を基準に、独立worktreeと模擬保存データで実施しました。

## 自動試験の集計

| 試験群 | 評価単位 | 結果 |
| --- | ---: | --- |
| 新・旧改善版との直接比較 UC01〜UC08 | 8 | PASS |
| 新・SW更新／入力維持／擬人化offline／★Undo | 6 | PASS |
| 新・UI／管理／保存障害／Undo U01〜U24 | 24 | PASS |
| 新・縦6／横3／文字150%3（最長登録名・多数タグ・基本適用） | 12 | PASS |
| 怪異カード C01〜C19 | 19 | PASS |
| 怪異カードUI 12条件（通常／漫画） | 12 | PASS |
| 怪異カードoffline | 6 | PASS |
| 怪異カードCS保存・履歴・JSON | 4 | PASS |
| 通常画像優先 N群 | 20 | PASS |
| 通常画像優先6viewport | 6 | PASS |
| 通常画像優先PWA | 5 | PASS |
| 怪異 T02〜T26 | 25 | PASS |
| 保存障害14ケース | 14 | PASS |
| R1 49契約／865 assertions | 49 | PASS |
| Native全文＋既存成人21構成 | 21 | PASS |
| 怪異追加境界20 | 20 | PASS |
| 第1回36＋作成障害8＋移行8 | 52 | PASS |
| 第1回追加境界20 | 20 | PASS |
| 怪異独立 I01〜I36 | 36 | PASS |
| 第2回独立代替 M01〜M14／198候補 | 14 | PASS |
| 怪異 T27簡易漫画＋T28六画面 | 7 | PASS |
| SW更新回帰9 | 9 | PASS |
| 統合 Z01〜Z18 | 18 | PASS |
| 怪異 P01〜P08 | 8 | PASS |
| 統合PWA7 | 7 | PASS |
| 怪異T29旧writer4＋T30offline4 | 8 | PASS |
| 怪異独立UI6 | 6 | PASS |
| 統合UI6／内部作成・再取込み | 6 | PASS |
| モチーフ怪異P01〜P08 | 8 | PASS |
| T01／元固定baseline・12dataset | 1 | PASS |
| **合計** | **451** | **PASS 451／FAIL 0** |

評価単位は契約・操作ケース・viewport・PWA確認点です。865 assertions、全文組数、198候補を重複して総数へ加算しません。JavaScript 17scriptの構文確認と孤立再生成の全bytes比較は別記します。

## 更新前後・既存全文の比較

UC01〜UC08では旧怪異カード版と新製品をそれぞれ隔離ブラウザへ読み、候補表・生成関数・通常画像（人物分離なし／標準／強い）・通常生物・半／完全擬人化・怪異・漫画・怪異OFF・保存キー・成人定義を直接比較しました。すべて一致しました。

候補表比較SHA `d4eb3bc0a39ef1e1a78895c81a4686226e7c4ab3248a3e69843294a9e89a4b0d`、主要生成関数比較SHA `1b02a238ec6727cefef24dd80b1ef710943d48b82a1c2a8817c025ccc61f8115` が更新前後で一致しています。比較SHAは試験JSONの値の集合に対するSHAで、HTMLのSHAとは区別しています。

R1通常210／漫画210／コマ420、Native通常252／漫画252、第1回21／21／42、第2回21／21／42が固定全文に一致しました。これらの通常504・漫画504・コマ504構成を再確認し、簡易漫画snapshotと既存成人21構成もPASSです。怪異の通常人物版・モチーフ版P群は各168組を比較しました。

元固定fingerprint `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`、元expected SHA `e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832` は不変です。

生成ロジック・英語タグ・候補の出力順・重みを変更していません。UIから選択を変えた部分だけが既存生成経路へ反映されます。人物／Creature／擬人化モード／怪異／漫画の各状態の独立性を維持しています。SeaArt実画像の生成品質は検証していません。

## 保存・Undo・PWA

旧v3／v4／v5の移行、名前付き保存、履歴、実JSON往復、元Creature・モチーフUUID／metadata、journal・rollback・別タブ競合は既存試験を実再実行しています。画像・配置・Undoは従来のsession限定範囲です。新namespaceや画像永続保存は追加していません。

新U試験では、名前を保存するまで元設定を変えないこと、個体を取り違えないこと、半／完全の衣装の独立性、非使用モードのdraft開閉・明示保存、盾の部分解除で武器の重みを残すこと、★のUndoと10件上限、設定保存の失敗とlegacy preferenceキーの失敗、旧type省略人物の改名、false値の★とUndo、stale pickerの拒否、位置と奥行きの独立性を確認しました。

★は通常Undoへ記録し、1回でそのお気に入りだけを復元します。通常設定と怪異workspaceを巻き戻しません。人物・候補・生物のdata構造やIDを共通化する処理は追加していません。

新PWA試験は専用localhost originで旧カード版から新SWへ更新しました。旧タブを強制reloadせず入力を保ち、明示reload後には新UIと旧v5／怪異下書きを保持します。offlineの擬人化編集・保存・reload、★Undo、online復帰も確認しています。旧writer・旧cacheのHTML取得失敗は既存SW試験を再実行しました。

SW SHA-256 `13f3f88e81d13cfefcec19a49d091561b24d78a2a158e42aad10a22d066b15c3`。cache名以外は旧版とbyte一致です。manifestは不変、SHA `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` です。

## 検査の設定と途中結果

最終集計は、最終HTMLと同じSHA、正しい対象URL、Git保存した試験ソースのSHAで完走した記録だけを採用します。途中で製品更新をまたいだ結果は最終PASSへ加算しません。

初期matrixのrunnerに旧保護ブランチのURLが残っていました。誤った対象の結果を除外し、URLを訂正して全試験を再実行しました。新PWA fixtureでは、既存のbeforeunload保存で未保存入力も保護されることを確認し、その入力を保つ比較へ訂正しました。新U01は6カードだけでなく、ページ送りの実非表示と1／1も検査しました。これらは新検査側の訂正で、既存のexpected／fixture／assertionsは変更していません。

旧統合UI試験の削除済み作成buttonは、保存した内部作成機能へ入口を設定して再実行しました。削除したbuttonの表示PASSではありません。元の試験をメモリで読み、cache名・入口・明示漫画modeだけを設定しています。元ファイルは不変です。

元source・テスト・fixture等140ファイルは基準HEADと全bytes一致です。HTMLから新moduleだけを除くと旧改善版HTMLに全bytes一致し、孤立再生成も最終HTMLに一致します。SWはcache名だけの差です。最終元テストSHA・適用wrapper SHA・製品の実行前後SHA・対象URLを各execution.jsonで照合しました。

旧第2回モチーフ専用テスト3ファイルは引き続き未回収です。既存M01〜M14を独立代替試験として実行し、元テストのPASSとは報告していません。旧モチーフ作成button専用の表示・focus復帰試験は、今回そのbuttonを削除する仕様と両立しないため原型では実施していません。内部作成・再取込み・Undo・モバイルdialogは統合UIとM群で検証しています。

## 未確認・公開前の条件

Android実機、実IME、OS文字拡大、PWA導入・OS復元、実SeaArt画像品質は未確認です。ブラウザの150%文字やkeyboard領域の模擬は実機合格としていません。公開originで更新試験せず、実利用者の保存データは操作していません。

main HEADは `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`、元改善版HEADは `023bb6d2b24395551c06d756faac16440f88b7b5` のままです。公開HTMLは旧版 SHA `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72`、公開SWは `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a`。公開4 endpointのHTTP 200／全bytes／SHAを作業前後で照合し、Pagesのsource main:/とbuild commitも同じです。旧5worktreeもcleanのままです。

新Sitesを公開せず、既存Sitesも上書きしていません。main反映・公開は未実施です。[Androidチェックリスト](CHECKLIST_人物生物UI一括Android確認.md)を実施し、成果物確認と別途承認を受けてからmain反映を判断してください。

[実装報告](REPORT_人物生物UI一括更新.md)、[実行手順](tests/unified-ui/README.md)、[検証証跡](validation/person-creature-unified-ui/README.md)を参照してください。

自動検証範囲ではmain反映を検討できる状態です。Android実機チェックと成果物の確認が残るため、公開判断は条件付きです。今回main反映を実行していません。
