# 第5段階 残工程R1：診断・回帰固定 実装検証結果

実施日：2026-10-11 UTC。判定：**R1の診断・テスト固定を完了。製品コード変更なし。**

一般擬人化、保存・資格判定・条件付き編集、汎用結果アクセスの現状契約を確認した。本番のCreature信頼定義・許可対象は0件を維持し、Creature成人設定の生成接続は未実装のまま。第5段階の成人生成目標が完成したという判定ではない。

## 1. 指示・作業範囲

添付 `INSTRUCTIONS_Codex_第5段階_残工程R1_診断回帰固定.md` を全文確認した。GitHubから最新mainをfetchし、AGENTS.mdを探索した。適用するAGENTS.mdは見つからなかった。開始時はclean。

- 開始・終了HEAD／origin/main：`3aae12266f1852534387da1ea735f96f76273c10`
- 作業ブランチ：`feat/creature-stage5-remaining-r1-audit`
- 新しいcommit：なし。commit、push、main反映、公開操作：すべて未実施。
- 終了時の再fetchでもmainは同じHEAD。
- 新規差分：本報告書と `tests/creature-stage5-remaining-r1.cjs` のみ。どちらも未commit。
- `index.html`、`sw.js`、`manifest.json`、アイコン、既存tests、runnerは変更していない。

UI案内は追加していない。本番対象0件の非表示は意図した仕様であり、診断でUI変更を要する不具合は確認されなかった。スマホに追加の高さを持たせる必要もない。

## 2. 基準ファイルとbaseline

| ファイル | Git blob | SHA-256 | bytes |
|---|---|---|---:|
| index.html | edacabf24ea9648a06fa900bd3668921d47b6a62 | fafddf9ea6040430529e74453de5df2091acb665c1d76c612c4189f21b1c8353 | 3,754,243 |
| sw.js | f002716e9f3a632e3a7107a37a59e5837f265ff6 | 91cd2a62257239b189c7f634d03019942f9968c2c47598695144b9f23092485a | 2,329 |
| manifest.json | 0b9eee56bb9dbb59a1dd36f3ce997200f3e4a451 | d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f | 762 |

HTMLはUTF-8／CRLF。開始・終了の全bytesは一致。新テストのSHA-256：`e7af4b06f2e0de1469ad11d12d578ecab29c3847749c8bdcb6560fa35ebffce0`。

- 現HEAD baseline：`/workspace/seaart-stage5-remaining-r1/current/index.html`。着手前Git objectから取得。
- historical baseline：`ee5b64accf1cccbe36b2d30284251b32e241c211`。`historical/`に既存prepareで作成し、現HEAD baselineと分離した。
- 旧main、第3段階、5-A/B/CのHTMLは旧版共存試験用。製品修正元には使っていない。
- `baseline-manifest.json`、`final-git-and-file-verification.json`に実測情報を保存。

## 3. 新R1テスト

最終版は実Chromiumで**49契約＋865 assertionsを各before/afterで実行**し合格。assertionには構成ごとの繰り返しがあるため、独立した機能数とは扱わない。

- 凍結された本番registryが空、起動時Creature／汎用セッション許可・resource登録が空。
- Native：`native-or-invalid-mode`。未登録semi/full：`no-trusted-definition`、baseEligible／allowedともfalse。
- global ON、full、保存済みconfirmed、履歴復元だけで許可を取得しない。
- 本番0対象では成人タブ・カードなし、確認不可。共有6カードadapterの定義は維持。
- 同種2体＋異種2体の個体state、semi/full外見、Native、保管markerの分離。
- getterのcopyを変更しても原本に影響しない。人物profiles／adultScene.people／humanProfileへ成人保管markerを転記しない。
- 4タブ8ページの切替でdraft保持。一般／成人draftのキャンセル、無変更保存Undo0回、一般保存Undo1回。
- 不適格な成人draftの確定は部分変更なく拒否。一般外見の未保存状態は確認不可。
- owner変更は旧entry隔離、個体削除はentry除去。削除Undoでデータだけを戻し、権限は戻さない。
- 名前付き保存、履歴復元、管理Undo、未知adult schemaの原子的拒否。
- 実ファイルのJSON v4 export/import、JSON v3 import、reloadで値の保持と許可の非復活を別assertにした。
- 実際にabout:blankへnavigationしてpagehideを発生させた。event観測と、pagehideだけで保存する未保存の一般scene値の復元を確認。単なる保存API呼出しの試験と区別した。
- 通常履歴は保護対象へ自動変換されない。生成markerからresource登録を作らない。

