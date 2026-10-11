# Creatureモチーフ独立人物 第1回統合：実装・検証結果

実施日：2026-10-11 UTC。**判定：一般生成の第1回実装・検証完了。専用ブランチのレビュー対象。main・公開サイトへの反映なし。**

## 1. 基点・成果物

- 最新mainを開始時およびcommit前にfetch：`326b4e482f17d4bd94605696ed2e3fdda30b43d0`。
- 再開時の既存ブランチHEAD：`1132a2636b1d6b559dcd0730d46ea173aa33769c`。診断報告・原本テスト・前回JSON記録を保護した。
- 作業ブランチ：`feat/creature-motif-person-integration1`。
- 実装・検証対象commit：`6dcc8a4087dc4e0d55e92e992b8314732536ae5e`。これに本報告書の記録commitを追加する。最終提出HEAD・push照合はチャットおよび `final-git-verification.json` に記録する。
- 製品変更：`index.html`、`sw.js`。manifest・アイコン・候補データは変更していない。
- `index.html`はUTF-8／CRLF、SWは既存LFを維持。13 inline scriptsとSWの構文確認に合格。

| ファイル | Git blob | SHA-256 | bytes |
|---|---|---|---:|
| index.html | `67abdcc632af594687739ae331d00d224d41ff9f` | `de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72` | 3,775,550 |
| sw.js | `ac3608e670edfb95c79172988c3026a31b1cd119` | `05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a` | 2,320 |
| manifest.json | `0b9eee56bb9dbb59a1dd36f3ce997200f3e4a451` | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` | 762 |

前回の「保存境界調査・実装停止結果」は履歴資料として未変更。今回はユーザーの再開承認に基づき、そこで提案したversion・namespace変更を実装した。

## 2. 参照資料の確認範囲

確認済み：前回保存境界調査・停止報告、R1原本、R1診断回帰報告、保持された固定生成全文／12 dataset原本、今回の再開指示。

未確認：`REPORT_Creature成人擬人化方式_導入可能性調査.md`、`INSTRUCTIONS_Codex_Creatureモチーフ独立人物_第1回_取込プレビュー.md`、R4調査報告。取得したGitHub履歴・workspace・アクセス可能な添付資料から発見できなかった。これらの未確認資料への準拠は主張していない。承認済みの再開指示と現行mainの契約を実装基準にした。

## 3. 保存形式・移行

root JSON v4、adult v1、humanProfile v1、actorFormCatalog v1を維持。actorExtensionsはv4。v1／v2／v3を読み込み、v4へ正規化する。外見編集・形態適用・Undo・import・resetでv3へ降格しない。

| 用途 | 新キー |
|---|---|
| settings | `seaart-prompt-builder-v4-creature-adult-v1-result-access-v1-motif-person-v1` |
| working | `SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1` |
| history | `SeaArt_generated_prompts_v2-creature-adult-v1-result-access-v1-motif-person-v1` |
| marker | `SeaArt_actor_forms_commit_creature_adult_v1_result_access_v1_motif_person_v1` |
| journal | `SeaArt_actor_forms_recovery_creature_adult_v1_result_access_v1_motif_person_v1` |

namespace：`creature-adult-v1/result-access-v1/motif-person-v1`。

- 直前のresult-access群、その前の5-B群、さらに旧保存群をread-onlyで検査する。旧marker・journal・revision・hashを照合し、working・名前付き保存・historyを同時移行する。
- 新キー群のいずれかが存在したら、その群の検証・復旧を行う。破損時に旧群へ暗黙fallbackしない。
- 旧キーは削除・上書きしない。移行後に旧タブが保存しても、新群へmergeしない。
- 新bundleは既存のtransactionで書込み・再読込・hash・marker検証を行う。pending journalの途中終了はmarkerに対応するbundleへ復旧する。
- committed journal削除失敗では最新bundleを保持する。容量不足・settings／working／history／marker／journal書込み失敗では既存データを保持し、未確定群を正常扱いしない。
- 一般追加カードを編集した人物も、対応するsettingsを使って復元時に検証する。
- 旧main HTMLに新JSONを渡した実試験で、extension v4を拒否した。旧HTMLによる旧群の保存は新群を変更しない。

復旧方針は、新namespace対応コードで検証済みjournal／確定bundleを復旧すること。旧HTMLへの単純差し戻し、localStorage全消去を自動復旧策にしない。利用者端末の実データを取得・バックアップしたという意味ではない。

## 4. 識別契約と成人向け機能の拒否

ID：`original-motif-`＋RFC形式の新UUID。person ownerは `{kind:'person', originalId:本人ID}`。

必須metadataを人物recordとperson extensionに保持し、profileにも本人ID markerを置く。

```javascript
motifPerson = {
  version: 1,
  actorId: 'original-motif-UUID',
  originKind: 'creature-motif',
  createdAt: 'ISO日時',
  adultAccess: 'denied'
};
profiles[actorId].motifPersonId = actorId;
```

元CreatureのUUID・owner・species・identity・form・成年根拠・receipt・許可はmetadataへ保存しない。プレビューの参考元参照は画面を閉じると破棄する。

metadata欠落・未知version・ID／owner／record／profile不一致・重複UUID・未知extension field・source参照混入を拒否する。reserved IDがあるのにmetadataがなくても、通常人物へ自動降格しない。

成人確認checkboxは無効。`adultReady`／`adultReadyFor`、成人対象収集、成人preset適用、人物間の成人target、個別成人設定・追加カード・重みの保存を拒否する。motif混在時は共有成人出力を適用しない。名前付き保存・history・JSON・reload・Undo・reset後もmetadataと拒否を維持する。

一般identityの`adult woman`／`adult man`は利用資格ではない。本番Creature資格定義0件を維持し、新しい成人向けタグ生成・許可発行は追加していない。従来人物だけの既存フローは別途全文比較で維持を確認した。

## 5. 人物作成・外見取込み

人物ページの既存操作欄へ「Creatureモチーフから人物を作成」を追加。参考元→保存済みsemi/full→項目プレビュー→名前／一般identity→作成確認の順に操作する。

取込みは髪色・目色・一般髪型の3項目。既存catalogのvalueと標準IDが一致し、非表示・編集済み・不明候補でないことを検査する。髪色の単色／複数色、目色の単色／オッドアイ、および対応する一般項目の重みをコピーする。

衣装・衣装部位・配色・耳／角などの追加取込みは未実装。安全な一般候補対応を確認した範囲を今回増やしていない。自由入力・Native構造・原作固有identity・関係／相手・成人設定はコピーしない。既存人物への上書き取込みも未実装。

`mfCreatePerson`は専用transaction。`actorFormTransaction`を無改造流用していない。

1. 最新source・保存revision・候補・metadataを再検証する。
2. originalCharacters・profiles・extension・active人物をまとめて更新する。
3. 人物ページ・漫画表示を更新し、保存bundleを確定する。
4. 成功後にUndoを1回追加する。

プレビュー・キャンセル・失敗ではUndo0回。保存失敗・描画例外・別タブ競合ではRAM・disk・Undoを保護する。髪などを作成後に編集しても元Creatureへ同期しない。元Creatureは削除・OFF・mode変更しない。

## 6. 生成接続

新人物は既存original人物として`allPeople`／人物グループ／`mangaPeople`を使用する。通常・漫画全体・コマ単独の一般生成が動作する。`generate`／`generateManga`のタグ生成本体、modelOrder・BREAK・Negativeは変更していない。入口に識別検証を追加した。

同じ一般設定を手入力した通常original人物と、7モデル×3分離でPositive／Negative全文を比較：通常21、漫画21、コマ42出力が一致。参考元Creatureを生成対象に残した条件でも、人物グループにsource species・ownerが混入しない。元Creatureと新人物は別被写体。モデルによる実画像の再現性を確認したという意味ではない。

簡易漫画は新規接続せず、既存代表snapshot／Positive／Negativeが一致することを確認した。

## 7. 検証結果

実Chromium `154.0.8037.57`、Playwright、localhostの隔離contextで実施。

| 試験 | 結果 |
|---|---|
| R1原本の契約・matrix | 49契約／865 assertions、通常210・漫画210・コマ420：PASS |
| 原本固定全文・12 dataset | 元成果物とdeep comparison／SHA-256一致：PASS |
| 独立人物機能 | 36契約：PASS |
| 作成障害 | settings・working・history・marker・journal・quota・描画・staleの8件：PASS |
| 移行 | 正常・committed journal・5書込み障害・部分新群の8確認：PASS |
| 追加境界 | 20契約：PASS（source削除、metadata／owner、一般追加カード、名前付き保存／履歴復元、reset／Undo、実別タブ競合、journal削除失敗、途中終了、確定群破損） |
| 新人物と手入力人物 | 通常21・漫画21・コマ42：全文一致 |
| 従来追加回帰 | Native通常252・漫画252・既存人物向け21構成：全文一致 |
| スマホ | 下記6 viewport：PASS |
| 簡易漫画 | 代表snapshot・全文一致：PASS |
| 実Service Worker | 更新・旧タブ・オフラインの9確認：PASS |
| JavaScript | 構文、ブラウザの重大例外なし：PASS |

R1原本は未変更（SHA-256 `e7af4b06f2e0de1469ad11d12d578ecab29c3847749c8bdcb6560fa35ebffce0`）。実行用ラッパーが唯一の`actorExtensions.version===3`を承認済みv4へ置換して実行する。原本のv3固定assertionを無変更でPASSしたとは記載しない。期待全文は再生成していない。

固定生成全文：`7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。

