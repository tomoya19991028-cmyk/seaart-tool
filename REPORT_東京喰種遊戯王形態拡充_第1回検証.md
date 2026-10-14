# 東京喰種・遊戯王・形態拡充 第1回総合検証

最終採用55 runner・714ケースすべてPASS、FAIL 0。今回未実装による対象外4項目は別枠SKIP。中断・旧バイト列・試験準備失敗の実行結果を最終PASSへ加算していない。

基準：`3fd1bb9fc34be09d85e3eef71cc1f6122f9054b8`。対象は専用検証ブランチのローカル配信。製品index SHA-256 `a8754a15f383ff603aa642b2e863eebbde646b4c15c5de33686f3014f2f5cb98`。利用者の保存データは使用していない。

| 試験 | ケース | PASS | FAIL | 証跡 |
|---|---:|---:|---:|---|
| 第1回人物・形態・保存・JSON・検索・7モデル | 32 | 32 | 0 | attempts/contracts-outfit-fix/results.json |
| 15名標準外見の恒常特徴・複製 | 10 | 10 | 0 | attempts/new-extras-outfit-fix/preset-details/results.json |
| 遊戯王14名の個別選択・名前付き保存 | 15 | 15 | 0 | attempts/new-extras-outfit-fix/yugioh-selection/results.json |
| 共通人物一覧3幅・隔離PWA | 7 | 7 | 0 | attempts/ui-pwa-outfit-fix/results.json |
| 静的品質・旧定義保持・再生成 | 21 | 21 | 0 | attempts/quality-outfit-fix/results.json |
| 形態版から継承した9runner | 73 | 73 | 0 | attempts/forms-outfit-fix/ |
| 旧41runner | 556 | 556 | 0 | attempts/inherited-final-run/verified-results.json |

証跡ルートは `validation/tg-yugioh-phase1/`。[最終集計](validation/tg-yugioh-phase1/results-summary.json) と [製品・試験SHA](validation/tg-yugioh-phase1/final-product-and-tests.json) を保存。Android実機と実SeaArt画像生成は未実施。

## 確認済みの主要契約

旧1,390行の全レコードと旧1,384基本外見が一致。旧固有11定義・候補配列のprefixを維持し、新規15名と標準15件、赫眼8件だけを追加した。全形態ownerと必要候補を解決できる。

標準→特殊→別特殊→標準、同一形態再適用、金木の旧赫子から新赫眼への解除、手動特徴の維持、形態前から存在する同じ特徴の保護を確認。赫眼は金木左／他7名両眼と黒強膜を検証した。形態適用Undo、settings／working／history／marker／journalの5書込失敗時のRAM・保存・Undo復元を確認した。

自動保存の再読込、名前付き保存、履歴、実JSON往復、旧製品のv4／v5実エクスポートとv3互換fixtureの読込を確認。今回追加したOLDJSON-3はv4出力のversion変更とactor拡張除去で作成した互換fixture。既存I24・PWA T29では、保護した実v3ソースの起動・保存からの移行も別途検証した。新15名のカタログ・標準外見は旧データを取り込んでも保持される。2人物＋Creature、漫画コマ固定設定は独立性を確認した。

遊戯王は内部groupを保ち表示7→1。詳細シリーズ検索、旧GXフィルタ状態の復元、全14名の選択と保存を確認。未知作品文字列へは完全一致変換を拡大しない。ペルソナ10名は不変。

7モデルの旧人物＋Creature・通常／漫画の生成全文は形態基準版と一致。新赫眼タグを7モデルの文字列出力で確認した。画像生成の成功率は未評価。

## 初回試行と再検証

先行attemptsには失敗と中断も保存している。未定義の空eyeDetailへpushした試験fixture、追加直後の別人物の初期化不足、隠れたnative selectと再描画で消えるcheckboxへの操作を修正した。実際の分類メニューと候補ラベルを操作する試験へ直し、最終32件は全PASS。

CPU 2コア環境に対する過剰並列でページ読込タイムアウトが起きたため、同時runnerを減らした。旧auto-compatibilityは配信用の旧版パス不足でappReady未定義となり、正しい保護HEADから旧静的ファイルを準備して再検証し、36通りの通常36／漫画36／コマ144全文比較をPASSした。旧試験の期待値を実装結果へ無条件変更していない。

元テストとfixtureはすべて基準HEADとバイト比較。承認された追加行・候補・衣装・標準形態・性別mapキーだけを旧データ比較の投影から除く。生成全文は一切投影しない。cache名と、末尾に新形態が追加された旧UI試験の適用対象を元の金木赫子へ固定するadapterを用いた。従来の11件期待のqualityを合格扱いにせず、旧11prefix＋最終19件を検証する新21品質項目へ分けた。

実装レビューでウタとジェノスの衣装値の重複を検出。ウタ専用の所有指定と重複セットを削除し、既存衣装を再利用した。TG18で全旧基本衣装ownerと両者の共有を検証、Q21で新候補が旧候補の所有権を上書きしないことを検証した。修正前SHA `d8ad90...` の成功結果は最終採用していない。

