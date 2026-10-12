# 怪異タブ：通常画像優先UI改善

通常候補をタップして即時選択・解除し、漫画の詳細は明示的に切り替えて開くUIへ変更した。保存v5・共有基本設定・漫画・下書き・Undo・モチーフ人物の処理を維持。main・公開PWA・既存の本人限定Sitesは変更していない。

## 基点・保護・保存先

- 最新統合remote：`0dff414fda13f92c2a0099b4570d0c68da797a18`
- 最新main：`5b5bb03589dcc9a661402395d6c3db20cfd4cf52`
- 専用ブランチ：[feat/horror-normal-first-ui](https://github.com/tomoya19991028-cmyk/seaart-tool/tree/feat/horror-normal-first-ui)
- 検証済み製品commit：`1a8394d19c04ef9f0282fbeb90432e2ad074fed0`

開始時に全worktreeの状態とremoteを確認した。既存worktreeはclean。製品・主要source・schema基盤・producerとfingerprintを `/workspace/seaart-normal-first-audit-20261012T021937Z/prework/` へ保護し、別worktree `/workspace/seaart-normal-first` で作業した。既存ブランチへ変更・破壊的reset／cleanを行っていない。

製品後の報告・証跡commitは製品を変更しない。最終remote HEADは最終回答に記載する。GitHubから製品・source・producerを再取得して全bytes照合した。

## 原因と変更前後

変更前の経路は、特徴カード→`hFeatureDialog`→checkbox等をbuffer→「保存する」→`hBaseChangeDialog`→全6slotの影響確認→さらに「保存する」。通常画像の候補操作でもコマ向けプレビューを毎回表示していた。

| 操作 | 改善後 |
| --- | --- |
| 怪異タブ入場／reload | 通常画像を標準表示 |
| 通常候補のタップ | その場で選択・transaction保存・表示更新 |
| 解除 | 同じ候補または選択済みタグの×で解除 |
| 重み・個別強度 | 必要な候補の「詳細」を明示的に開く |
| 状態・種類・構造・元特徴 | 通常用フォームで保存。不要なコマプレビューを開かない |
| 漫画の詳細 | 上部の「通常画像／漫画」で明示切替 |
| 漫画ページからコマ設定 | 既存コマ編集の「このコマの怪異設定」から同じコマの既存dialogへ |

通常候補は即時保存なので「閉じる」は取消ではない。解除または通常Undoで戻す。詳細・基本フォームは明示保存までbufferを保持する。候補の検索・入力以外ではテキスト欄に自動focusせず、日本語キーボードの不要な表示を避ける。

18カード・3ページ×6、分類・候補・名前・英語タグは維持。通常モードではコマ・継続範囲・固定・下書き・ゴミ箱の5カードを同じ位置に残して「漫画モードで利用」とする。漫画に切り替えると従来通り使える。対象selectは通常モードでも直接操作でき、人物ごと・Creatureごとの設定を分離する。

## 共有設定と必要な確認

`horrorState.byActor`は通常画像と漫画全体の共有基本設定、`byManga/byPanel`はコマの上書き。UI表示を変えるために複製・分離しない。モチーフ人物の元Creatureへ自動伝播しない。

表示モードはsession中のUI変数のみ。切替・入場・reloadで保存／Undo／コマID／下書きを変更せず、v5への新fieldや保存キーを追加しない。未確認下書きを確定しない。表示モードを永続保存する必要はなく、毎回のタブ入場は通常を標準にする。

競合する元特徴・新しい排他競合は確認を残す。保存済み漫画が基本設定を継承し、その特徴の解除・通常化・構造なし・元特徴除外等に影響がある場合も共有変更を確認する。その確認は通常のdialogで、コマ番号の設定画面へは遷移しない。取消は非破壊。staleな対象／設定／別タブ保存は拒否し、失敗時はRAM・disk・Undoとチェック表示を戻す。

実装初期に、未編集のdefault layoutを保存済み漫画と誤判定して解除確認が出る問題を検出。rendererが埋めるdefault layoutを比較に反映して修正した。最終N03・N08で、通常の即時解除と必要な共有変更確認を分けて確認した。

## 変更ファイルと製品

製品5ファイル：`src/horror-normal-ui.js`（新UI）、`scripts/embed-horror.py`（runtime後へsource埋込）、`src/horror-runtime.js`（復旧中の表示切替を読取操作として許容）、`index.html`、`sw.js`（一意cache名のみ変更）。その他は新規テスト・手順、3報告、検証証跡。

生成順・既存sourceを維持し、隔離ファイルへ再生成したHTMLは全bytes一致。HTMLは3,915,679 bytes、SHA-256 `3bf2d5c753fb69ad402aa08f32f720a03834679f7b1921dd56973b5ad8d0a33c`。15 inline scriptとSWの構文、UTF-8・CRLFを確認。cache名は `seaart-tool-pwa-v5-horror-normal-first-ui-v1-http-cache-v1`。network-first・旧cache保護・通知・旧タブ非強制reloadを維持した。

## 検証環境

既存Sitesへの操作は行っていない。追加公開・課金・権限変更なし。改善版は独立localhost環境と配布ZIPで提出する。ZIPの起動手順は同梱READMEを参照し、旧Sitesや公開URLと別originで使う。Androidから利用できる新しいhosted URLは今回発行していない。

[検証結果](REPORT_怪異タブ_通常画像優先UI検証.md)、[Android手順](CHECKLIST_怪異タブ_通常画像優先UI実機確認.md)、[再実行手順](tests/normal-first/README.md)、[同一性と集計](validation/horror-normal-first/summary.json)を参照。main反映・公開・旧Sites上書きは別途承認待ち。
