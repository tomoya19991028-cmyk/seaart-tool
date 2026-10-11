# Creatureモチーフ独立人物 第1回：保存境界調査・実装停止結果

実施日：2026-10-11 UTC。**判定：保存互換性の設計承認待ち。人物作成機能は未実装。**

指示書第6項「保存versionやnamespaceの変更が必要と判明した場合は、その変更を実装する前に停止し、判断を求めること」および第12項の停止条件に従っている。保存形式・人物成人機能の境界を実Chromiumで調査し、旧readerが由来metadataを無視する問題を再現した。製品ファイルは変更していない。

## 1. 作業基点・Git

- 開始時にGitHubからfetchしたmain：`326b4e482f17d4bd94605696ed2e3fdda30b43d0`。
- 作業ブランチ：`feat/creature-motif-person-integration1`。最新mainから別worktreeを作成し、開始時cleanを確認した。
- worktree：`/workspace/seaart-creature-motif-person`。
- 新しい差分は本報告、診断テスト1本、JSON検証記録3件のみ。診断成果をcommitする。人物作成の実装完了commitではない。
- main、公開サイト、Service Worker、manifest、アイコンの変更なし。
- 元の未commit R1成果物がある別worktreeは変更していない。

| 製品ファイル | Git blob | SHA-256 | bytes |
|---|---|---|---:|
| index.html | edacabf24ea9648a06fa900bd3668921d47b6a62 | fafddf9ea6040430529e74453de5df2091acb665c1d76c612c4189f21b1c8353 | 3,754,243 |
| sw.js | f002716e9f3a632e3a7107a37a59e5837f265ff6 | 91cd2a62257239b189c7f634d03019942f9968c2c47598695144b9f23092485a | 2,329 |
| manifest.json | 0b9eee56bb9dbb59a1dd36f3ce997200f3e4a451 | d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f | 762 |

index.htmlのUTF-8／CRLFを維持。保存方式は現行root JSON v4、actorExtensions v3、adult v1、humanProfile v1および現行5キー群のまま。

## 2. 参照資料

R1原本 `tests/creature-stage5-remaining-r1.cjs`、R1報告、固定された元の生成全文・dataset baselineを確認し、原本を変更せず再実行した。

R4調査報告と「Creature成人擬人化方式の導入可能性調査」は、GitHubの取得済みブランチ履歴・最新main、workspace、今回アクセスできる添付ファイルから発見できなかった。**未確認**。それらの内容に準拠したとは判定していない。実装再開時には該当資料の確認も必要。

## 3. 保存境界の実測

実Chromium `154.0.8037.57`、localhost、隔離contextで現行HTMLを実行した。Service Workerはこの試験ではblockした。テストは無害な髪色・目色・髪型と禁止metadataを持つ人工original人物を作る。成人候補の選択・成人タグ生成・許可対象の登録は行っていない。

人工metadataは設計の正式採用ではなく、旧readerの挙動を測るためのfixtureである。`originalCharacters`とperson ownerのextension双方に`originKind: creature-motif`、`adultAccess: not-permitted`を置き、IDにも`original-motif-`を付けた。

| 試験 | 現行HTMLの実測結果 | 判定 |
|---|---|---|
| metadataを持つoriginal人物の保存 | v4／extension v3で受理、markerも保存される | 格納可能だが資格保護ではない |
| 通常人物の確認checkbox | 禁止metadataを参照せず表示・操作できる | 要求を満たさない |
| checkbox操作後 | `adultReady()`、`adultReadyFor(allPeople())`がtrue | 旧readerの迂回を再現 |
| 実reload | metadataは残るが人物確認も復元されready=true | 拒否契約が必要 |
| metadata versionを999に改ざん | working validatorが受理 | strict validation不足 |
| metadata削除 | working、名前付き保存構造、履歴構造、v4 backup validatorが受理 | 通常人物への自動降格を防げない |
| metadata削除後の復元 | 人物確認のready=true | 欠落検出が必要 |
| 外側extensionをversion 4にした人工working | 現行validatorとcommitが拒否 | 旧reader拒否に使えるversion境界を確認 |
| 拒否されたcommit前後 | RAM・disk・Undoが一致 | この拒否試験では原子的 |

