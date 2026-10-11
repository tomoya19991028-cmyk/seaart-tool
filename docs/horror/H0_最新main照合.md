# 怪異タブ H0：最新main照合・仕様差分・Q1〜Q12承認依頼

未承認。製品実装を開始していない。資料5件をすべて読み、原本を変更せず保存した。

## 最新mainとの照合

2026-10-11、GitHub remote mainを再取得。HEADは5b5bb03589dcc9a661402395d6c3db20cfd4cf52で、5資料の調査基点に一致。基点からのcommit／製品意味差分なし。

| ファイル | bytes | SHA-256 | Git blob |
| --- | ---: | --- | --- |
| index.html | 3,775,550 | de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72 | 67abdcc632af594687739ae331d00d224d41ff9f |
| sw.js | 2,320 | 05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a | ac3608e670edfb95c79172988c3026a31b1cd119 |
| manifest.json | 762 | d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f | 0b9eee56bb9dbb59a1dd36f3ce997200f3e4a451 |

mainコードからnormalizeMangaの6slot固定・ID非保持、現行5キー、customのownerなし、Creature本番adult定義0、subjectActorsの人物／Creatureの分離を照合した。候補sourceはmainを隔離ブラウザで読み、objectとtupleの両形式を確認。最初のobject-only調査はtuple候補を拾わなかったため別記録として保持し、tuple対応の結果を根拠にした。候補やタグの書換えはない。

作業ツリーは前の第2回モチーフ人物専用ブランチの7b3f9afd6cf1db20b74359fcf3f14fa4d8101841でclean。そこへ怪異実装は混ぜない。この依頼の実装基準はmainであり、第2回未公開差分は含めない。承認後は最新mainを再確認し、別worktree／専用branch feat/horror-tab-manga-draft-integrationで進める。

## 資料と今回指示の差分・不足

1. PLANには初回H0/H1限定、INSTRUCTIONSには次工程ごとの別承認がある。今回のユーザー指示は初回承認後にH1〜H8を連続実行。今回指示を優先し、工程ごとの再依頼は行わず内部チェックポイントで進む。未承認の仕様変更・重大問題だけ確認する。
2. H8の公開準備は専用branch／ローカルの検証まで。今回指示のmainへのmerge／push禁止・Pages／公開PWA変更禁止を維持する。ローカルSW試験と本番公開を分ける。
3. Q7の正式候補・タグ・条件が未提供。大量候補を勝手に実装せず、種類6／特徴12の具体案を別紙で提示する。これは新しい提案で承認済みではない。
4. Q9の「対象の怪異生成を中止」が対象だけの省略か生成操作全体かは資料だけでは確定しない。対象欠落の無警告生成を避けるため生成操作全体の中止を提案する。
5. Q11の同梱対象選択は未確定。draft／trashを個別選択、復元時は統合プレビューという案を明示する。
6. Q12のsoft警告値は資料でも試験後に決める。保存失敗でデータを削除しない方針と10MB import上限維持を承認対象にし、実測値を最終報告する。

上記以外の仕様schema、normal抑制、stable ID、source分離、独立workspace、原子的部分確定、削除30日、救出／保留、manual mapping、独立Undo、成人条件／旧固定baseline保護は5資料に矛盾なく記載されている。これらも初回承認範囲に含める。

## 一括承認表