原本baselineは圧縮コピーとして`tests/fixtures/creature-motif-person-r1-original-baseline.json.gz`へ保存した。展開後bytesは保持していた元成果物と一致し、SHA-256 `e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832`。期待値の更新ではない。

件数：Character 1,390／人物preset 1,384／Creature species 94／Creature preset 60／features 275／Creature候補500／標準adapter 1,444。不変。ID・value・日本語表示・分類・順序・性別・衣装構成・所有者を含む12 datasetのhashは`tests/results/creature-motif-person-integration1-fixed-baseline.json`に保存した。

## 8. スマホ・PWA

| viewport | 結果 | 人物カード | 作成入口 | dialog主要ボタン |
|---|---|---|---:|---:|
| 360×640 | PASS | 2列 | 44px | 44px |
| 360×800 | PASS | 2列 | 44px | 44px |
| 393×640 | PASS | 2列 | 44px | 44px |
| 393×800 | PASS | 2列 | 44px | 44px |
| 430×640 | PASS | 2列 | 44px | 44px |
| 430×800 | PASS | 2列 | 44px | 44px |

ヘッダー／フッター固定、中央だけスクロール、横はみ出しなし、ボタン重なりなし。検索・名前入力への自動focusなし（開くと閉じるボタンにfocus）。保存後の人物ページ移動、キャンセルとfocus復帰、タッチ操作のUndoを確認。既存Creature編集の4タブ8ページ・条件付きタブ契約はR1で維持を確認した。