元CreatureのNative・semi外見・extensionは人工人物追加前後で一致。Creature資格registry、Creatureセッション許可、result access許可は0件。これは人物の従来確認フラグとは別であり、Creature側資格判定の緩和はない。

重要：このテストの成功は「問題を再現した」という意味であり、作成機能の安全性PASSではない。人物成人タグの出力自体は検証していない。

## 4. 接続箇所の調査

- `allPeople`：すべてのoriginal人物を人物として扱い、追加metadataによる区別はない。
- `renderAdult`：個体IDの確認checkboxを生成するが、motif由来を検査しない。
- `adultReady`／`adultReadyFor`：enabledと確認フラグに依存する。
- `afValidateWorking`：originalCharactersを配列として検査する。motif metadataの必須契約はない。
- `afValidateExtensions`：v1／v2／v3を許容し、追加のperson由来fieldを認識しない。未知の外側versionは拒否する。
- `restoreWorking`／`captureWorking`：originalCharactersをdeep copyするが、人物の由来と利用資格の対応は検査しない。
- `saveFavorite`、history、JSON backupにも同じ問題がある。
- `generate`／`mangaPeople`：original人物の通常経路が存在する。新人物の一般生成に利用できるが、保存境界の承認前には接続を実装していない。

これらの製品関数は変更していない。`actorFormTransaction`を新規人物作成へ流用する実装もしていない。

## 5. 承認を求める保存設計案（未実装）

推奨案は**actorExtensions v4＋独立した次世代5キー群**。root JSON v4、adult v1、humanProfile v1、actorFormCatalog v1は維持する。

外側extension versionの更新で、旧readerがJSON／favorite／historyの新人物を由来不明の通常人物として読むことを拒否させる。namespace分離は、旧タブが引き続き旧データを編集しても新bundleへ書き込めないようにするための推奨対策。いずれも承認前には変更しない。

提案キーは現行キー末尾に次を付ける。

| 用途 | 提案キー |
|---|---|
| settings | seaart-prompt-builder-v4-creature-adult-v1-result-access-v1-motif-person-v1 |
| working | SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1 |
| history | SeaArt_generated_prompts_v2-creature-adult-v1-result-access-v1-motif-person-v1 |
| marker | SeaArt_actor_forms_commit_creature_adult_v1_result_access_v1_motif_person_v1 |
| journal | SeaArt_actor_forms_recovery_creature_adult_v1_result_access_v1_motif_person_v1 |

必要な契約：

1. `original-motif-UUID`を予約したID体系とし、person ownerと必須由来定義を相互照合する。由来metadataには元CreatureのUUID・owner・species・identity・receiptを保存しない。
2. 一般identityと人物成人機能の許可を分ける。motif人物の成人利用は今回常に不可。由来metadataや一般identityから利用許可を発行しない。
3. 必須metadataの欠落・未知version・owner／UUID不整合を拒否または隔離し、通常人物へ読み替えない。改ざんされた許可フラグを信用しない。
4. 現行bundleをread-onlyで検証し、working／favorite／historyすべてを移行する。旧5キーを削除しない。新5キーが一つでも存在する場合は旧群へ暗黙fallbackしない。
5. marker／hash／revision／journal／再読込検証を揃える。容量不足・途中失敗では旧bundleを保ち、新群を確定扱いしない。
6. 名前付き保存・history・Undo・管理Undo・JSON import/exportの全経路で同じ由来契約を使う。セッションMapを保存しない。
7. 人物の成人入口・確認・収集adapterにはmotif対象のみの拒否を追加する必要がある。既存人物だけのstateのUI・生成は固定baselineと比較する。混在時もmotif人物へ共有成人値を適用しないため、相手参照・共有値・管理カードを含む判定範囲を先に確定する。今回その契約変更も実装していない。
8. 新namespace対応の修正版による復旧を基本とする。旧HTMLへの単純差し戻し、localStorage全消去、旧群の自動mergeを復旧方法にしない。

