# 怪異タブ：追加修正履歴

2026-10-11。検証対象は `feat/horror-tab-manga-draft-integration`。作業開始remote HEADは `be4f7f902d533d85614b3b560946e54c735e213a`。main反映・公開操作は実施していない。

## 修正した4種類の不具合

### B01：部分確定Undoが10件上限で別の履歴を失う

- 再現：通常Undo履歴9件→下書き部分確定→履歴10件→上部Undo。
- 修正前：Undo自身のtransactionが11件目を追加して最古の履歴を除去し、その後2件popするため8件になる。本来残すべき他の9件のうち1件を失う。
- 先に追加した再現試験：I01。修正前 `8 !== 9`。
- 修正：UIからreceiptを戻すときは`recordUndo:false`を指定し、保存成功後に元の履歴1件だけを除去する。内部APIの既存既定値は維持する。
- 確認：9件すべての内容一致、receipt解除、繰返し確定・Undo、10件上限との組合せ。

### B02：working snapshot Undoの保存失敗でRAM・履歴・画像が先に戻る

- 再現：コマ削除／怪異基本設定／通常の画風変更を保存→working書込だけを失敗させる→上部Undo。
- 修正前：旧Undoハンドラは履歴を先にpopして`restoreWorking`を実行し、保存失敗を確定条件にしない。diskは旧状態、RAMはUndo後、履歴は消失となる。コマの場合は画像対応も変わる。部分確定後の通常編集、怪異設定がない状態でも再現した。
- 先に追加した再現試験：I10、I19、I31、I32。
- 修正：working snapshot Undoを既存の`hTransaction`内で復元・検証・保存し、保存成功後だけ履歴と対応する画像Undo資料を除去する。画像と配置はコマIDで対応させる。保存失敗ではRAM・disk・履歴・画素・配置を戻し、成功通知を出す位置も保存後へ移す。
- 専用のmaintenance／candidateFavorites Undoは従来ハンドラへ委譲する。通常のworking snapshotと下書きworkspaceの分離を維持する。
- 確認：I08〜I10、I19、I25〜I28、I31〜I33。部分確定後の別項目／同項目編集、連続Undo、保存障害時の履歴保持、怪異なしの通常操作を含む。

### B03：画像decode中のコマ移動・削除で別コマへ画像が入る

- 再現：実PNGを選び、native Imageのdecode完了通知だけを保留→対象コマを移動または削除→通知を再開。
- 修正前：非同期処理が開始時の配列indexを使用する。移動後の別コマを上書きし、削除済みコマへの読込も新しい同indexのコマへ入る。
- 先に追加した再現試験：I11、I12。修正前は移動先index2に対して画像index0、削除後も画像の割当てあり。
- 修正：読込開始時のmangaId／panelIdを捕捉し、decode後に現在のID位置を解決する。漫画またはコマが消失していたらURLを解放して読込中止を表示する。成功時には現在のコマ表示を更新する。ID未使用の従来経路は同じslot方式を使用する。
- 確認：実PNGの画素、他コマの画像・配置・人物・怪異設定、移動／削除／Undo、読込中のID変更を照合。

### B04：JSON読込待ち中、フォーカス済み通常入力欄を編集できる

- 再現：追加英語タグの実入力欄をフォーカス→実ファイルの`File.text()`完了を保留→キーボードで文字を挿入→保存タイマーの実行を待つ。
- 修正前：怪異APIとclickのguardはあるが、フォーカス済みの通常入力欄には効かない。`BEFORE_IMPORTDURING_IMPORT`へ変更され、working snapshotも変わる。
- 先に追加した再現試験：I34。I30のAPI拒否だけではこの経路を検出できなかった。
- 修正：読込中はbodyと既存dialogを`inert`にして実入力を止める。成功・不正JSON・キャンセル・保存失敗のすべてで`finally`から各要素の元のinert状態へ戻す。内容・許可条件・保存形式は変更しない。
- 確認：I22、I30、I34〜I36。実キー入力、実ファイル読込、元からinertだったdialogの状態保持、RAM／disk／両Undoの保持、読込後の操作復帰。

## 製品変更

| ファイル | 内容 |
| --- | --- |
| `src/horror-runtime.js` | receipt Undo、working snapshot Undo、読込中UIロック |
| `scripts/integrate-horror.py` | IDに対応させる非同期画像読込の検証付き統合anchor |
| `index.html` | 上記ソースと統合変更を単一HTMLへ反映 |

新規試験は`tests/horror/independent-edges.cjs`（36ケース）、`independent-prompts.cjs`（8構成）、`independent-ui.cjs`（6画面）と新しい実行手順書。既存テスト原本・固定expectedは変更していない。

最終候補HTML：3,888,088 bytes、SHA-256 `9fe8950c1d4ecdd936edf635975aebdad4b01633fb6e498da37644cb1827d33d`。生成ソースから隔離ファイルへ再生成し、製品と全bytes一致を確認した。修正製品commitは `e4660a638988c8a7a2e55eed5fb1b1acb3f33bcd`。GitHubから製品を再取得し、同じ全bytesを確認した。最終再検証結果は独立検証結果報告に記載する。

保存v5／horror-v1の5キー、候補データ、成人許可条件、SW・manifestの変更はない。画像をJSONへ永続保存する機能、reload後の永続Undoは追加していない。

## 記録と残存事項

最初の接続失敗、テスト側の指定ミス、修正前の実FAIL、途中版の成功・中断記録をリポジトリ外の `/workspace/seaart-horror-independent-20261011/` に保持した。必要な機械可読結果を`validation/horror-independent/`へ保存する。失敗資料をPASSの再生成で上書きしていない。

新規試験だけの修正：非表示配置selectへの操作指定、reload後に失われる試験用helper、2タブの初期保存順、dialogへのselector限定、通常プロンプトの文字／数字label認識。最初のプロンプトfixtureは維持したpale skinとgray skinが承認済み排他グループに該当したため、試験の非競合元特徴をtan skinへ変更した。製品候補・タグ・排他規則・既存expectedの補正ではない。最終プロンプト試験には実装から独立した対象別期待タグも加えた。

Android実機、日本語IME、ネイティブの画像選択画面、公開originの更新、SeaArtの実画像品質は未検証。主な残存仕様は、画像・配置とUndoのsession限定、通常画像の分離「なし」が共有タグ列であること、モチーフ第2回との交差検証不足。最終判定と公開前手順は独立検証結果報告・実機チェックリストを参照する。
