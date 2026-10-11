# 怪異タブ＋モチーフ人物第2回：統合実装結果

総合判定：**条件付き合格**。両機能を統合し、指定回帰・代替第2回試験・統合専用試験を実行してGitHubの統合専用ブランチへ保存した。main・Pages・公開PWAは変更していない。

## 統合元とGitHub保存

| 対象 | 取得したremote HEAD |
| --- | --- |
| main／merge-base | `5b5bb03589dcc9a661402395d6c3db20cfd4cf52` |
| 怪異ブランチ | `f58be6a37c2b407b86afbaa226a79a0a10a9c562` |
| 怪異の修正製品 | `e4660a638988c8a7a2e55eed5fb1b1acb3f33bcd` |
| モチーフ人物第2回 | `7b3f9afd6cf1db20b74359fcf3f14fa4d8101841` |
| 統合製品merge commit | `f1de74cb99d2d4e89c5be36aaa65e2a2cea40405` |

保存先：[feat/horror-motif-person-integration](https://github.com/tomoya19991028-cmyk/seaart-tool/tree/feat/horror-motif-person-integration)。統合製品commitのparentsは上記の両remote HEAD。後続の報告・証跡commitは製品を変更しない。最終remote HEADは最終回答に記載する。

開始時の両worktreeはclean。HTML・SW・manifest・主要source・scriptとHEAD／状態を `/workspace/seaart-integrated-audit-20261011T232933Z/prework/` へ保護し、新しいworktree `/workspace/seaart-integrated` を作成した。元ブランチ・mainにcheckout／reset／clean／commit／pushをしていない。

## 統合方法と読込順

read-only `git merge-tree`で末尾競合1箇所を再確認してから、統合worktreeでno-commit mergeを実施した。競合解消は、最新怪異HTMLの基盤とB01〜B04を保持し、第2回のモチーフ人物scriptを対応するscriptへ組み込む方法で行った。

第2回コードを `src/creature-motif-person.js` に分離した。v5 foundationは保存readerより前、モチーフ人物のvalidator／UI／generator guardは怪異runtimeより前に読み込む。怪異がそのgeneratorをoverlayする順番を維持し、二重の保存namespaceや二重のUndo登録を作らない。

再生成順は共通基点→`embed-motif-person.py`→`integrate-horror.py`→`embed-horror.py`。新しい`build-integrated.py`は隔離された未使用の出力先だけを受け付ける。再生成で第2回機能が失われず、最終HTMLと全bytes一致した。source末尾の空行だけを整え、埋込側で既存HTMLの改行を維持した。試験済みHTMLはその整形前後で同一。

| 製品 | bytes | SHA-256 |
| --- | ---: | --- |
| index.html | 3,901,393 | `3525ec8b2e856928031198b80505310393c6d796533e9b9e8a07b9516d04d24e` |
| sw.js | 2,332 | `f44b827d9f406a483033cbd7d119dbbe85f6a9e200569f89e0d1a2edc738213c` |
| manifest.json | 762 | `d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f` |

GitHubから製品・source・script計11ファイルを再取得し、検証済みローカルの全bytesと照合した。[同一性](validation/horror-motif-integration/source-identity.json)・[remote照合](validation/horror-motif-integration/remote-product.json)を参照。

## 保存・人物・Undo

怪異側の保存v5・horror-v1の既存5キーを維持した。第2回の作成・再取込みは`hTransaction`でworking／settings／history／marker／journalと整合して確定する。保存・描画・別タブ競合・読込中操作で失敗した場合は成功表示を出さず、変更前へ戻す。rollback不能ではjournalとデータを保持する。

UUID、record／profile／extensionのmotif metadata、`adultAccess:'denied'`を維持。元Creatureは不変。承認済み第2回の仕様どおり、取込み元はプレビュー内の参照であり、人物へ元Creature IDを永続リンクとして追加しない。自動同期・通常人物への上書き取込みは追加しない。

再取込み後、モチーフ人物の髪・目・衣装・部位・装飾・色・重みを参照する怪異下書きの依存digestを照合する。確認済みの元外見が変わると再確認となり、古い部分確定プレビューを拒否する。確認画面に確認時と現在の外見を示す。確定済み設定・receiptは再取込みで自動変更しない。

通常Undoと下書きUndoを分離し、10件上限とB01／B02の1回だけpop・保存成功後の履歴更新を維持。再取込みUndoでUUID・metadataを変えず、workspaceを巻き戻さない。コマID・画像decodeのB03、JSON読込中入力保護のB04も維持した。画像・配置と両Undoはsession限定のまま。

## 生成・候補・スマホ・PWA

198候補は65／34／25／17／9／20／28。日本語名、英語value、既存ID、datasetを変更しない。個別ON/OFF・色ON/OFF・予定／変更前後・再取込みを維持した。

怪異OFFのR1・Native・簡易漫画は全文一致。第2回の承認済み一般外見は、第2回保存製品および同じ外見の通常人物と21／21／42構成で全文一致。怪異ONの対象別分離・normalコマ抑制・keep／replace／exclude・重み・生成中止時の既存結果保護も検証した。分離「なし」とSeaArt実画像品質の範囲は総合検証報告で明記する。

6viewportで両機能UIを確認。SWはcache名だけを`seaart-tool-pwa-v5-horror-motif-r2-integration-http-cache-v1`へ変更し、network-first・失敗時の旧cache保護・通知・旧タブ非強制reloadを維持。隔離originで旧怪異SW→統合SWの更新と両機能のoffline保存・reloadを実検証した。

## 変更ファイル

製品・生成基盤6ファイル：`index.html`、`sw.js`、`src/horror-runtime.js`、`src/creature-motif-person.js`、`scripts/embed-motif-person.py`、`scripts/build-integrated.py`。

新規検証・手順8ファイル：`tests/integration/`内の6 cjs、承認候補対応JSON、README。既存のmainテスト／fixture50ファイルと怪異テスト原本は不変。

製品mergeは71ファイルの差分。うち57ファイルは第2回ブランチで既に保存された報告・回収検証資料の取込みであり、新しい試験のPASS記録と区別する。今回の最終報告5点と証跡は後続commitへ保存する。総変更数と全一覧は最終回答および`validation/horror-motif-integration/changed-files.json`で示す。

詳細：[総合検証](REPORT_怪異モチーフ第2回_総合検証結果.md)、[修正履歴](REPORT_怪異モチーフ第2回_修正履歴.md)、[保存安全性](REPORT_怪異モチーフ第2回_保存移行安全性.md)、[Android確認](CHECKLIST_怪異モチーフ第2回_Android実機確認.md)、[再実行手順](tests/integration/README.md)。