旧readerで新人物を通常利用できることは保証しない。旧HTMLは旧保存群に限定される。新形式JSONの旧reader拒否を検証する必要がある。任意のJSONを完全に別の通常人物へ作り直す行為まで、クライアント内のmetadataだけで防げるとは保証しない。

## 6. R1・固定baseline回帰

原本R1を再実行し、**49契約、865 assertions、通常210件、漫画210件、コマ単独420件**に合格。7モデル×3分離方式とNative／semi／fullを含む。

さらに元の保存済み `r1-generation-fulltext.json` と、今回のbefore／afterをdeep comparisonした。生成全文・順序・BREAK・重み・Negative・12datasetが一致。期待値を今回再生成して差分を隠すことはしていない。

出力配列SHA-256：`7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。

| dataset件数 | 実測 |
|---|---:|
| Character catalog | 1,390 |
| 人物基本外見 | 1,384 |
| Creature species | 94 |
| Creature基本外見 | 60 |
| Creature features | 275 |
| Creature全field候補 | 500 |
| 共通adapter | 1,444 |

12個のdeep fingerprintは `tests/results/creature-motif-person-r1-fixed-comparison.json` に記録。元の値と一致。

固定比較用の補助スクリプトは最初に件数を49と865で二重加算する条件により停止した。件数の意味を修正して再実行し合格。生成全文比較は最初から一致しており、製品コード・baselineの修正はない。

## 7. 実施・未実施の区別

実施：最新GitHub取得、clean確認、製品hash／改行確認、実Chromium起動、旧readerのcheckbox・保存・reload、metadata欠落／不明version／v4 validator／favorite・history validator、未知外側version拒否のRAM・disk・Undo比較、元Creature不変、R1原本再実行、元の固定全文とfingerprint比較、診断スクリプト構文検査。

未実施：新人物作成UI、一般外見選択・プレビュー、新規人物作成transaction、作成成功／容量不足／描画例外のrollback、新機能のUndo、新人物の通常／漫画／コマ出力と手動人物比較、新保存群移行、旧タブ共存、新機能の6viewport、実Service Worker／オフライン、実機スマートフォン、公開Pages試験、簡易漫画の独立した代表fixture再実行。保存境界の停止条件に達したため、これらを成功と扱わない。

既存R1が含むv3／v4 import、名前付き保存、履歴、管理Undo、reload、pagehideの契約は今回実行している。新人物への同等対応が完了したという意味ではない。

## 8. 成果物・再実行

- 診断スクリプト：`tests/creature-motif-person-save-boundary.cjs`。
- 保存境界実測：`tests/results/creature-motif-person-save-boundary.json`。
- 基点記録：`tests/results/creature-motif-person-baseline.json`。
- 元の固定全文との比較：`tests/results/creature-motif-person-r1-fixed-comparison.json`。
- 大きな検証記録：`/workspace/seaart-creature-motif-integration1/`。baseline HTML、R1全文・result、v3／v4 export/import試験データ、実行logを保持している。

```sh
node --check tests/creature-motif-person-save-boundary.cjs
node tests/creature-motif-person-save-boundary.cjs
RESULT_DIR=/workspace/seaart-creature-motif-integration1/r1-replay \
BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html \
TARGET_URL=http://127.0.0.1:8765/seaart-creature-motif-person/index.html \
CHROMIUM_PATH=/usr/bin/chromium node tests/creature-stage5-remaining-r1.cjs
```

localhostはworkspaceをrootとして配信する。診断は隔離ブラウザcontextで行い、利用者の実データを取得・変更していない。

## 9. 再開・第2回への判断

第1回の作成機能は未完成であり、第2回へ進める判定はしていない。先に上記の保存形式・namespaceとmotif限定の成人機能拒否契約について承認が必要。承認後に必須metadata、原子的人物作成、一般候補adapter、人物ページUI、通常／漫画接続、容量不足・旧reader・スマホ・PWAまで実装検証する。

既存original人物への上書き取込みは未実装。安全な新規作成を優先する方針を維持する。main反映は今回実施していない。
