# v44 実行結果

> これは2026-10-25の初回監査記録です。2026-10-26の製品修正・残試験の最終結果は [残試験追補](REMAINING_v44_残試験とAndroid確認版.md) を参照してください。以下の旧結果・SHAは履歴として保持しています。

最終製品HTMLのSHA-256は `41983f10df019a1e2c129ec7bbf7bdf630d535de8243be7baea9dce201354305`。
SWは `8fe1d284721b17791b82ad53af81abe9380bcc03b45c5837348d31bbbbe3c807`。
manifestと3アイコンはmainのままです。全資産のbytes・SHA、Node/Chromium/Pythonの版は [product-hashes.json](../../validation/v44-audit/product-hashes.json) を参照してください。

## 現行の主スイート

```sh
npm ci
npm run test:audit
```

実行記録：[local-execution.json](../../validation/v44-audit/local-execution.json)。全件一覧：[local-results.json](../../validation/v44-audit/local-results.json)。
今回の最終バイトで **555 PASS / 0 FAIL / 1 SKIP（556件）**。

| スイート | PASS | FAIL | SKIP | 確認内容 |
| --- | ---: | ---: | ---: | --- |
| quality | 6 | 0 | 0 | HTML parser診断0、37script・保守JS・SWの構文、10 JSON、別出力へのビルドbyte一致 |
| features | 4 | 0 | 0 | mainの3,218行と1,399基本外見・19形態、namespace、ID、28関係・18構図・8カード定義、全primary tab、簡易漫画の独立 |
| matrix | 505 | 0 | 0 | 通常168、漫画ページ168、コマ出力168構成＋関係1グループ |
| regressions | 7 | 0 | 0 | 走り方、独立動作・装備、旧pose移行の色・重み1回、視線、生成／履歴障害、fingerprint・生成例外、肌 |
| access | 3 | 0 | 0 | 既存の非性的resource試験3本をassert変更なしで実行。session、実quota、schema・復旧 |
| compatibility | 10 | 0 | 0 | 保存・再読込・名前付き・履歴・JSON・不正入力・未知値・ID再割当・重複拒否・文字としての表示 |
| ui | 14 | 0 | 0 | 他owner選択・共有DOM・queued close競合、髪・目・光・effects・pose・肌・Undo、縦横・desktop・文字拡大・短い画面で実クリック |
| pwa | 6 | 0 | 1 | 旧版から失敗／成功更新、データと別cacheの保持、6資産、オフライン編集保存、cache参照境界、file直開き |

モデルは7、分離モードは3、被写体構成は8。コマ出力168構成には各2コマ、実際には336文字列を含みます。
関係は28×3モード×4方向・種類の組合せ＝336展開を1テストグループとして検証し、PASS件数に336を上乗せしていません。
accessの内部check数・障害数も詳細JSONで別記し、グループ件数に二重加算していません。
文字拡大mockは16px基準の24px/32px指定で、OSの文字サイズ変更そのものではありません。補助測定では7画面条件それぞれ6枚の「未設定」の文字範囲がカード内に収まることも確認しました（`unset-text-check.json`）。
fixtureは固定構成です。UUIDの生成を除きランダムなケース選択はしていません。

file://は管理Chromiumの `ERR_BLOCKED_BY_ADMINISTRATOR` でSKIPです。禁止を迂回していません。
HTTPブラウザでのオフラインはPASS、Android実機・実IME・実SeaArt/PixAI画像生成は未実施で、PASSに含めません。

## CIと補助確認

