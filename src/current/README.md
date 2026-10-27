# v44の再現可能な製品ソース

`manifest.json` は37個のインラインscriptの実行順を定義します。
起点は保存済みcommit `894d5fbfdfa65e68a50b77acdaa3e497ed31aeca` のHTMLです。
そのSHA-256を検証したうえで、HTMLパーサーでscript境界を取り出します。Git履歴を含むcloneが必要です。

- `page.html.in`：HTML/CSSと37個のscriptスロット。巨大な製品HTMLの複製は保持しません。
- `script-edits.json`：変更された旧scriptに対する、旧行と旧SHAを検証する差分。
- このディレクトリのJS：v44の追加scriptと武器動作の共用モジュール。動作修正は該当実装へ直接加えます。
- `../person-specific-forms.js`：v44の最新の固有候補処理を含む既存モジュール。
- その他の既存 `src/*.js`・JSON：マーカーで管理された埋め込みブロックを起点から再生成します。

`scripts/build-current.py` は製品 `index.html` を入力にしません。
未変更scriptは検証済みの起点から再利用し、変更scriptはアンカー付き差分を適用し、管理ブロックを既存ソースから更新します。
全入力を解決した後に37scriptをテンプレートへ埋め込みます。`sources`配列は同一script内で依存順に連結する保守モジュールです。武器の定義・編集は`weapon-actions.js`、共通ポーズは`pose-actions.js`を修正します。アンカー・個数・SHA不一致は失敗します。

初回に再生成した添付v44のSHAは `0c8b08ee906737152aa7b0971edafbc611868c8c524b3fb7f850586f0b5ede5e` と一致しました。
監査の修正後は添付SHAと異なるのが正常です。現行製品との一致は `--check` で検証します。

修正後は新しい出力へビルドし、差分を確認してから `index.html` を更新してください。
新たなwrapperの追記で上書きせず、対応する既存ソースを修正し、関連試験を実行してください。
過去版のビルダーが参照するJSONを現行用と取り違えないでください。

`prependSources`は起点scriptの直前に同じscript内でソースを連結します。
script 0では、保存処理の初期読み込みより前に`../vendor/lz-string-1.5.0.js`と
`storage-journal.js`を読み込みます。圧縮対象は一時的な復旧journalだけです。
通常の保存キー・JSON出力と旧journalの読み込みは維持します。
