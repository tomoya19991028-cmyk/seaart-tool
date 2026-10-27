# SeaArt Prompt Builder

製品は `index.html`（単一HTML）、PWA資産は `sw.js`・`manifest.json`・3アイコンです。
このブランチは、添付v44を仕様基準にした監査・修正版です。PRを作成してもmainや公開PWAは更新されません。

## 現行の保守・ビルド

```sh
npm ci
python3 scripts/build-current.py /tmp/seaart-current.html
cmp index.html /tmp/seaart-current.html
npm run build:check
npm run test:audit
npm run test:weapons
npm run test:storage
npm run test:remaining
npm run test:stability
```

出力先は新しいファイルを指定します。ビルドは既存ファイルと `index.html` への直接上書きを拒否します。
ブラウザ試験にはPlaywrightのChromium（`npx playwright install chromium`）または `/usr/bin/chromium` が必要です。
`CHROMIUM_PATH` でも指定できます。試験はローカルHTTP・新規ブラウザ領域・合成データだけを使います。
結果は `.audit-tmp/` に作成されます。実画像生成、Android実機、実際の日本語IMEは自動試験に含みません。

現行ソースの構成と修正方法は [src/current/README.md](src/current/README.md)、監査結果は `docs/v44-audit/` を参照してください。
`scripts/build-integrated.py` と `scripts/build-tg-yugioh-phase1.py` は過去版の再現用です。
これらの出力をv44の製品へ採用すると、v44の変更が失われます。履歴再現用途として残しています。

## 保存と公開

保存namespace・既存データのバージョンは維持します。ダウンロードHTMLとHTTPSのPWAは保存領域が異なる場合があります。
HTMLのコピーは、端末内の保存データのバックアップにはなりません。移動前にJSONを書き出してください。
公開時は既存のGitHub Pages経路を利用します。検証fixtureの公開除外 `_config.yml` を保持してください。

残試験の対応表・結果・Android確認版の作成方法は [残試験追補](docs/v44-audit/REMAINING_v44_残試験とAndroid確認版.md) と `tests/v44-remaining/README.md` を参照してください。

武器の9分類・装備と使用動作の共用モデルは [実装仕様](docs/weapon-actions/IMPLEMENTATION.md)、Android確認項目は [確認表](docs/weapon-actions/ANDROID_CHECK.md) を参照してください。

生成時の保存容量不足に対する復旧用データの圧縮は [保存容量の修正](docs/storage-quota/README.md) を参照してください。
