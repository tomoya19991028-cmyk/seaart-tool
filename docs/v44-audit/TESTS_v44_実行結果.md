# v44 実行結果

最終製品HTMLのSHA-256は `29fb0ca2962785674a2063da70a94b6bf17e74e6f7ee9e4d2ccb7191d9f514e5`。
SWは `8fe1d284721b17791b82ad53af81abe9380bcc03b45c5837348d31bbbbe3c807`。
manifestと3アイコンはmainのままです。全資産のbytes・SHA、Node/Chromium/Pythonの版は [product-hashes.json](../../validation/v44-audit/product-hashes.json) を参照してください。

## 現行の主スイート

```sh
npm ci
npm run test:audit
```

実行記録：[local-execution.json](../../validation/v44-audit/local-execution.json)。全件一覧：[local-results.json](../../validation/v44-audit/local-results.json)。
今回の最終バイトで **554 PASS / 0 FAIL / 1 SKIP（555件）**。

| スイート | PASS | FAIL | SKIP | 確認内容 |
| --- | ---: | ---: | ---: | --- |
| quality | 6 | 0 | 0 | HTML parser診断0、37script・保守JS・SWの構文、10 JSON、別出力へのビルドbyte一致 |
| features | 4 | 0 | 0 | mainの3,218行と1,399基本外見・19形態、namespace、ID、28関係・18構図・8カード定義、全primary tab、簡易漫画の独立 |
| matrix | 505 | 0 | 0 | 通常168、漫画ページ168、コマ出力168構成＋関係1グループ |
| regressions | 7 | 0 | 0 | 走り方、独立動作・装備、旧pose移行、視線、生成／履歴障害、fingerprint・生成例外、肌 |
| access | 3 | 0 | 0 | 既存の非性的resource試験3本をassert変更なしで実行。session、実quota、schema・復旧 |
| compatibility | 10 | 0 | 0 | 保存・再読込・名前付き・履歴・JSON・不正入力・未知値・ID再割当・重複拒否・文字としての表示 |
| ui | 13 | 0 | 0 | 他owner選択・共有DOM、髪・目・光・effects・pose・肌・Undo、縦横・desktop・文字拡大・短い画面で実クリック |
| pwa | 6 | 0 | 1 | 旧版から失敗／成功更新、データと別cacheの保持、6資産、オフライン編集保存、cache参照境界、file直開き |

モデルは7、分離モードは3、被写体構成は8。コマ出力168構成には各2コマ、実際には336文字列を含みます。
関係は28×3モード×4方向・種類の組合せ＝336展開を1テストグループとして検証し、PASS件数に336を上乗せしていません。
accessの内部check数・障害数も詳細JSONで別記し、グループ件数に二重加算していません。
fixtureは固定構成です。UUIDの生成を除きランダムなケース選択はしていません。

file://は管理Chromiumの `ERR_BLOCKED_BY_ADMINISTRATOR` でSKIPです。禁止を迂回していません。
HTTPブラウザでのオフラインはPASS、Android実機・実IME・実SeaArt/PixAI画像生成は未実施で、PASSに含めません。

## 既存試験と期待値の変更

修正前の添付v44では、東京喰種スイート32件は29 PASS / 3 FAIL、normal-firstは20 PASS / 0 FAILでした。
この試行と再実行を [other-attempts.json](../../validation/v44-audit/other-attempts.json) に残しています。

- TG02：旧pose配列をそのまま比較する期待から、v44の正規移行後のposeActionsも含む保護対象比較へ変更。表情・傷・手動設定の保持assertを維持。
- TG17・CUI01・CUI04：own-onlyをやめ、v44の他owner候補が表示される期待へ変更。OFFと選択済み保持を維持。
- MODEL01：v44では括弧エスケープ・通常の主語表現が変わるため、旧Version 6との全文一致を要求しない。添付原本SHA `0c8b...de5e` を2つの隔離ページで実行して採録した独立goldenと比較。修正版から期待文を作っていません。

更新後、東京喰種・遊戯王・既存形態・旧JSONの32件は32 PASS。主スイートには合算しません。
この実行中はB03のCSS調整前後が含まれます。人物・形態・生成JSは同一で、最終バイトの主スイートとUIを別に再実行しています。
候補UIは6件中5 PASS・起動待ちtimeout 1件。timeoutしたCUI03を同じ最終HTMLで単独再実行しPASSです。失敗の記録も保持しています。

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
旧版の関数本文、生成全文、cache名を固定した比較はv44と一致せずFAILになっています。これをPASSへ書き換えていません。
`round2-retest` は既存の代替試験であり、未回収の元試験を実行したとは扱いません。
進行中・未実施・失敗の状態、実行コマンド、原本・adapterのSHAを個別に保持します。

## 残る確認

コードの存在確認、ブラウザでの経路確認、実画像での成功は別です。
legacyの全文／source固定期待の整理、未網羅の編集経路、実IME・端末容量・Android PWA、モデル・サービスごとのプロンプト解釈を残します。
PRはこれらの残項目を明示したdraftとして提出し、全試験合格・公開可とは報告しません。