[CI再実行](https://github.com/tomoya19991028-cmyk/seaart-tool/actions/runs/40216377346) はB05/B06追加前の製品で **555 PASS / 0 FAIL / 0 SKIP**。最終修正版のCIは [PR最新check](https://github.com/tomoya19991028-cmyk/seaart-tool/pull/1/checks) を参照してください。
この旧CIのUIは13件、最終修正版ではqueued close競合を加えて14件です。またCIのLinux Chromiumではfile://直開きも起動・生成・保存を確認でき、ローカルでは1 SKIPです。Androidの確認ではありません。
初回CIはUIの1件でFAILでした。隠しディレクトリのartifactが保存されておらず個別原因は未回収です。
ログ出力とartifact保存を修正し、製品コード・期待値を変えず再実行して成功しましたが、初回の原因を解消済みとはしません。
CIの集計と経緯は [ci-runs.json](../../validation/v44-audit/ci-runs.json)。artifact ZIPは取得先でHTTP 403となったため、この環境ではCIログから確認しています。

補助試験 `node tests/forms-environment/v44-adult-cards.cjs` は1グループPASS。
年齢確認だけでは不可、既存同意チェック後に8カード・2ページすべてを開閉できることを検証しました。画像生成・Creatureの許可付与は行っていません。
また再読込試験にdraft workspace全体の比較も加え、関連2ケースの単独PASS後、最終主スイートでも実行しました。これらの再実行を主集計に二重加算していません。
補助結果は `adult-ui-results.json` と `draft-workspace-recheck.json` です。

## 既存試験と期待値の変更

修正前の添付v44では、東京喰種スイート32件は29 PASS / 3 FAIL、normal-firstは20 PASS / 0 FAILでした。
この試行と再実行を [other-attempts.json](../../validation/v44-audit/other-attempts.json) に残しています。

- TG02：旧pose配列をそのまま比較する期待から、v44の正規移行後のposeActionsも含む保護対象比較へ変更。表情・傷・手動設定の保持assertを維持。
- TG17・CUI01・CUI04：own-onlyをやめ、v44の他owner候補が表示される期待へ変更。OFFと選択済み保持を維持。
- MODEL01：v44では括弧エスケープ・通常の主語表現が変わるため、旧Version 6との全文一致を要求しない。添付原本SHA `0c8b...de5e` を2つの隔離ページで実行して採録した独立goldenと比較。修正版から期待文を作っていません。

更新後、東京喰種・遊戯王・既存形態・旧JSONの32件は32 PASS。主スイートには合算しません。
この実行中はB03のCSS調整前後が含まれます。その後のB05・B06も含め、最終バイトで主スイートを再実行しています。
候補UIの初回は6件中5 PASS・起動待ちtimeout 1件。CUI03の単独再試験はPASS。さらにB05/B06後の最終HTMLで6件すべて再実行して6 PASSです。失敗の記録も保持しています。

```sh
TARGET_URL=http://127.0.0.1:8765/seaart-v44-audit/index.html RESULT_DIR=NEW_DIR node tests/tg-yugioh-phase1/contracts.cjs
TARGET_URL=http://127.0.0.1:8765/seaart-v44-audit/index.html RESULT_DIR=NEW_DIR node tests/forms-environment/candidate-ui.cjs
TEST_IDS=CUI03 TARGET_URL=http://127.0.0.1:8765/seaart-v44-audit/index.html RESULT_DIR=NEW_DIR node tests/forms-environment/candidate-ui.cjs
```

旧JSON採録元の準備は既存の `tests/tg-yugioh-phase1/prepare-baselines.py /workspace` を使用しました。
旧HTMLは固定commitから作った隔離fixtureで、公開版・実保存領域を使っていません。

## 41ジョブの継承試験

```sh
TARGET_URL=http://127.0.0.1:8765/seaart-v44-audit/index.html TEST_WORKERS=2 python tests/tg-yugioh-phase1/run-inherited.py NEW_DIR
```

原本は書き換えず、既存のreplay adapter経由で実行しています。
記録は [inherited-attempts.json](../../validation/v44-audit/inherited-attempts.json)。この試行はB03調整前後を含むため、最終SHAの主スイートのPASS件数には加算しません。
旧版の関数本文、生成全文、cache名や再読込時の既定値を固定した比較等でFAILになっています。これをPASSへ書き換えていません。
`round2-retest` は既存の代替試験であり、未回収の元試験を実行したとは扱いません。
全41ジョブは **27 PASS / 13 FAIL / 1 SKIP**。これはジョブ単位です。元のFAILは残しています。

| FAILの対象 | 確認した不一致理由 |
| --- | --- |
| r1 / legacy / unified-compatibility | 旧候補表・関数本文・旧出力全文との固定比較。既存行の欠落は別の保持試験で検査 |
| auto-compatibility / prompts / motif-prompts | v44で通常出力から除いたCharacter/Creatureラベル等を旧比較が要求。split結果1を4と比較するFAILを確認 |
| auto-contracts | A07/A08の起動待ちtimeoutは再実行でPASS。A27は旧通常ラベルを要求 |
| auto-ui | 初回360×640起動timeout。同じ原テストの360×640 / 360×800を再実行してPASS |
| unified-pwa | 再読込で未選択のsound/reaction配列・文字列の既定値が補完される。差分は空値の追加のみ |
| card-pwa / normal-pwa / pwa-regression | 旧cache名の完全一致を要求。現行scope付きcacheの更新・失敗・offlineは主スイートで別に検査 |
| round2-retest（代替） | 新stateを旧参照製品へ読み込ませ、未対応の成人設定fieldで拒否される方向の比較 |

SKIPはr1のsource固定preflight失敗に依存して、fixed baseline比較を実行しなかった1ジョブです。
怪異contract・障害・36境界、story、独立モチーフ・保存境界・統合、通常画像、各UI等の成功ジョブも個別一覧に記録しています。
再試験4ケースは `auto-contracts-retry.json` / `auto-ui-retry.json` にあり、元ジョブのFAIL集計は書き換えていません。
実行コマンド、原本・adapterのSHA、製品変更前後のSHAを保持しています。

## 新データを旧mainへ戻す方向

旧JSON v3/v4/v5を新v44へ読む検査と、新v44のデータを旧版へ戻すことは別です。
隔離した旧main（HTML SHA `a875...cb98`）では通常Creatureのstateは受理されましたが、構造化ポーズ付き人型Creatureのstateは「擬人化外見の形式が不正です」で拒否され、拒否前のRAMは保持されました。
`reverse-main-check.json` / `reverse-main-new-pose-check.json` が観測結果です。コードを旧版へ戻しても、新形式データをそのまま読めると保証しません。
公開する場合は更新前JSONを別に保護し、コード復旧とデータ復旧を分ける必要があります。このPRでは公開も実端末データの変更も行っていません。

## 残る確認

コードの存在確認、ブラウザでの経路確認、実画像での成功は別です。
legacyの全文／source固定期待の整理、未網羅の編集経路、実IME・端末容量・Android PWA、モデル・サービスごとのプロンプト解釈を残します。
PRはこれらの残項目を明示したdraftとして提出し、全試験合格・公開可とは報告しません。