R1の49契約・865 matrix、旧通常252／漫画252全文、保持した固定fixtureの12 datasetを比較。固定出力fingerprintは `7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。865 matrix、構造72組・未指定／なし144組は714ケース内の追加assertionとして記録し、ケース数へ二重加算しない。

旧モチーフ第2回の元専用3テスト・元手順書は未回収のまま。保存されている独立代替M01～M14を再実行し、714ケースのうち14件は代替（通常自動700＋代替14）として区別する。元の48契約・障害7件などがPASSしたとは報告しない。

## 未実施・保留

R08の亜門／滝澤の左右2項目、R09の雛実複合赫子、R24の非人型新形態は今回未実装のためSKIP。既存金木の赫子・構造・auto競合は回帰対象。新しい全身赫者・巨大器官のエンジン適性は未評価。

Android実機、IME変換、実端末PWAインストール、実SeaArtの7モデル画像再現は未実施。自動Chromiumのviewport検証と隔離originでのoffline検証を実機合格に換算しない。手動で意味的に矛盾する特徴を残した場合の画像品質は保証しない。

既存の適用状態比較用snapshotはbodyFeatures／effectを含まない。profile・ownershipの保存と複製用captureは保持されるが、歯等を手動変更した際の状態表示が差分を検知しない場合がある。大規模な適用エンジン変更は行わず、次回計画へ記載した。

旧story-contracts S03は機能assertion前のpage.goto 30秒timeoutで失敗した。同じ原本を単独で全29件再実行し全PASS。失敗した実行は保存し、最終採用へ加算していない。

再試験では、歴史的なSW更新と旧writerを正しい保護HEADへ揃えた。旧HTTP v4は3aae122、旧round2 v4は7b3f9af、旧怪異v5はf58be6a、旧v3はee5b64a、旧統合v5は0dff414を使用。旧boundariesの固定URLだけをroute.cjsで現在のTARGET_URLへ接続し、PWA初期版のパスと分離した。準備漏れ・誤った基準SWによる失敗を保存し、失敗したrunner全体を原本のまま再実行した。

## R01～R25 対応表

| 計画 | 最終検証範囲 |
|---|---|
| R01 | TG01／Q01：旧1,390行・ID/value/group・元テスト不変 |
| R02 | TG03／Q12～Q14：owner、候補、衣装の参照 |
| R03 | TG04／TG05、既存形態契約：標準・特殊・別特殊・解除 |
| R04 | TG06：同一形態の連続適用 |
| R05 | TG07：先に手動で設定した同じ特徴を維持 |
| R06 | TG08と既存形態契約：手動編集・次形態の明示項目優先 |
| R07 | TG02／TG04／TG11、既存形態契約：表情・ポーズ・傷・背景等 |
| R08 | TG04：金木左眼と他7名両眼をPASS。亜門・滝澤の未実装2項目はSKIP |
| R09 | 雛実の新複合赫子は未実装：SKIP |
| R10 | TG05／TG09と旧怪異契約：既存赫子の解除・auto／構造との独立性。新赫子なし |
| R11 | TG07／TG09と既存競合試験：無関係な手動特徴を削除しない |
| R12 | TG10、旧2人物＋Creature独立性試験 |
| R13 | TG11、旧shared/fixed/boundaries：コマ固定・範囲・UUID・並替 |
| R14 | TG12、既存Undo・transaction契約 |
| R15 | TG16、既存管理／candidate-ui：作成・複製・自由形態・削除・Undo |
| R16 | FAILSAFE 5件、既存faults／environment-faults／別タブ契約 |
| R17 | TG13／TG14、既存persistence：reload・名前付き・履歴 |
| R18 | TG15／OLDJSON-3/4/5、既存実JSON往復・拒否試験 |
| R19 | TG16／DETAIL-COPY、既存自由形態・specificExtras |
| R20 | TG17、既存candidate-ui：OFF/ON、選択済み、owner限定 |
| R21 | YG01／YG02／YG-SELECT 14件／SHARED 3幅：7→1、14名、元シリーズ検索 |
| R22 | TG01／YG03／TG18、旧保存・お気に入り：ペルソナ10名と既存参照 |
| R23 | MODEL01／MODEL02、R1・legacy・fixed：全7モデルの文字列と固定全文 |
| R24 | 新しい全身非人型は未実装：SKIP。既存Creatureは旧回帰で保持 |
| R25 | PWA-TG01～04、既存pwa：隔離origin・offline/reload/online・cache・旧保存 |

既知の制約は上記のsnapshot状態表示、既存衣装共有ラベル、未実施の実機・実生成、意味的に矛盾する手動タグの保持。今回対象の自動試験に未解決FAILはない。Node v24.19.0／Python 3.12.14／Playwright 1.62.1／Chromium 154.0.8037.57、Linuxで実施。
