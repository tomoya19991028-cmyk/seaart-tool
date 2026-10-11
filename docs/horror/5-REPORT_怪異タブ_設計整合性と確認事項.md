調査日：2026-10-11（日本時間）。調査基点：GitHub main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。

対象：`tomoya19991028-cmyk/seaart-tool`。mainを新規cloneし、remote HEADを再照合した。製品コード・既存テスト・GitHubを変更していない。第2回モチーフ人物の未公開差分は基準に含めない。

本文の「現行」はコード確認結果。「設計案／推奨」は未実装。「要確認」はユーザー承認を要する仕様判断。設計案の関数名は新規API案であり、現行に存在する関数として扱わない。

# B. 設計整合性と最終確認事項

## 1. 判断

実現可能。ただし「タブと候補だけを追加する変更」ではない。安定ID、出力overlay、独立下書き、保存transaction、局所的な再確認が必要。既存の5キーtransactionと人物／Creature出力単位を再利用し、成人向け・原作形態・擬人化を別の軸として維持する。

| 指示仕様 | 現行との差分 | 推奨 |
|---|---|---|
| 独立怪異タブ | 5タブ固定、6コマ管理 | 第6タブと専用screen。既存タブの意味・順番を維持 |
| 3ページ×6カード | 2列カード枠等は再利用可能 | C記載の18カード案。管理操作はdialogへ |
| 通常／部分／完全 | 原作形態・normal/semi/fullは既存 | horror.stateを新設。representationを使い回さない |
| 元の特徴を維持／変更／除外 | 現行タグは統合文字列が多い | 出力前のsource付きtokenだけ制御。元profileは不変 |
| コマ別怪異化 | 位置／行動中心、shared identity | 変化する外見をコマ単位へ移す。単純な末尾追加では不可 |
| 維持範囲 | コマ番号しかない | mangaIdとpanelIdを追加。範囲はIDのinclusive区間 |
| 一括固定・部分確定 | 対応なし | 先にplan下書きを保存、確定直前に局所再照合 |
| 独立下書き | working全体Undoが既存 | settings内のworkspaceと独立Undo。生成から完全除外 |
| 統合・削除・救出 | 通常importは置換型 | 怪異下書きのmerge plannerを別設計。新しいという理由で上書きしない |
| 旧JSON互換 | v3/v4、未知情報が落ちる | 新版は旧版を読む。旧版への完全往復は保証しない |

## 2. そのまま使える処理／共通化すべき処理

再利用：CSS色・カード枠・候補行・chips・重みUI・お気に入り表示、生成モデルのprefix／order、人物単位の分離、既存5キーjournal／revision／rollback、JSONの安全な型検証、候補管理の表示原理。

小規模な共通化：候補UIへgetValues/setValues/contextを渡すadapter、target selector、source-aware appearance token取得、漫画のID→index解決、保存payloadのfactoryとvalidator。新規の怪異workspaceをafCommitBundleへ含めるための変更は必要。

使い回さない：damageの前コマ継承、adultReady等の資格、actorExtensionsのmotif whitelist、既存人物／Creatureレコードの可変参照、旧import handlerの「置換」を下書きmergeとして使用すること、生成履歴を下書きstoreとして使うこと。

## 3. 保存方式比較

| 案 | 利点 | 問題 | 判断 |
|---|---|---|---|
| root v4・同namespaceへ追加 | 変更が少ない | 現行HTMLが未知fieldを落として同じキーへ保存する。実測で確認 | 不採用を推奨 |
| root v4・新namespace＋怪異専用file形式 | local保存は分離可能 | 通常v4 exportを旧版へ渡すと怪異を落とす。file形式の分岐が複雑 | 代替案。旧版対応の誤解を避ける必要 |
| root v5・新namespace・horrorSchema1 | 旧版はJSON v5を拒否。新5キーでold writerと分離 | validator／migration／test adapterの更新が必要 | 推奨。要ユーザー確認Q1 |

root v5は既存fieldを改名する意味ではない。actorExtensions v4、adult v1、humanProfile v1、actorFormCatalog v1を維持し、working.horrorとsettings.horrorWorkspaceを追加する。ディスクsettings.versionも5、working/historyのwrapperはv2を維持する案。marker version1／journal version2のpayload validatorは新namespace・v5を扱う。旧bundleを読む専用validatorは元契約のv4を保持する。

