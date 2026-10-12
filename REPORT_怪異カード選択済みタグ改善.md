# 怪異カード選択済みタグ：改善実装報告

通常画像優先UIを維持し、怪異カードに実データの日本語名・現在値を表示しました。選択タグの×は対象だけを即解除し、通常Undo1回で戻せます。自動検証は合格、Android実機は未確認のため総合判定は条件付き合格です。

## 基準・GitHub保存

- リポジトリ：`tomoya19991028-cmyk/seaart-tool`
- 調査・保護した最新改善版：`6044f4a2289ff642e26b355a071688568e57f45d`。ユーザー指定の製品commit `1a8394d19c04ef9f0282fbeb90432e2ad074fed0` と製品bytesは同一です。
- 専用ブランチ：[feat/horror-card-selected-tags](https://github.com/tomoya19991028-cmyk/seaart-tool/tree/feat/horror-card-selected-tags)
- 検証済み製品commit：`b0363c04cff073df21a3bc7635f6d3db1d3d4479`。報告書・原記録を追加した最終remote HEADは最終応答にも記載します。提出HEADも同じ製品bytesです。
- HTML：3,927,714 bytes／SHA-256 `62c801d21fc33476e46e44b611e1c273c28e22e51fa71602a0c5ea4c1c26afc6`。
- 未commit変更なしを確認して別worktreeを作り、元HTML・SW・主要ソースを監査用ディレクトリへバックアップしました。既存worktreeやブランチを切り替え・初期化・削除していません。

## 18カードの表示

3ページ×6カードを維持しました。

| ページ | カード | 表示と操作 |
| --- | --- | --- |
| 1 | 対象 | 現在の名前と人物／Creature／独立怪異の種別 |
| 1 | 状態 | 通常／部分怪異／完全怪異。コマでは継承・指定も表示 |
| 1 | 種類 | 登録データの主分類・補助分類名。種類は共有設定 |
| 1 | 強度 | 低／中／高。コマ表示でも共有値であることを明記 |
| 1 | 構造 | 翼・角・尻尾の未指定／あり／なし。コマ別上書きを反映 |
| 1 | 元特徴 | 維持、各元特徴の除外、変更先の日本語名 |
| 2 | 頭・顔 | 選択中の日本語タグ＋個別× |
| 2 | 目・口 | 同上 |
| 2 | 皮膚・体表 | 同上 |
| 2 | 四肢・体型 | 同上 |
| 2 | 翼・角・尻尾 | 同上 |
| 2 | 演出・動作 | 同上 |
| 3 | コマ | 現在コマの状態、表示コマ数／全コマ数 |
| 3 | 継続範囲 | 現在対象の始点〜終点。端点不明も表示 |
| 3 | 基本変更と固定 | 現在対象のコマ別設定件数 |
| 3 | 下書き | 未確定件数。生成対象外であることを明記 |
| 3 | ゴミ箱・救出 | ゴミ箱・救出保留の件数 |
| 3 | 保存・統合 | v5・JSON書出／読込・対応付け |

通常画像では従来どおり3ページ目の漫画専用12〜16を無効表示し、保存・統合は利用可能です。必須値や下書き管理に×を追加していません。

## タグ・解除・Undo

既存の `renderUnifiedCard` と `personSelectedItem／Open／Remove` を再利用しました。候補IDから `hFeature(id).label` を読み、日本語の仮名は埋め込んでいません。未選択は「未選択」。通常状態でも保持している選択は表示し、出力OFFと区別します。

カードを開くbuttonとタグbuttonは兄弟要素で、buttonの入れ子を作りません。×はstopPropagationし、共通タグ部品側のUndo記録は無効にして、既存 `hSetFeature → hTransaction → persist` が1回だけ記録します。通常Undoで表示・重み・生成全文を復元できます。新しい独立保存処理は作っていません。

×だけは依頼どおり確認なしです。既存の候補一覧の共有変更、競合、コマ削除、部分確定などの必要な確認は維持しました。元特徴のreplaceから出る変更先タグは、特徴だけOFFにしても消えないため×を付けず「元特徴で変更」と案内します。

タグは折返し、×は44px以上を確保しました。長い名前は2行まで表示し、タグ名から候補一覧で全文を確認できます。全タグはカード内の縦スクロールで個別解除可能です。実測した見出し・説明・タグ高さに合わせて行の最低高さを確保し、小画面・横画面・文字拡大では必要に応じて画面を縦スクロールできます。横幅を拡大していません。

## 通常画像・漫画の対象

通常画像は共有基本設定を参照します。漫画モードの「カードの適用範囲」で、共有基本設定または明示したコマIDを選びます。人物・Creatureの対象selectと併せて、表示と解除を同じ参照へ固定します。共有解除は基本設定を継承する漫画にも反映し、既存のコマ別ON・下書きは保持します。

コマでは継承・継続範囲・localの実効選択を表示し、×はそのコマへ既存形式のOFF指定を保存します。基本設定・他コマ・継続範囲そのものを解除しません。通常状態でも保持する選択を表示するためのresolver入力のコピーは表示用だけで、保存や生成に渡しません。

漫画ページの明示入口と、既存コマダイアログの対象変更は同じ安定IDへ追従します。表示用scope・modeはsession中のUI値で、保存schema、Undo、JSONへ追加していません。staleな対象・設定・候補定義を持つ解除と、import中・別タブ競合を拒否します。

## 保存・生成・PWA

追加検査で、旧改善版の名前付き保存が怪異設定を含めない既存不具合を再現しました。既存保存builderへ、v5で既に対応しているoptional `horror` フィールドを含める最小修正を行いました。同じpersist・journalを使い、workspaceを勝手に名前付き保存へ混ぜません。新しい保存には怪異設定を含めますが、既にその設定を欠いた旧保存の失われた内容は復元できません。

v5、既存5キー、namespace、UUID、候補ID、モチーフmetadataを維持しました。通常Undoと下書きUndoは独立、画像・配置・Undoのsession限定仕様も維持しました。元Creature・成人利用条件・候補データ・英語タグ・生成関数を変更していません。

SWはcache名だけ `seaart-tool-pwa-v5-horror-card-selected-tags-v1-http-cache-v1` へ変更しました。network-first、旧cache保持、offline、更新通知、未保存入力の保護を維持し、公開originの更新試験を行っていません。

## 生成元・変更ファイル

`embed-horror.py` が通常画像優先UIの後に `src/horror-card-tags.js` を埋め込み、`integrate-horror.py` が名前付き保存のoptional fieldを補完します。孤立出力へ再生成し、製品HTMLとの全bytes一致を確認しました。既存ソース5ファイル、既存テスト・fixture・記録128ファイルはbyte不変です。

変更ファイルは次の19ファイルです。

- 製品・生成元5：`index.html`、`sw.js`、`scripts/embed-horror.py`、`scripts/integrate-horror.py`、`src/horror-card-tags.js`
- 新検査6：`tests/card-tags/` 内のcontracts、ui、persistence、pwa、replay、README
- 提出物3：本報告、検証報告、Androidチェックリスト
- 証跡5：`validation/horror-card-selected-tags/` のREADME、summary、structural-verification、final-records、development-records

詳細は[検証報告](REPORT_怪異カード選択済みタグ検証.md)、[再実行手順](tests/card-tags/README.md)、[Android確認](CHECKLIST_怪異カードタグAndroid確認.md)を参照してください。main・公開PWA・既存Sitesの変更は行っていません。
