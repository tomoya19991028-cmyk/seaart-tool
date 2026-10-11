# 怪異＋モチーフ第2回：修正履歴

統合時に再現した2件を修正。未解決の再現製品不具合0。対象は統合専用ブランチのみ、製品commit `f1de74cb99d2d4e89c5be36aaa65e2a2cea40405`。既存の怪異B01〜B04を維持し、仕様・成人条件・候補データ・expectedを変更していない。

## C01：JSON読込中のモチーフ作成を拒否できない

再現：最新怪異HTMLに第2回scriptをそのまま同居させる。モチーフ人物を作り、保存済み参考外見を変更する。JSON読込pendingを模擬し、`mfCreatePerson`を呼ぶ。作成が成功しUUIDが増え、保存・working・Undoが変更される（Z01修正前：createRejected false、unchanged false）。

原因：第2回の取込みvalidatorは保存ready／プレビューrevisionを確認するが、怪異側の`hImportPending`／`hActionBusy`／stagingに参加しない。既存UIのinertやclick guardだけでは直接呼出し経路を保護できない。

修正：作成・再取込みの共通validatorで読込・transaction・staging中を拒否する。双方を`hTransaction`へ参加させ、生成前のworking検証、UI・結果dirtyの更新、v5一式保存、成功後だけ1件Undo登録を行う。UI選択は失敗時に戻す。旧v4 writerや別のnamespaceで保存する実装を追加しない。

再検証：Z01、実File.text待ちZ11、作成rollback Z04、再取込みの各保存キー／描画／stale Z03、別タブZ13、Undo失敗Z14、rollback不能Z17がPASS。I34〜I36の実入力・JSON失敗保護もPASS。

## C02：再取込み後も元外見依存の下書きを確認済みと扱う

再現：モチーフ人物へ怪異を設定し、コマ下書きを確認して部分確定planを作る。元Creatureの保存済み髪色・衣装・上半身を変え、同人物へ再取込みする。元のplanがそのまま確定できる（修正前Z02：status confirmed、rejected false、working変更）。

原因：怪異の依存digestは怪異定義・状態・コマ・元特徴policy等を参照するが、モチーフ人物の一般外見全体を含まない。第2回の再取込みは同じUUIDのprofileを変えるので、owner一致だけでは変更を検出しない。

修正：モチーフ人物に限り髪・目・衣装・detail・自由入力・衣装展開情報・色・重みを依存値に含める。通常人物・Creatureの既存依存計算は維持する。確認時と現在の一般外見を確認画面へ表示し、digestが変われば再確認へ送る。古いcommit planを拒否する。再確認後の確定は既存の依存グループ・原子的保存を使う。確定済みreceiptは再取込みで自動変更しない。

再検証：Z02、部分確定後の未確定項目Z07、通常／下書きUndo交差Z05、原特徴exclude Z16、確認前後の生成・元データ分離がPASS。古いv5に保存された確認情報に新しい外見依存がない場合も再確認となり、自動確定しない。

## 維持した既存修正

| 既存修正 | 統合後の確認 |
| --- | --- |
| B01：receipt Undoの二重pop | I01・Z06、10件→9件・他履歴不変 |
| B02：working Undo保存失敗 | I10／I19／I31／I32・Z14、RAM／disk／Undo／画像・配置保持 |
| B03：画像decodeのコマID追跡 | I11／I12・Z08、移動／削除／再取込みと実PNGの対応 |
| B04：JSON読込中の入力 | I34〜I36・Z11、実キー入力拒否・読込後解除 |

## 統合に伴う変更と試験側修正

- sourceを別ファイルへ分離し、再生成順を確定。HTML末尾の競合を両機能保持で解消した。
- SWは一意な統合cache名だけ変更。保存schema／namespace／retention／候補タグ／成人許可は維持。
- 新規source末尾の空行を整形し、embed側の改行を明示した。生成HTMLは全bytes同じで、再実装・再生成された別製品とは扱わない。
- 新規試験の初回fixtureミスを修正：semiを指定する前のmode準備、選択解除後に残した衣装重み、const配列の再代入、`long fingers`の英語名、`白いブラウス`の日本語名、確認失効を試すPWA下書きの未確認状態。製品や既存expectedを変更して通したものではない。

最終19runner、329ケース、全指定回帰を同じ最終HTML SHA `3525ec8b2e856928031198b80505310393c6d796533e9b9e8a07b9516d04d24e`で実行しPASS。初回red・fixture FAIL・中間記録は[証跡](validation/horror-motif-integration/README.md)に残した。認証情報・巨大な重複HTML／merge-tree出力はGitへ含めない。

残存リスクは実機／IME／OS picker・実画像品質・公開origin更新の未検証、第2回原本テストの未回収。詳細は[総合検証結果](REPORT_怪異モチーフ第2回_総合検証結果.md)。mainと公開PWAは未変更。
