# 東京喰種・遊戯王・形態拡充 第1回実装報告

作成日：2026-10-14。実装範囲は新規人物15名、表示絞り込み統一、東京喰種の赫眼8形態。Android実機・実SeaArt画像生成は未実施。

## 基準とブランチ

- 実装ブランチ：`feat/tokyo-ghoul-yugioh-forms-phase1`。既存ブランチから分岐。
- 基準HEAD：`3fd1bb9fc34be09d85e3eef71cc1f6122f9054b8`（`feat/person-forms-horror-background-lighting-ui`）。
- 作業開始時main：`5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。関連実装元：`7b16f4914372131f4f93677bf645b41e40f07258`。
- `a669edc3367083cdab3b67177ab988b12420de9f`と基準HEADの製品コードは同一。後続差分は報告・証跡。
- 製品最終HEAD：`5ced87e14d00c35d2069ce11926abc4b338396a2`。その後の報告・証跡コミットは製品コードを変更しない。最終提出HEADは配布ZIPの `HANDOFF.json` と `REMOTE_VERIFICATION.json` に記録（報告書自身のコミットSHAの自己参照を避けるため別添）。
- 正式ZIP：`SeaArt_調査設計_20261014.zip`、SHA-256 `a09439035591d1141cf621b4a52a6c3385e7f737fa7d68a1bbd97b89f67c6b3e`。27エントリーと同梱manifestを照合。設計JSONを保存データとして投入していない。

## 人物と標準外見

raw登録1,390→1,405行。内部作品は86作品＋一般1分類を維持。東京喰種6→21名。既存ID・name・value・group・行順・旧基本外見は不変。新規15名はそれぞれ標準形態1件。既存の丹恒別形態の同名重複を今回変更せず、共有ビューは1,389→1,404行。人物標準は1,384→1,399、人物特殊は11→19、Creature標準60は不変。

| 人物 | 固定ID | 英語value | 標準外見（衣装はJSON参照） |
|---|---|---|---|
| 亜門鋼太朗 | `character-extension-tg-amon` | `Koutarou Amon (Tokyo Ghoul)` | black hair、short hair、blue eyes。恒常特徴なし |
| 有馬貴将 | `character-extension-tg-arima` | `Kishou Arima (Tokyo Ghoul)` | white hair、short hair、gray eyes。glasses |
| 永近英良 | `character-extension-tg-hide` | `Hideyoshi Nagachika (Tokyo Ghoul)` | orange hair、short hair、brown eyes。orange headphones around the neck |
| 西尾錦 | `character-extension-tg-nishiki` | `Nishiki Nishio (Tokyo Ghoul)` | brown hair、short hair、brown eyes。glasses |
| 芳村功善 | `character-extension-tg-yoshimura` | `Kuzen Yoshimura (Tokyo Ghoul)` | white hair、short hair, slicked-back hair、gray eyes。wrinkled skin |
| エト／高槻泉 | `character-extension-tg-eto` | `Eto Yoshimura (Tokyo Ghoul)` | green hair、long hair、green eyes。恒常特徴なし |
| タタラ | `character-extension-tg-tatara` | `Tatara (Tokyo Ghoul)` | white hair、short hair、gray eyes。red metal mouth mask |
| ウタ | `character-extension-tg-uta` | `Uta (Tokyo Ghoul)` | black hair、undercut、red eyes。black sclera in both eyes／black neck and arm tattoos／ear piercings |
| 笛口雛実 | `character-extension-tg-hinami` | `Hinami Fueguchi (Tokyo Ghoul)` | brown hair、bob cut、brown eyes。white flower headband |
| 滝澤政道 | `character-extension-tg-takizawa` | `Seidou Takizawa (Tokyo Ghoul)` | brown hair、short hair、brown eyes。恒常特徴なし |
| 米林才子 | `character-extension-tg-saiko` | `Saiko Yonebayashi (Tokyo Ghoul)` | blue hair、long hair, twintails、blue eyes。恒常特徴なし |
| 瓜江久生 | `character-extension-tg-urie` | `Kuki Urie (Tokyo Ghoul)` | black hair、short hair、gray eyes。two moles below the left eye |
| 不知吟士 | `character-extension-tg-shirazu` | `Ginshi Shirazu (Tokyo Ghoul)` | orange hair、short hair, spiky short hair、brown eyes。sharp teeth／ear piercings |
| 真戸暁 | `character-extension-tg-akira` | `Akira Mado (Tokyo Ghoul)` | blonde hair、bob cut、blue eyes。恒常特徴なし |
| 四方蓮示 | `character-extension-tg-yomo` | `Renji Yomo (Tokyo Ghoul)` | gray hair、short hair、gray eyes。恒常特徴なし |

新規衣装セット14件と構成パーツを登録。ウタはジェノスと同じ既存衣装1件を再利用し、元ownerの表示を維持する。15名すべてに標準衣装の参照を登録。一般候補の一致値を再利用し、固有候補は必要なownerに限定。恒常特徴・衣装パーツ等45候補と両眼赫眼1候補を追加し、旧候補の配列位置とIDは維持。傷・血・汚れ・戦闘ポーズは付与しない。亜門・滝澤は人間時代。ウタの赤眼・黒強膜は標準の恒常特徴であり、発動形態を重複作成しない。

資料案からの補正：亜門の茶髪案を公式の人間期カラー設定に合わせ黒髪へ、瓜江の黒眼案を公式Quinxカラー設定に合わせ灰色へ変更。その他の衣装は資料の代表時期の簡潔な外見記述であり、全時期の装束を保証しない。芳村・タタラ等の平常眼色は資料基準を採用し、原作全巻の色指定照合済みとは扱わない。

ウタの衣装は既存の「ジェノスの代表衣装」という表示ラベルを維持して共有する。英語値は黒い袖なしシャツと暗色ズボンだけで、ジェノスの金属腕等の人物固有特徴は共有しない。

金木／佐々木、エト／高槻泉、滝澤／オウル、西尾／オロチ、英良／スケアクロウは検索別名で対応。佐々木を16人目として追加しない。ONE PIECEのウタの登録は維持。

## 追加した固有形態

| owner | 日本語形態名 | 設計上の英語名 | 変更項目 |
|---|---|---|---|
| Ken Kaneki (Tokyo Ghoul) | 赫眼（左眼） | Kakugan (left eye) | 左赤・右灰、odd、左眼黒強膜 |
| Touka Kirishima (Tokyo Ghoul) | 赫眼（両眼） | Kakugan (both eyes) | 両眼赤、same、両眼黒強膜 |
| Rize Kamishiro (Tokyo Ghoul) | 赫眼（両眼） | Kakugan (both eyes) | 両眼赤、same、両眼黒強膜 |
| Ayato Kirishima (Tokyo Ghoul) | 赫眼（両眼） | Kakugan (both eyes) | 両眼赤、same、両眼黒強膜 |
| Shuu Tsukiyama (Tokyo Ghoul) | 赫眼（両眼） | Kakugan (both eyes) | 両眼赤、same、両眼黒強膜 |
| Nishiki Nishio (Tokyo Ghoul) | 赫眼（両眼） | Kakugan (both eyes) | 両眼赤、same、両眼黒強膜 |
| Hinami Fueguchi (Tokyo Ghoul) | 赫眼（両眼） | Kakugan (both eyes) | 両眼赤、same、両眼黒強膜 |
| Renji Yomo (Tokyo Ghoul) | 赫眼（両眼） | Kakugan (both eyes) | 両眼赤、same、両眼黒強膜 |

8名8形態。新規赫子は0件。悟空5・金木3・一護3の旧11定義を維持し、金木は旧3＋赫眼1。形態名だけに頼らず、赤虹彩と黒強膜・左右を英語タグで明示。人物固有形態・管理・編集・複製・自由形態・ownership・トランザクションを再利用し、専用の別画面は作成していない。選択と適用は従来どおり分離する。

## 原典確認と保留

出版社の人物紹介・喰種生理辞典と公式アニメのカラー設定を照合。出版社の通常喰種分類と共通の赫眼生理、董香・利世の公式赤虹彩／黒強膜設定を採用根拠とし、金木の左眼は既存定義の左右に従った。8名それぞれの原作全巻・巻話場面を読み通したという意味の確認ではない。旧11形態はデータ保持を確認しており、全細部を今回改めて原典照合したものではない。画像ファイルは照合用ローカル資料で、リポジトリへ転載していない。URLと取得SHAは [source-review.json](validation/tg-yugioh-phase1/source-review.json) に記録。

- [集英社：人物紹介](https://youngjump.jp/tokyoghoul/tg/chara/)
- [集英社：喰種辞典](https://youngjump.jp/tokyoghoul/tg/data/)
- [公式カラー設定：董香](https://www.marv.jp/special/tokyoghoul/first/chara_02.html)
- [公式カラー設定：利世](https://www.marv.jp/special/tokyoghoul/first/chara_03.html)

亜門・滝澤・エト・Quinxの隻眼側／時期、全赫子の発生位置・本数・色・左右、雛実の複合器官、ウタ・タタラの未確定器官、金木の竜、巨大全身赫者、佐々木外見は保留。保留の全40案への対応は [次回計画](PLAN_全キャラ形態拡充_次回バッチ.md) に記載。四方の出版社ページのRC欄は「？」であり、今回羽赫確定の根拠としない。

## 遊戯王

完全一致の7分類（遊戯王・GX・5D's・ZEXAL・ARC-V・VRAINS・SEVENS）を表示上「遊戯王」へ統一。内部group・ID・name・value・保存参照は変更していない。14名を同じ絞り込みで選択でき、GX・5D's等の検索語は元作品名と英語valueで引き続き有効。main Picker、共通人物一覧、簡易漫画の人物一覧に同じ変換を使用する。未知の関連作品文字列は自動統合しない。ペルソナ10名は無変更。

## 変更箇所と互換性

- `src/tokyo-ghoul-phase1.json`：静的な15人物・標準外見・別名・完全一致グループ。
- `src/person-specific-forms.json`：末尾に8形態、46候補、14衣装セットと既存衣装の再利用と出典。既存定義は保持。
- `src/builtin-additions.js`：メンテナンス基準capture前の追加と共通表示・検索helper。
- `index.html`：データ埋込み、基本外見追加、表示・検索経路、恒常bodyFeatures受入れ。
- `scripts/embed-horror.py`、新phase1再生成スクリプト、`src/tg-yugioh-core-edits.json`：保護基準から再生成。
- `sw.js`：検証成果物のcache名のみ更新。APP_SHELL・fetch処理は不変。
- 新規 `tests/tg-yugioh-phase1/`、`validation/tg-yugioh-phase1/` と4報告書。元テストは変更していない。

標準外見のdetail.bodyFeaturesだけ既存候補解決とunionを許可し、不知の恒常的な歯を設定する際も無関係な手動身体特徴を維持する。既存の形態エンジンを再設計していない。赫眼定義の変更項目は眼色とeyeDetailだけで、髪・怪異構造・auto設定を持たない。標準外見適用済み／衣装設定済みなら衣装を変更しない。衣装未設定では既存エンジンの標準衣装・恒常detail補完が働く。手動の衣装部位は維持する。標準への明示適用は従来どおりその髪・眼・衣装スカラーを優先し、配列の無関係な手動特徴は維持する。形態前から手動で同じ特徴が存在すれば所有扱いにして削除しない。意味的に矛盾する手動特徴も勝手に削除しないため、生成結果の確認は必要。

保存version・localStorage名前空間は変更なし。JSON v3/v4/v5読込、自由形態、複数人物、Creature、漫画固定、Undo・メンテナンスUndo・保存失敗復元は検証報告に記載。新定義を古いアプリへ戻すと未知参照になり得るため、mainへの公開は別承認・移行検証後に行う。

## 再生成

`python scripts/build-tg-yugioh-phase1.py /tmp/seaart-phase1-new.html` で未使用パスへ再生成し、`cmp index.html /tmp/seaart-phase1-new.html` で同一性を確認する。旧 `build-integrated.py` は過去リリース用で、今回の再生成入口は新スクリプト。HTMLのCRLFとUTF-8を保持する。

## 製品SHA-256

| ファイル | SHA-256 |
|---|---|
| `index.html` | `a8754a15f383ff603aa642b2e863eebbde646b4c15c5de33686f3014f2f5cb98` |
| `sw.js` | `cd8d2fa1b8ab21749303a6d32d2c9734ed9cd9ffac22c5b934b9d5a6f69aa78c` |
| `src/tokyo-ghoul-phase1.json` | `2a52810560c2d00d26a14c537c936274b743f54e3f1537dbf2949ee7a096d92f` |
| `src/person-specific-forms.json` | `4e23f4fc1c897f70576c1b293ab2be5ec6e7bdc96ad2a54d18680e54923e9d61` |
| `src/builtin-additions.js` | `9e1806d21f351ca33ef11694a72f9bba954dc1f5551fc4c05d65ab2af308e3ca` |

main・既存検証ブランチ・Sites・公開PWAは変更していない。最終照合結果は提出証跡に記録する。

検証結果：最終採用55 runner・714ケースPASS、FAIL 0、対象外4項目SKIP。詳細は [総合検証](REPORT_東京喰種遊戯王形態拡充_第1回検証.md)。Android実機と実SeaArt生成は未実施。