新fixtureの成人領域には `scene.extra` の無害な `R1_STORAGE_*` markerだけを使用。新しい成人候補・生成内容・collectorは追加していない。保存済みconfirmedの拒否には架空の未信頼確認記録を使用し、本番registryへ登録していない。

JSON：`new-final/r1-results.json`、`r1-v3-import.json`、`r1-v4-export.json`。

## 4. 生成の全文比較

7モデル×3分離方式。新matrixの10構成は人物のみ、Native、semi、full、人物1＋Creature、人物2＋Creature、異種2体、同種2体、Native＋semi、Native＋full。一般衣装・位置・重み・オッドアイを含む。

| 比較 | 通常 | 漫画 | コマ単独 | 結果 |
|---|---:|---:|---:|---|
| 新R1・着手前main対現ファイル | 210 | 210 | 420 | Positive／Negative・全文一致 |
| 新R1・保管markerあり対なし | 各baseline 210 | 各baseline 210 | 各baseline 420 | 全文一致・marker非出力 |
| 現main baselineによる既存Native matrix | 252 | 252 | 全比較 | 全文一致 |
| 現main baselineによる既存擬人化matrix | 294 | 294 | 588 | 全文一致 |
| 既存人物成人フロー | 21構成 | 同構成を比較 | — | 既存資産による全文一致 |
| 共通形態identity | 63構成 | 同構成を検査 | — | PASS |
| 簡易漫画 | 代表fixture | 独立IIFE／S snapshot | — | snapshot・Positive／Negative一致 |

髪などの一般外見は対象Creatureのグループへ入り、人物へ転記されない。Nativeへ擬人化外見は出ない。人物専用storyAdultではCreatureを除外する。BREAK、Negative、タグ順・重みを変更する製品コード差分はない。