| 番号 | 項目 | 推奨する承認内容 | 実装への影響 |
| --- | --- | --- | --- |
| Q1 | 保存形式 | root JSON v5＋独立したhorror-v1の新5キー。既存actorExtensions v4等は維持。旧v3/v4は専用readerで読み、旧キーを削除せず旧版へ新JSONを渡した場合は拒否。 | 旧writerとの分離と新schemaが必要。現行namespaceへの追加は採用しない。 |
| Q2 | 独立怪異 | 新Creature UUID＋別horror metadata。Creature一覧にも表示。初期基本種類は既存ghost／demon／undead creature。元対象とのリンクなし。 | 新kindの追加は避ける。Creature一覧への表示も承認範囲に含める。 |
| Q3 | 自由入力人物 | customを直接永続対象にせず、ユーザー操作でoriginal人物へ複製した後に利用。自動変換なし。 | customのownerはnullで、文字列だけでは恒久IDにできない。 |
| Q4 | 漫画対象 | 通常漫画1〜6コマ。簡易漫画は生成・snapshotの回帰保護だけとし怪異連携を追加しない。 | 7コマ以上と簡易漫画への追加連携は今回の対象外。 |
| Q5 | 非表示と削除 | count減少は非表示としてslot／IDを保持。明示削除だけpanel IDを廃止し、対応先不明の下書きを保持。preset／story適用はIDを維持し、漫画resetは新mangaId。 | 挿入・削除・並び替えはpanel全体とRAM画像配置もIDに追従。隠れたslotも含め6slot上限。 |
| Q6 | タブ配置 | 既存5タブの最後に「ホラー・怪異」。navだけ横スワイプ。内部3ページ×6カード、主要操作44px以上。 | 既存タブを改名せず、文書横はみ出しを防ぐ。 |
| Q7 | 初期候補・強度 | 別紙の種類6／特徴12／強度低中高。種類は表示優先だけ。強度は輝く目・黒い霧のparameterのみ。その他のタグ／重み／品質は不変。 | 正式候補が資料にないので、この具体案の承認が必要。構造は条件判定に使い、未選択タグを自動追加しない。 |
| Q8 | 通常状態 | normalでは怪異特徴、強度、元外見の除外／変更、構造上書き、継続範囲出力をすべて停止。保存値は残す。 | 通常に戻せば元の人物／Creature外見へ戻る。 |
| Q9 | 生成競合 | 競合がある生成操作全体を中止し、対象と理由を表示。既存結果とその保護状態を維持。勝手に候補や対象を除外して生成しない。 | 資料の「対象の怪異生成を中止」の範囲を明確化。片方優先や一部欠落での無警告生成を避ける。 |
| Q10 | 基本変更と固定 | 変更前プレビューとsnapshotから固定案を下書きに作成。基本変更と固定は別Undo。確定直前に再照合する。 | 変更後に旧外見を推測せず、部分確定の確認を自動承認しない。 |
| Q11 | 名前付き保存 | まず確定設定を復元。同梱下書き／ゴミ箱は統合プレビューへ。両オプション初期OFF、含めるdraft／trashは個別選択可。全workspace置換なし。 | 履歴／通常Undoではworkspaceを巻き戻さない。旧importの未指定を削除命令にしない。 |
| Q12 | 容量・上限 | 既存JSON import上限10MBを維持。1,000項目の性能・journal増幅を実測し警告値を決めて報告。容量不足は保存停止とexport案内。自動削除なし。 | 未測定の件数上限を新設しない。有効trash／対応先不明を削除せず、復旧journalがあれば保持する。 |

Q1の正確な5キーはSPEC第9節のまま採用する。root v5、settings v5、working/history v2、marker v1／journal v2のvalidatorを新旧namespaceで分離し、actorExtensions v4、adult v1、humanProfile v1、actorFormCatalog v1を維持する。破損新bundleから旧bundleへ自動退避しない。旧キーは残す。

30日の基準はUTCで30×24時間、期限ちょうどで失効。再importによる期限延長は禁止。対応先不明active draftは無期限保持。未知schema／危険key／重複ID／不正日時は拒否または資料を保持して隔離する。下書き・trash・救出は生成へ自動適用しない。

Q7の全候補、英語タグ、条件、排他group、継続属性、強度バリエーション：[PROPOSAL_Q7_初期候補.md](PROPOSAL_Q7_初期候補.md)。構造の三値present／absent／unsetと源の区別を維持し、角／翼の追加で構造値を勝手に変更しない。

## 承認後の実行

H1→H2→H3→H4→H5→H6→H7→H8を同じ依頼として進める。工程ごとに受入・障害注入を通してから次へ進む。T01〜T30、7モデル×3分離、固定全文・12dataset・6viewport・PWA／offlineを検証し、元expectedは変更しない。最終テスト後に専用branchへ通常commit／pushしremote HEADを照合する。main／公開は別承認。

このH0ではH1〜H8の実装やT01〜T30の合格を報告しない。GitHubへの新branch作成・push、main更新、SW更新、公開更新は行っていない。

## 回答方法

「Q1〜Q12と初期候補案を推奨どおり承認」、または変更するQ番号と希望内容をまとめて指定する。承認が届くまでは製品実装を開始しない。
