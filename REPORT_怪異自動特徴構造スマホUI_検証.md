# 怪異自動特徴・構造・スマホUI 検証報告

## 検証対象

- 基準: `cf0336d03e3edf104fdaa911b9bc568a3609bf50`（Sites Version 4の製品HTMLと同一）
- 専用ブランチ: `feat/horror-auto-features-mobile-ui`
- 製品検証commit: `c583cb529ae54b3a6db5d1a08476de8be74dee69`
- 最終HTML SHA-256: `cb2f9a724086db710eb4af50092f2062e7581e1483ad74556c0a6106d232654e`
- 最終SW SHA-256: `137e3e2a58c90a0f449310288b60573b3adfd02f1c8a9cb22b363755130f12f2`
- 検証origin: localhostのみ。隔離Chromium、模擬人物／生物、実利用者のデータ不使用。
- テスト時のGit HEADは開始commit（未commit作業ツリー）。実測製品SHAを各executionへ記録し、PASS後に同じbytesを製品検証commitへ保存する。
- 最終実行結果: `自動検証対象は合格。41 runner／556評価＋品質12＋再生成・構文1=569 PASS、FAIL 0。実機と実画像は未実施。`

## 集計方法

機能／UI／回帰の41 runnerを評価単位で集計する。R1の865 assertions、全文比較行数、種類／構造の組合せは、その試験の内訳として別記し、件数を水増ししない。quality12検査と再生成・20 inline script構文の1集約検査を別に合算する。途中のFAILと中断は最終PASSへ読み替えず、圧縮証跡に残す。

|試験群|評価数|結果|
|---|---:|---|
|`auto-compatibility`|1|PASS|
|`auto-contracts`|31|PASS|
|`auto-fixed`|3|PASS|
|`auto-inherited`|2|PASS|
|`auto-pwa`|7|PASS|
|`auto-shared-prompt`|1|PASS|
|`auto-shared-ui`|1|PASS|
|`auto-ui`|12|PASS|
|`boundaries`|20|PASS|
|`card-contracts`|19|PASS|
|`card-persistence`|4|PASS|
|`card-pwa`|6|PASS|
|`card-ui`|12|PASS|
|`combined-pwa`|7|PASS|
|`combined-ui`|6|PASS|
|`contracts`|25|PASS|
|`edges`|36|PASS|
|`faults`|14|PASS|
|`fixed`|1|PASS|
|`integration`|18|PASS|
|`legacy`|21|PASS|
|`motif`|52|PASS|
|`motif-boundaries`|20|PASS|
|`motif-prompts`|8|PASS|
|`normal-contracts`|20|PASS|
|`normal-pwa`|5|PASS|
|`normal-ui`|6|PASS|
|`prompts`|8|PASS|
|`pwa`|8|PASS|
|`pwa-regression`|9|PASS|
|`r1`|49|PASS|
|`round2-retest`|14|PASS|
|`story-contracts`|29|PASS|
|`story-pwa`|6|PASS|
|`story-ui`|12|PASS|
|`ui`|7|PASS|
|`ui-extra`|6|PASS|
|`unified-compatibility`|8|PASS|
|`unified-contracts`|24|PASS|
|`unified-pwa`|6|PASS|
|`unified-ui`|12|PASS|
|quality（原本・候補・source・SW等）|12|PASS|
|再生成一致＋20 inline構文の集約|1|PASS|
|適用対象 合計|569|PASS569／FAIL0|

## 追加機能の確認

A01〜31、AS01、AF01〜03、AH01／02、AP01: normal抑止、6種類×部分／完全12組、構造36組・非生成72条件、主／補助最大2、手動保持、同一タグ・手動重み優先、自動除外／OFF／再適用、構造／元特徴競合、固定身体の排他、人物2人／生物／独立怪異、コマ優先、virtual候補の下書き・確認・部分確定・ゴミ箱復元、通常／下書きUndo、10件上限、session画像対応、5段階保存障害、import lock、別タブ、名前付き保存・履歴・JSON・reload、既存作成UIの導線を実行。

AH01／02で、継承した自動除外がコマの×／OFF-ONで復活しないことを確認。AP01で、同じ派生身体・重みを手動固定しても共通外見・漫画・コマ全文と順序が一致。

AF01で変更前の自動外見を6コマへ固定してから主種類を変更しても、元のweightedタグ列を保持。AF02／03で固定済みの別身体と自動身体、固定身体同士を競合として拒否し、前の生成結果を保護。相反設定の無言上書きを行わない。

6ストーリープリセット×1／2／4／6コマ=24組で、新自動を有効にした対象の適用・コマ生成・Undoを実行。旧S05〜10は自動未設定で1〜6コマ36組を再実行し、段階的設定・他人物／生物非変更を確認。元のpreset JSON／適用JSはbyte不変。

## 既存プロンプト

