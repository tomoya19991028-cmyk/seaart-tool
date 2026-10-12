# 怪異カード選択済みタグ：独立検査

隔離されたChromium／localStorageの模擬データを使用する。実利用者の保存を読み込まない。

## 再実行

Playwrightと `/usr/bin/chromium` が必要。リポジトリを `/workspace/seaart-card-tags` に配置した検証環境では、別ターミナルで次を実行する。

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

各試験は、存在しない新しい結果ディレクトリを指定して実行する。原記録を上書きしない。

```sh
TARGET_URL=http://127.0.0.1:8765/seaart-card-tags/index.html RESULT_DIR=/tmp/card-tags-contracts-new node tests/card-tags/contracts.cjs
TARGET_URL=http://127.0.0.1:8765/seaart-card-tags/index.html RESULT_DIR=/tmp/card-tags-ui-new node tests/card-tags/ui.cjs
TARGET_URL=http://127.0.0.1:8765/seaart-card-tags/index.html RESULT_DIR=/tmp/card-tags-persistence-new node tests/card-tags/persistence.cjs
RESULT_DIR=/tmp/card-tags-pwa-new node tests/card-tags/pwa.cjs
```

PWA試験は自分で `127.0.0.1:8796` の一時サーバーを起動・終了する。他の試験とは独立したoriginで、公開サイトやSitesを更新しない。多数のブラウザを同時に起動せず、既存回帰を含むrunnerは最大3並列とした。

- `contracts.cjs`：C01〜C19。表示、個別解除、人物・Creature、通常Undo、保存失敗、コマ・継続範囲、元特徴、import・実2タブ、明示コマ入口、余白クリック。
- `ui.cjs`：縦6サイズ、横3サイズ、文字150%の3サイズ。各サイズで通常・漫画の両方、長い日本語名14件、44px操作領域、タグ欄の可視高さ、末尾タグのタップ・Undo、横幅を確認。実IMEやOSの文字拡大の代用と断定しない。
- `persistence.cjs`：名前付き保存・履歴復元、通常Undo10件、全6特徴グループのタップ到達、名前付き保存の実JSON roundtrip（CS01〜CS04）。
- `pwa.cjs`：オンライン初期cache、オフライン×、Undo、reload、再解除の保存、オンライン復帰。

## 既存回帰の設定

`replay.cjs` は元テストをメモリ内で読み込み、今回のcache名・検証URL、旧漫画UIの明示モード入口のみ設定する。元ファイル・assertions・expected・fixtureは書き換えない。

```sh
TARGET_URL=http://127.0.0.1:8765/seaart-card-tags/index.html RESULT_DIR=/tmp/card-tags-old-ui-new node tests/card-tags/replay.cjs tests/horror/ui.cjs
```

そのほか既存の `tests/normal-first`、`tests/horror`、`tests/integration`、モチーフ第1回/R1/固定比較を総合検証報告に記載した26runnerで実行する。R1とNative等の原本baselineは別途既存の固定検証環境を用意する。第2回M群は引き続き独立代替テストであり、未回収の原本テストの実行とは扱わない。

## HTMLの再生成

```sh
HORROR_BUILD_HTML=/tmp/card-tags-new-build.html python scripts/build-integrated.py
cmp index.html /tmp/card-tags-new-build.html
```

出力先は製品HTMLと異なる未使用パスを選ぶ。既存のモチーフ・怪異・通常画像優先UIに続き、CARD_TAGSのソースを埋め込む。名前付き保存の既存optional `horror` フィールドの補完も生成元から再現する。