SW変更はcache名のみ：`seaart-tool-pwa-v4-motif-person-v1-http-cache-v1`。既存のHTML `cache:'reload'`・network-first／オフライン方針を維持。

旧HTMLにHTTP `max-age=600`が残る隔離contextで、旧SWから更新を実施。HTML取得503のinstall失敗では旧SW／cache／未保存ドラフトを保持し、再試行成功後の新cache HTMLは本報告の`index.html` SHA-256と一致した。旧画面を強制reloadせず、更新通知の表示を観測した。

新版ページで旧群のread-only移行、名前付き保存・履歴・一般生成、オンライン保存、オフラインreload／保存／再reload、再オンライン復帰を確認。元Creatureと新人物の外見は独立保持。再読込後のCreature／result session許可Mapは空。旧タブの保存を新版へ自動mergeしない。

## 9. 開発中の失敗と未実施範囲

修正済み：close後の参考元ドラフトが非同期イベント待ちになっていたため、同期破棄へ変更。一般追加カードの起動時検証へ対応settingsを渡すよう修正。

テスト修正：非表示旧gridを測っていたselectorを表示gridへ修正。欠落localStorage値の`undefined`／`null`比較を修正。SWのcache生成をHTML格納完了と誤認した待機条件を、HTML存在確認へ修正。最終記録は全てPASS。

未実施：実機スマートフォン、公開GitHub Pages／公開originでのPWA、端末OS完全オフライン再起動、SeaArt実画像生成、全モデルの実画像再現。旧全12スクリプトや5-A～5-Cの全人工資格fixtureを今回一律再実行したという主張はしない。今回のR1原本・追加回帰・新機能・実SWの範囲を実施した。

利用者の本番localStorageにはアクセスしていない。実データの端末バックアップを取得済みとは扱わない。

## 10. 再実行と次工程

新規テスト7本、JSON結果7件、スクリーンショット6件をGitへ保存。今回の全生成結果・export/import試料・ログはworkspaceの`/workspace/seaart-creature-motif-integration1/`にも保存した。

R1実行例（8765でworkspaceを配信し、baselineに開始mainの正確なHTMLを用意）：

```bash
RESULT_DIR=/workspace/seaart-creature-motif-integration1/final-r1 \
BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html \
TARGET_URL=http://127.0.0.1:8765/seaart-creature-motif-person/index.html \
node tests/creature-motif-person-r1.cjs
node tests/creature-motif-person-fixed-baseline.cjs
```

原本baseline・既存テストを変更して差分を隠さない。旧HTMLは検証fixtureとして使い、製品の修正元には使用していない。

第1回の必須一般生成機能は完了。成人向け機能は未許可のまま。第2回で追加取込みや既存人物上書きを検討する場合は、対応候補・保存競合・操作契約を別途決める必要がある。

mainは基点の祖先であり技術上fast-forward可能。**mainへの反映・公開は今回実施しない。** 公開前には本ブランチの差分レビューと、別途承認された公開origin・実機PWA受入確認が残る。