新namespace案：`creature-adult-v1/result-access-v1/motif-person-v1/horror-v1`。settings/working/history/marker/journalは5種類のまま、全キーにhorror-v1の区別を付ける。正確なキー文字列はCで定義。旧キーの削除・双方向同期・旧journalによる新bundle復旧は禁止。

## 4. 最終確認が必要な仕様

| 番号 | 判断事項 | 推奨案 | 代替・留意点 |
|---|---|---|---|
| Q1 | root v5＋新5キーへの移行を認めるか | 旧版の誤上書き保護のため認める | 同namespaceは推奨しない。承認前に移行を実装しない |
| Q2 | 独立怪異の内部個体をCreatureとして持つか | 新しいCreature UUIDを作り、別horror metadataで独立怪異と表示する | 独自kindはsubjectActors／相手参照／人数／保存の大規模拡張。独立怪異がCreature欄にも現れる扱いは要確認 |
| Q3 | 自由入力`custom`の永続対象化 | 怪異の確定対象は標準／original／motif／Creatureに限定。自由入力はoriginalへ明示複製後に利用 | 元文字列を自動的に個体化しない |
| Q4 | 漫画対象と最大コマ数 | 通常漫画1～6を維持。簡易漫画は回帰保護のみ | 簡易漫画連携／7コマ以上は別工程 |
| Q5 | コマ数減少と「削除」の区別 | 従来のcount変更は非表示。新しい明示削除だけIDを廃止し孤立項目化 | countを減らすだけで下書き対応先を削除しない |
| Q6 | 第6タブの配置 | 横にスワイプできる独立タブ。タブの並びは既存5個＋最後に「ホラー・怪異」 | 2行navは縦長化。短縮名「怪異」なら小型だが表示名の承認が必要 |
| Q7 | 種類・featureの初期候補と強度 | 種類は優先表示だけ。強度は低／中／高の設計案、既存重みとは独立 | 正式な候補一覧・英語タグ・適用条件は未提供。自動で大量作成しない |
| Q8 | 通常状態で元外見の除外／変更overlayも無効にするか | 無効。元の設定へ戻る。独立怪異はその基本Creature外見へ戻る | 怪異featureだけ抑制して元外見maskを残す方式は通常の意味を変える |
| Q9 | 競合のある確定済み怪異の生成 | 対象の怪異生成を中止し理由を示す。既存結果の扱いは現行結果保護を維持 | 暗黙の片方優先／無警告出力は避ける |
| Q10 | 基本特徴を変える前後の固定 | 変更前に影響プレビュー。変更前外見を守るplanは事前snapshotから作る。基本変更と固定は別Undo | 変更後に旧外見を推測しない |
| Q11 | 下書き・ゴミ箱を含む名前付き保存の呼出し | まず確定設定を復元。任意同梱workspaceは統合プレビューへ | 全workspaceを無条件置換しない。選択した名前付きsnapshotにどの下書きを含めるかも要確認 |
| Q12 | 保存容量・動作上限 | サイズ警告とexport案内。上限超過は保存中止し既存を保護 | 有効ゴミ箱／対応先不明を自動削除しない。soft上限は試験後に決める |

以上は推奨であって既にユーザーが承認した決定ではない。C仕様書は確定要件とQに依存する案を分ける。実装開始前に少なくともQ1/Q2/Q3/Q4/Q7を決定する。

## 5. 主なリスク

高：旧HTMLによる保存の欠落、コマ番号の誤対応、shared identityから通常コマへの混入、部分確定の途中保存、全working Undoによる未確認下書きの消去。

中：base feature変更・candidate編集後の確認再判定、trash/tombstoneのmerge、範囲端削除・逆転、別タブ競合、10MB import上限、5キーに保持するworkspaceの容量。

低～中：第6タブのスマホ横幅、差分一覧の長さ、検索focus、重み／chipsの余白。UIを2列カード＋1dialogへ寄せて抑える。

怪異タグを指定してもSeaArtで身体構造や外見が確実に実現する保証はない。とくにspecies／原作identityが暗黙に持つ角・翼・体型をタグ抑制だけで取り除くことは保証できない。
