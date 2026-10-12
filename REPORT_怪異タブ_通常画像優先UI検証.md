# 通常画像優先UI：回帰検証結果

**条件付き合格。** 改善版を対象とする最終22runnerは全exit 0。集計360ケースはPASS 360／FAIL 0／作成済み自動試験の未実施0。Android実機・実IME／OS画像選択・SeaArt実画像品質・公開origin更新は未実施。本人限定Sitesは上書きしていない。

対象製品commit `1a8394d19c04ef9f0282fbeb90432e2ad074fed0`、HTML SHA-256 `3bf2d5c753fb69ad402aa08f32f720a03834679f7b1921dd56973b5ad8d0a33c`。全最終実行で対象URL・製品SHA前後・試験ソースSHAを記録し照合した。実行時は統合HEAD上のworking treeで、その検証済みbytesを後で製品commitへ保存した。

## 実行した群

既存統合の329ケースは、契約・操作ケース・viewport・既存成人構成・PWA確認点を前回と同じ粒度で集計。全文組数・865 assertions・198候補入力は重複加算しない。

| 群 | 実行結果 |
| --- | --- |
| 新N01〜N20 | 20 PASS |
| 新通常UI 360／393／430 × 640／800 | 6 PASS |
| 新通常PWA実チェック操作・offline・reload・解除・online | 5確認点PASS |
| 怪異T02〜T26 | 25 PASS |
| T01固定比較・12dataset・raw producer・構文 | PASS |
| T27簡易漫画／T28旧漫画UI6viewport | PASS |
| T29旧4writer／T30実offline lifecycle | PASS |
| I01〜I36 | 36 PASS、B01〜B04再発なし |
| 保存障害14／境界20 | 全PASS |
| P01〜P08・実モチーフ版P01〜P08 | 各8 PASS、各168組 |
| 怪異追加UI・両機能UI | 各6viewport PASS |
| 統合Z01〜Z18 | 18 PASS |
| 第2回代替M01〜M14 | 14群PASS、198候補全実再取込み |
| R1 | 49契約／865 assertions PASS |
| Native／既存成人 | 通常252・漫画252・成人21構成PASS |
| モチーフ第1回 | 36契約・作成障害8・保存移行8・追加境界20 PASS |
| 旧SW更新回帰・両機能PWA | 9＋7確認点PASS |
| 合計 | 既存329＋新31＝**360 PASS** |

必須T01〜T30は30項目すべて確認。元T28は旧漫画向け操作の試験なので、タブ入場後に新しい「漫画」を明示選択する設定だけをメモリ上で追加した。以降のassertions・expectedは元のまま。通常新操作はN群で別に検証。PWAは対象URL／一意cache名だけを設定する。元テストを書き換えていない。

## 通常／漫画・保存の重点結果

- 初期表示・タブ再入場・reloadは通常。表示だけの往復はworking、disk、Undo、下書き、コマIDに無作用。表示モードをJSONへ保存しない。
- 通常の候補選択・解除・タグ×は即時反映し、対象コマselectや漫画影響プレビューを開かない。対象1／2／Creatureで分離、元profile／Creatureは不変。
- 通常状態は選択を保持しても怪異タグを抑制。詳細で重み1.7と個別強度を設定し、通常生成のタグへ反映。
- 基本の状態・種類・強度・構造は不要な漫画プレビューを挟まず保存。必要な排他競合・共有漫画への破壊的影響は通常dialogで確認し、取消で不変。
- 通常quickの容量注入失敗ではRAM／disk／Undoとcheckboxを復元。staleなquick／detail、消失owner、実2タブの古い保存を拒否し、勝った下書きを保持。
- 漫画のbuffered特徴編集・影響確認・取消・コマ別上書きを維持。既存コマeditorから同じstable IDへ明示的に開く。下書き・部分確定・独立Undo・ゴミ箱・3way・画像decodeは全回帰でPASS。
- 旧統合v5を実旧writerで用意して読み込み、怪異・workspace・コマID・キーを維持。旧v3／v4・第2回v4・名前付き保存・履歴・JSONは既存I／Z／移行群で再実行してPASS。
- 実SWのofflineで通常checkboxを操作し、保存・reload・解除・再reload・online復帰を確認。公開originは使わない。

## プロンプトと保存互換性

R1通常210／漫画210／コマ420、Native252／252、第1回21／21／42、第2回21／21／42は全文一致。構成数合計は通常504・漫画504・コマ504。第2回は保存済み第2回製品・同じ外見の通常人物の双方と比較した。

固定fingerprint `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`、元expected SHA `e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832`。12datasetとraw `generate`／`generateManga` bodiesは不変。怪異OFFの既存全文を変更していない。標準／強いの人物分離は各P群112組、分離「なし」は共有列という既存の範囲を維持する。

保存version 5、horror-v1の5キー、UUID、motif metadata、成人拒否、旧キー保護、journal・rollback、workspace分離は不変。画像・配置とUndoのsession限定仕様を維持。統合基点のtests内原本・fixture・既存保存記録123ファイルはbyte不変。

## 途中のFAIL・中断と未実施

初回のサーバー不在、複製runnerに旧統合URLが残った指定ミス、並列実行による8GB cgroup OOMを原記録に残した。誤った対象の結果は今回のPASSに含めない。OOMではT08・M02のTarget crashedとoom_killを確認し、該当・中断群を低並列で全文再実行した。最終22runnerはすべて正しい改善版URL／repoの同一bytesで完走した。

実装初期の未編集layout誤判定による余分な解除確認は修正し、N03・N08で検証した。未解決の再現製品不具合0。第2回原本3テストは前回同様未回収、実行したM群は明示した独立代替であり、原本のPASSを装わない。

実Android、実IME・OS picker、実SeaArt画像品質は未確認。公開PWA・旧Sites上書きは今回の禁止範囲で、実施していない。ローカルZIPは新しい独立確認環境であり、旧Sitesの更新完了とは報告しない。

## 判定と提出

通常画像優先化の完了条件は自動検証範囲で満たした。main・公開は実行せず、成果物の確認と別途承認を待つ。利用者自身のJSONバックアップ確認と[Android手順](CHECKLIST_怪異タブ_通常画像優先UI実機確認.md)での実機確認を推奨する。

[実装報告](REPORT_怪異タブ_通常画像優先UI改善.md)、[実行手順](tests/normal-first/README.md)、[機械集計](validation/horror-normal-first/summary.json)、[失敗・完走の証跡](validation/horror-normal-first/README.md)を参照。