新R1出力配列SHA-256：`7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。全文証拠は `new-final/r1-generation-fulltext.json`。既存matrixは `current-regression/` にbefore/after全文と比較JSONを保存。これらはコードの構成検査であり、SeaArt実画像の再現試験ではない。

## 5. 候補データ

| 項目 | 実数 | 判定 |
|---|---:|---|
| character | 1390 | PASS・変更なし |
| personPresets | 1384 | PASS・変更なし |
| species | 94 | PASS・変更なし |
| creaturePresets | 60 | PASS・変更なし |
| features | 275 | PASS・変更なし |
| creatureCandidates | 500 | PASS・変更なし |
| adapters | 1444 | PASS・変更なし |

`catalog`、`characterBasicPresets`、`detailOptions`、`outfitSets`、gender、Creature presets/base/owners/adapters/fields/labels/groupsの12datasetをdeep equalityとSHA-256で比較。ID、value、label、順序、分類、owner Setを含み、全項目が一致した。現main baselineと、既存historical fingerprintの双方で確認。全hashは `new-final/r1-results.json` と `historical/fingerprint-results.json` に保存。

特徴分類も人型対応129、矛盾5、自動変換外2、未分類139のまま。

## 6. 既存回帰資産

既存A～D1の12スクリプトを今回の製品ファイルで再実行。過去報告のみをPASS根拠にしていない。

| スクリプト | 判定 |
|---|---|
| common-access-stage5-d1-pwa.cjs | PASS |
| common-access-stage5-d1-quota.cjs | PASS |
| common-access-stage5-d1-state.cjs | PASS |
| common-access-stage5-d1.cjs | PASS |
| creature-adult-stage5-a-references.cjs | PASS |
| creature-adult-stage5-a.cjs | PASS |
| creature-adult-stage5-b-pwa.cjs | PASS |
| creature-adult-stage5-b-quota.cjs | PASS |
| creature-adult-stage5-b.cjs | PASS |
| creature-adult-stage5-c-pwa.cjs | PASS |
| creature-adult-stage5-c-state.cjs | PASS |
| creature-adult-stage5-c.cjs | PASS |

主要結果：A資格60、A参照47、B state46＋独立障害13＋旧HTML移行2、C UI35＋receipt障害8、C state47、D1アクセス39＋障害6、D1 state24＋bind障害7。quota/PWAは別スクリプト。重複するassertionを合計して独立テスト数にしない。

5-Eの8スクリプトも合格：storage17＋移行障害6＋中断境界6、access12、copy/reset8＋障害6、generation6＋障害8、interleavings5、fingerprints、result-ui6viewport、PWA7。さらにHTTPキャッシュ試験10グループ、current baselineの既存5種類の再生、新R1を実行した。**最終実行は27種類のテストソースが合格**。prepareとrunnerは件数に含めない。before/afterやretry実行を別のテストソースとして水増ししていない。

結果：`historical/existing-suite-results.json`、`e-*.log`、`final-replay-results.json`、`current-regression/replay-results.json`。後者には初回擬人化matrixの環境中断も保持し、成功した単独再試験はfinal側で明示している。

## 7. 保存・障害・アクセス保護

新旧namespaceの保存・移行を既存B/E資産で再実行。新5キー、JSON v4、extension v3、adult v1、humanProfile v1、catalog v1を変更しない。

- settings／working／history／marker／journal各write、journal更新／削除、容量不足、描画throwの原子性。
- RAM・確定disk・Undo・履歴の保持、保存競合・別tab marker変更・stale revisionの拒否。
- 新保存群が一部存在／破損しているときは保護読取へ移行し、旧群・旧journalへ黙ってfallbackしない。
- 旧HTMLの保存・favorite・reset・pagehide等で新5キーが変更されない。旧tabの値は新tabへ自動mergeしない。
- 確認transaction失敗時は権限なし。既存架空資格fixtureでは確認成功後の通常キャンセルとrollbackを区別して検査。
- generic grantのrevision A→B→Aで自動復活しない。canonical context不変時のlive receipt契約は既存A/C資産で維持。
- 無害な文書resourceでprovenance／grant／改ざん／欠落／owner・scope・context不一致を検査。
- exact bound Positive／Negativeのみコピー可能。任意本文すり替えを拒否。
- current/historyの表示・copy・設定復元、controlled mangaのコマ表示/copy停止、失効後の表示残留除去、reset・生成失敗・早期return・成功確定のbindingを再検査。
- production Creature定義からresource登録・生成接続を作っていない。

管理バックアップは既存の除外契約を維持。session Mapを永続化せず、import/reload/restore/Undo/rollbackから失効済み権限を復活させない。

## 8. スマホUI実測

実Chromiumのmobile／touch contextで確認。今回の製品UI変更はゼロ。

| viewport | タブ / ページ | 列 / カード | モード高 / 編集高 / 下端余白(px) | 判定 |
|---|---|---|---|---|
| 360×640 | 4 / 8 | 2 / 6以下 | 50 / 44 / 11 | PASS |
| 360×800 | 4 / 8 | 2 / 6以下 | 50 / 44 / 11 | PASS |
| 393×640 | 4 / 8 | 2 / 6以下 | 50 / 44 / 11 | PASS |
| 393×800 | 4 / 8 | 2 / 6以下 | 50 / 44 / 11 | PASS |
| 430×640 | 4 / 8 | 2 / 6以下 | 50 / 44 / 11 | PASS |
| 430×800 | 4 / 8 | 2 / 6以下 | 50 / 44 / 11 | PASS |

カード内矩形、遮蔽、44px以上の主要操作、横はみ出し、候補1タップ選択、×解除、色ダイアログ、検索の自動focus抑止、閉じた後のfocus復帰、キャンセルを検査。結果・履歴・コピーの別6viewport試験も合格。コピー高さは640px画面44px、800px画面47pxだった。

追加で既存C/D1の隔離された架空資格fixtureを再実行し、条件付き第5タブ、候補・重み・追加カード・連動カード・お気に入り等の既存契約を検査。本番0対象UIとは区別し、fixtureの確認を本番の許可として扱っていない。

`current-regression/ui-results.json` と `editor-幅-高さ.png`、`historical/result-ui-results.json` に実測・画面記録。二重scroll等は既存dialog/layout assertionの範囲で検査。OSキーボードや実機の片手操作までは保証しない。

## 9. PWA・実Service Worker

ローカル隔離originの実SWで再実行した。

- 現cache：`seaart-tool-pwa-v4-stage5e-result-access-v1-http-cache-v1`。
- HTML取得の `cache:reload` を維持。SW・cache名の変更なし。
- HTTP cacheに旧HTML／max-age600を残した新旧SW更新、install/activate、新cacheのHTML hash一致。
- root、index navigation、直接GET、HTML／manifest取得失敗・通信断・再試行。
- 更新失敗時の旧worker/cache保持、candidate cache除去、更新通知、未保存draft保持、強制reloadなし。
- 旧tab／新tab共存、旧HTML保存が現namespaceを変更しない。
- オンライン保存、オフラインnavigation/reload・生成・保存、再オンライン、semi/full・Native保持、許可Map空。

HTTP-cache10グループ、E実SW7項目と既存B/C/D1 PWAスクリプトが合格。新cache HTMLは上記 `fafddf...` と一致。`http-cache/http-cache-after-results.json` に各実測hash・request、`historical/sw-update-results.json` に更新試験結果を保存。これらを公開originの試験とは扱わない。

## 10. 初回失敗・再試験・未実施

最終assertionの未解決FAILは0。初回失敗を隠さず保存している。

1. 新fixtureの準備操作でUndoが上限10に達し、「保存で長さが1増える」のassertionが失敗。測定前にfixtureのUndoを空にし、製品の上限契約を変えず再試験で合格。`r1-fixture-undo-cap-failure.log`。
2. 重いブラウザmatrixの並列実行で新R1と擬人化candidateのrendererがクラッシュ。環境cgroupは8GiB、OOM kill2件が記録されていた。最終試験は順番に実行。新テストはmodelごとの反復保存を構成ごとにまとめ、全比較条件を維持した。両方の最終再試験で合格。`r1-initial-browser-crash*.json/log`、`current-regression/anthro-compare.log`、`memory-events-final.txt`、`final-replay-results.json`。初回クラッシュをPASSへ読み替えていない。

| 確認場所・方式 | 今回の状態 |
|---|---|
| GitHub main HEAD／file hash | 実測・一致 |
| Chromiumロジック／UI | 実施・PASS |
| localhost実SW／offline | 実施・PASS |
| JavaScript構文／VM解析 | 既存fingerprint資産＋新test構文検査でPASS。ブラウザ結果とは区別 |
| 公開Pages／公開origin PWAの再試験 | 未実施・今回公開しない |
| 実機スマートフォン／OSキーボード | 未実施 |
| アプリ・端末完全終了後のoffline起動 | 未実施。browser reloadと混同しない |
| SeaArt実画像 | 未実施・対象外 |
| 利用者端末のlocalStorage取得 | 未実施。全fixtureは隔離context |

## 11. 次工程とmain反映

今回の範囲で再現した製品不具合はない。保存・状態不具合のR2修正は本検証だけからは必要と判定しない。新たな再現があれば別工程へ証拠と最小修正案を引き継ぐ。

成人値の保管が生成へ接続されていないことは意図した範囲であり、R1のbugとしてcollectorを足さない。成人生成目標の未完成、本番対象0、利用条件未登録時の非表示を維持する。実対象の根拠資料・対応範囲の判断はR4等の別指示が必要。

公開対象となる新commitは作成していないため、今回のmain fast-forward判定は対象なし。HEADはmainと同一で、レビュー差分は未commitのテスト・本報告書だけ。main反映・commit・push・公開は別途指示を待つ。

## 12. 再実行と提出物

サーバーで `/workspace` を配信し、以下を実行する。現HEAD baselineはGitから先に取得する。historical prepareは別ディレクトリに出力する。

```bash
mkdir -p /workspace/seaart-stage5-remaining-r1/current
 git show 3aae12266f1852534387da1ea735f96f76273c10:index.html > /workspace/seaart-stage5-remaining-r1/current/index.html
# 別terminal: python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
RESULT_DIR=/workspace/seaart-stage5-remaining-r1/new-final \
BASELINE_URL=http://127.0.0.1:8765/seaart-stage5-remaining-r1/current/index.html \
TARGET_URL=http://127.0.0.1:8765/seaart-tool/index.html \
CHROMIUM_PATH=/usr/bin/chromium node tests/creature-stage5-remaining-r1.cjs
```

大きいmatrixは順番に実行する。baseline作成はレビュー対象の現HEAD固定に使い、製品ファイルを古いHTMLで上書きしない。

- レビュー用新テスト：`tests/creature-stage5-remaining-r1.cjs`
- 本報告書：`REPORT_第5段階_残工程R1_診断回帰固定_実装検証結果.md`
- 証跡ディレクトリ：`/workspace/seaart-stage5-remaining-r1/`
- review patch／ZIP：同ディレクトリの `r1-review.patch` と `/workspace/seaart-stage5-remaining-r1-validation-artifacts.zip`。
- 全検証JSON、全文比較、baseline、再生用スクリプト、スクリーンショット、初回失敗ログを含めて提出する。