- Version 4との追加比較: 種類6×状態3×分離2=36条件。通常36、漫画36、コマ144のpositive／negativeとresolverを厳密比較。自動未設定では一致。
- R1: 49契約／865 assertions、通常210／漫画210／コマ420の固定全文と12dataset fingerprintを再検証。
- Native通常252／漫画252、既存成人21構成を再実行。
- 怪異人物分離・モチーフ人物プロンプトの各168比較、モチーフ第1回36契約・作成障害8・移行8・境界20を再実行。
- 第2回の原専用3ファイルは以前から未回収。保存済み独立代替14契約（198候補、通常21／漫画21／コマ42）を再実行。原テストのPASSとは呼ばない。
- 既存簡易漫画snapshotと固定baseline比較を再実行。期待値／fixtureを変更していない。

新タグを有効にした場合の出力差は仕様どおり。人物1の影、人物2の獣性、生物の呪い、独立怪異の霊体が各ブロックへ出力される。新自動ON時の構造検証とSeaArt実画像の人物分離品質は区別する。

## 保存・Undo

v3／v4／v5移行は既存互換性／fault／PWA／第1回移行試験で再実行。Version 4由来の怪異設定に自動フラグを勝手に追加しない。保存v5、既存namespace、5キー、人物UUID、Creature参照、metadataは不変。

今回の自動設定を名前付き保存・履歴・JSON実読込・reloadで確認。virtual IDを持つ下書きとゴミ箱も往復できる。新設定が不正な場合、settings／working／history／marker／journalの書込失敗時、import中、実別タブの更新時には成功として確定せずRAM・保存・Undoを保護する。既存rollback不能・journal復旧境界も既存試験を再実行する。

既存Undo修正B01/B02、非同期画像追跡B03のソースは不変。コマIDとsession画像・配置の管理を再検証し、画像のJSON永続保存を追加していない。

## スマホ・PWA

新UIは360／393／430×640／800の縦6、横3、文字150％相当3の計12条件で実操作。旧normal-first UI6も実行。44px以上の状態／強度／構造／★／×、横overflowなし、検索、英語OFFの高さ削減、英語設定とscroll復元、header閉じる、コマSave／Cancel、必要な共有確認後の新UI維持を検査する。

PWAは旧Version 4→今回版の隔離originで更新通知・旧タブと未保存RAM保持・明示reload・旧保存・オフライン起動／編集／保存／reload／再オンライン・HTML取得失敗時旧cache保持を実行。SWはcache名のみ変更し、公開origin／Sitesでは更新試験しない。

## 原本・生成元の保護

既存151テスト／fixtureと84候補はGit基準とbyte一致。既存manual resolver、人物／生物UI、normal/cardタグUI、モチーフ、6preset、主要生成処理は変更せず、新しいwrapperで合成する。ソースから隔離パスへ再生成したHTMLと製品HTMLは全byte一致し、20 inline scriptを構文検査する。

旧試験のreplayは原本へ書き込まず、URL・承認済みUI入口・今回のcache名を実行時調整。旧T28の状態タイトルtapは、新仕様の非操作見出しに変更されたため、保持したlegacy preview backendを開く。実際の新ボタンtapは追加UI12で検査。旧独立UIは非操作見出しではなく6カードcontainerのgeometryを参照する。実ボタン44pxの条件は維持する。旧入口でのraw FAILは保存し、未変更の期待値で再実行する。旧UC01の12候補比較もその厳密投影を維持し、全84件はS01とqualityで追加検査する。旧story qualityの旧foundation／cache名固定条件は今回の承認済み変更と合わないため合否条件に使わず、今回の12品質検査・保存互換性・全文比較で補完。旧ファイル／期待値は保護する。

## 失敗・修正・残存事項

実装中のB01〜10と修正内容は実装報告を参照。初期テストの仮ID／selector／仮画像／人物ラベルの誤りはテスト作成上の問題として区別し、製品不具合数へ含めない。失敗を消して同じディレクトリへ再実行せず、新しい証跡へ保存した。

未実施: Android実機、実IME、実SeaArt画像品質、今回版Sites配信、公開originでの更新受入、main統合。元の第2回テスト原本は未回収。英語表示はsession限定（再読込OFF）。原本151件の固定期待値は変更せず、旧品質検査の非適用条件をPASSとは扱わない。

自動の材質競合は明示されたタグ・構造・固定身体を対象とする。任意の自由入力文章や画像モデルの解釈まで完全な矛盾判定を保証しない。意味の異なる複合設定が生成モデル上でどう見えるかは実画像で確認する。

## GitHub・公開保護と判定

mainは `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`、基準検証ブランチは `cf0336d03e3edf104fdaa911b9bc568a3609bf50` のまま。旧7 worktreeのHEAD／状態と151原本も開始時と一致。公開HTMLは `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72`、公開SWは `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a` のまま（HTTP全bytes取得の読み取り確認）。Sitesは最新Version 4、source `4fd7c6192ffa84e5746a5b360bf411bc2dcf3d99`、deploymentとアクセスrevisionが開始時と同じ。main／公開PWA／Sitesの変更操作は行っていない。

専用ブランチへ製品検証commitと報告commitを通常pushし、remote HEAD／remote treeの全変更ファイル、GitHub APIから独立取得したHTML／SW／主要ソースを最終回答で照合結果とともに報告する。

今回版は専用ブランチの検証成果物。実機と画像品質は未確認であり、Sites配信とmain反映は別工程・別承認。今回の作業では実行しない。
