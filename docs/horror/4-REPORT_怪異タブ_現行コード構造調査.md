調査日：2026-10-11（日本時間）。調査基点：GitHub main `5b5bb03589dcc9a661402395d6c3db20cfd4cf52`。

対象：`tomoya19991028-cmyk/seaart-tool`。mainを新規cloneし、remote HEADを再照合した。製品コード・既存テスト・GitHubを変更していない。第2回モチーフ人物の未公開差分は基準に含めない。

本文の「現行」はコード確認結果。「設計案／推奨」は未実装。「要確認」はユーザー承認を要する仕様判断。設計案の関数名は新規API案であり、現行に存在する関数として扱わない。

# A. 現行コード構造調査

## 1. 最新版とファイル照合

| ファイル | bytes | Git blob | SHA-256 |
|---|---:|---|---|
| index.html | 3,775,550 | 67abdcc632af594687739ae331d00d224d41ff9f | de80b1f98d342f257f926338f602874fc2d46773882d22a788dbbfb6f5350e72 |
| sw.js | 2,320 | ac3608e670edfb95c79172988c3026a31b1cd119 | 05768c20f3fb5378d865741cc03fa47f66320136f1cfe5583edbb184d426f36a |
| manifest.json | 762 | 0b9eee56bb9dbb59a1dd36f3ce997200f3e4a451 | d16256a26fd8a80bbe3d9c5ad1b548b90243fa267530b54db4e429916d5c001f |

index.htmlはUTF-8／CRLF、13個のinline script。主要CSS／JSはHTML内。関連ファイルはSW、manifest、3種類のアイコン、tests配下。cloneした作業ツリーは調査前後ともclean。調査用スクリプトと成果物はリポジトリ外に作成した。

## 2. ID・状態管理

| 対象 | 現行の格納先／識別方法 | 制約 |
|---|---|---|
| 標準人物 | selected.characterの候補ID、profiles[候補ID] | 個体UUIDではない。同じ候補を同じ選択欄に二重選択する構造ではない |
| オリジナル人物 | originalCharacters、original-UUID | profilesは人物IDで独立 |
| モチーフ人物 | originalCharacters、motif-person ID、profiles、actorExtensions | 特別な整合性・成人拒否契約を持つ。怪異metadataを同entryに追加しない |
| 自由入力人物 | customCharacter、profiles.custom | `custom`は固定ID、actorOwnerForRefはnull。文字列だけを恒久個体IDとみなせない |
| Creature | creatures、creature-UUID等、kind:'creature' | 正規化で重複／欠落IDを再発行する場合がある。曖昧な対応先の自動付け替えは禁止 |
| 原作形態 | actorExtensions.byActor['person:'+id／'creature:'+id] | ownerRef、selectedFormId、appliedFormを区別 |
| 擬人化 | entry.representation、humanProfile.version1/byMode.semi/full | Nativeの実値は`normal`。怪異の通常状態とは別軸 |
| 漫画 | mangaState.panels[0..5]、count1～6 | 漫画ID・コマIDなし。画面／画像合成／ストーリーもコマ番号参照 |
| 候補管理 | mainMaintenance、personOptionEdits、candidateExtras等 | 選択済みstateとマスター定義を区別 |

主な参照：[allPeople L953](https://github.com/tomoya19991028-cmyk/seaart-tool/blob/5b5bb03589dcc9a661402395d6c3db20cfd4cf52/index.html#L953)、[actorOwnerForRef L1477](https://github.com/tomoya19991028-cmyk/seaart-tool/blob/5b5bb03589dcc9a661402395d6c3db20cfd4cf52/index.html#L1477)、[normalizeCreatures L3397](https://github.com/tomoya19991028-cmyk/seaart-tool/blob/5b5bb03589dcc9a661402395d6c3db20cfd4cf52/index.html#L3397)、[normalizeManga L3774](https://github.com/tomoya19991028-cmyk/seaart-tool/blob/5b5bb03589dcc9a661402395d6c3db20cfd4cf52/index.html#L3774)、[subjectActors L7088](https://github.com/tomoya19991028-cmyk/seaart-tool/blob/5b5bb03589dcc9a661402395d6c3db20cfd4cf52/index.html#L7088)。

怪異タブ・怪異state・永続怪異下書き・怪異ゴミ箱・削除マーカー・手動対応付けは現行に存在しない。既存にホラー系の候補語があることと、今回の機能が実装済みであることは別である。

## 3. 関連関数と接続点

| 領域 | 関数／変数・行 | 役割と変更時の注意 |
|---|---|---|
| 人物タグ | profileTags L1209、profileDetailTags L1193 | 各人物の外見、色、重み、詳細を出力。profileTagsは衣装展開を呼ぶため完全な純関数と決めつけない |
| Creature候補 | creatureFields L2725、creatureBasicPresets L2744 | 既存候補は維持。怪異候補のマスターは別の小さなregistryを推奨 |
| 固有特徴 | creatureFeatureOwnerIndex L3369周辺、creatureFeatureAllowed L3377 | 所有者で通常表示を制御。怪異の適用主体／由来管理とは別 |
| 外見適用 | applyCreatureBasicPreset L3392、applyActorForm L5319 | 既存適用の対象やUndo数を変更しない |
| Creature出力 | creatureFieldPromptTags L3423、creaturePromptTags L3424、creaturePromptGroups L3438 | Nativeの基本形状と特徴をまとめる。未知の怪異設定を直接cへ付けてもnormalizeCreaturesで落ちる |
| 擬人化出力 | creatureRepresentationMode L5476、creatureAnthroPromptTags L5500 | 色／体表／features継承はsemi/full別。怪異状態をrepresentation.modeへ混ぜない |
| 通常生成 | normalSubjectOutput L3547、generate L3611 | 単独、複数、strong、Kreaで経路が異なる。normalSubjectOutputだけを直しても全経路をカバーできない |
| 分離 | subjectPromptBlocks L3542、joinSubjectPromptBlocks L3535、subjectCountTags L3521 | none／standard／strong。新しいBREAK構文は不要 |
| 漫画人物 | mangaPeople L4216、mangaCharacterPresence L4282 | 登場／人物コマ設定とshared identityを併用 |
| 漫画Creature | mangaCreatures L4217、mangaCreatureIdentity L4219、mangaCreaturePresence L4220 | 現行のコマ別外見は位置・行動中心。コマごと変身するidentity機構ではない |
| 漫画生成 | generateManga L4302、perPanel L4314前後 | 全体に共通identity、個別コマにもidentityを出力。共通identityへ変化タグを足すだけでは通常コマへ混ざる |
| 漫画正規化 | normalizeMangaPeople L3759、normalizeMangaCreatures L3770 | 前者は未知entryをspreadするが、後者は指定fieldを再構成する |
| 継承 | mangaDamageState L3732、mangaKeepSubjectSettings L3767 | damageは前コマ継承。怪異の「基本継承」と同じ意味ではない |
| ストーリー | applyMangaStory L4198、undoMangaStory L4206、mangaKeepSubjectSettings L3767 | プリセットによる置換時に手動設定を維持する接続が必要 |
| コマUI | renderManga L4264、openMangaPanel L5597、mangaEditing | 現状index参照。並び替え時にeditor／結果／画像配置を再解決する必要 |
| スナップショット | captureWorking L3654、restoreWorking L3655 | profiles／creatures／adultScene／mangaStateを保存復元。多段wrapperが追加されている |
| 自動保存 | scheduleWorkingSave L5909、saveCurrentWorking L5910 | 250ms debounce、pagehideで保存 |
| 名前付き保存 | saveFavorite／loadFavorite L3650付近 | 全working snapshot。下書きは現在のsnapshotへ含めない設計が必要 |
| JSON | downloadJson L3661、backupFile handler L3663、afValidateBackup L1503 | 現行root v3/v4、10MB上限。未知fieldの認識を保証しない |
| 保存原子性 | afCommitBundle L1455、afJournal L1426、afCheckBundle L1418 | settings/working/history＋marker/journalの5キー。検証・競合・rollbackを再利用 |
| import保護 | actorFormStorageFoundation L8880～8898 | 事前検証、管理＋working＋historyを退避して失敗時に戻す |
| Undo | saveUndo L5672、undoHistory L5671、maMaintenanceUndo L6366 | 10件のworking snapshot。管理Undoも同じ土台を使用。下書きUndoの独立基盤はない |
| 結果保護 | raRunGeneration L9278前後、wrapper L9285～9288、resultAccessDecision | 表示・コピー・履歴・生成rollbackを守る。怪異機能が迂回してはならない |

restoreWorkingはL6361、7032、7209、8881、9133、9144、9253、9353等で包まれる。captureWorkingもL6360、9252、9352等で包まれる。元関数だけを読む／上書きする方式は採用しない。新設schemaを読む処理は、startupの初回persistより前に定義する。

## 4. UIの再利用

現行上部タブは「選択／キャラクター／仕上げ／結果／漫画」の5個（L480）。Creatureはキャラクターページの種別切替であり独立した上部タブではない。showMobileTab L2623、画面表示CSS L3、layoutPeople L5452、layoutManga L5526が接続点。

そのまま再利用できるのはカード枠・ダークテーマ・色変数・タグ表示・×解除・重みダイアログ・基本候補行・検索／分類／お気に入りの見た目。候補取得と選択setterには怪異専用contextが必要。

openGroupedPersonDisplay L5865、personPickerOptions L2473、候補dialog L2402付近、actorFormDialogShell L5409、actorFormFocusReturn L5411が参考。既存pickersに人物IDを仮装してprofilesへ怪異stateを書かせない。scSection L6236はperson/creature/adult以外をselectionへ落とすため、怪異を既存カード管理へ追加するには明示的なsection対応が必要。

新設が必要なのは差分比較・部分確定・下書き管理・ゴミ箱・期限切れ救出・手動対応付け。これらは既存の単純な候補選択／生成履歴では表現できない。

現行actorFormDialogは90dvh上限（L249）。今回の75～85dvh案を流用時に限定CSSで調整する。小さい画面では既存navが36px高、通常nav42px高であり「現行全ボタン44px」とは言えない。新規操作は44px以上を目標にする。

## 5. 保存契約と旧版の実測

現行root JSON v4、actorExtensions v4、adult v1、humanProfile v1、actorFormCatalog v1。namespaceは`creature-adult-v1/result-access-v1/motif-person-v1`（L1252）。5キーはL1254。afCheckBundleはsettings.version4、working.version2、history.version2を検証する。

Chromiumで現行関数を実行した結果：

| 試験 | 実測 |
|---|---|
| normalizeMangaへmangaId追加 | 保持しない |
| panel.id追加 | 保持しない |
| panel.horror追加 | 保持しない |
| panel.people[id].horror追加 | spreadにより保持する。ただし機能接続はない |
| panel.creatures[id].horror追加 | 保持しない |
| working.horror追加→restoreWorking→captureWorking | 保持しない |

「未知fieldが一部残る」ことを互換性保証としない。新JSONを現行版へ渡すと怪異情報を落として再保存する危険がある。namespace分離と明示的なJSON version判定を推奨する（B/C参照）。

## 6. 漫画・簡易漫画・成人向けの境界

通常漫画は最大6コマ。コマ数変更はactive countの変更で、明示的な挿入・削除・並び替え機能はない。今回要求のID管理は新設基盤である。画像合成composeImagesも番号連動なので、並び替えを怪異設定だけへ適用してはいけない。通常漫画は通常画像のjoinSubjectPromptBlocksをそのまま使用する構造ではない。3分離モードの設定が存在しても、通常画像と同じBREAK文法を漫画に追加する理由にはしない。

簡易漫画は`simpleMangaIntegration`（L7253～8878）のShadow DOM内に独立state S.simple、独立保存・snapshot・生成がある。simpleOnlySnapshot L8111はメインmangaStateを使わない。通常漫画への接続が簡易漫画へ自動的に届くことはない。今回の必須漫画連携は通常漫画を推奨し、簡易漫画は回帰保護。追加対応は要確認。

成人向け機構は対象外。Creature信頼定義0件、motif成人拒否、共有設定／相手参照、結果provenanceを維持。怪異の人型化や原作形態の変更から資格を付与しない。成人ストーリーでのCreature除外等の既存条件も緩和しない。

## 7. 調査中に実行した検証

実ブラウザエンジン：Chrome for Testing Headless 154.0.8037.92＋Playwright。ローカルHTTP、隔離context、SW block（R1）。製品・既存テストは変更せず、browser実行path等のみリポジトリ外adapterで調整した。actorExtensions v3→v4のassert対応はmainに存在する既存R1 wrapperを使用。

- R1 49契約PASS、matrix checks 865。通常210／漫画210／コマ420の全文一致。
- 12dataset deep comparison／fingerprint、固定fixture SHA検証PASS。生成配列SHA-256：`7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d`。
- Character1390、人物基本外見1384、species94、Creature基本外見60、features275、Creature候補500、共通adapter1444。
- 13inline scripts＋SW構文、UTF-8/CRLF確認PASS（既存固定比較テスト）。
- 現行画面の6viewport（360/393/430×640/800）で文書横はみ出しなし、ページ例外なし。怪異タブは未作成なので、そのUIがPASSしたという意味ではない。

PWAはSWソースと既存試験資産を読んだ。今回オフライン・旧タブ共存・公開配信・実機スマホの試験は再実行していない。将来の怪異機能、下書き、ゴミ箱、migrationは未実装・未検証。

## 8. PWA

[sw.js](https://github.com/tomoya19991028-cmyk/seaart-tool/blob/5b5bb03589dcc9a661402395d6c3db20cfd4cf52/sw.js)のcache名は`seaart-tool-pwa-v4-motif-person-v1-http-cache-v1`。installでshellをまとめて保存し、HTMLはcache:'reload'、失敗時新cache削除。activateで旧cache削除・clients.claim、navigate／HTMLはnetwork-first、失敗時index cacheを使う。localStorageの保存移行とは別機構。

旧タブは新SWが有効でも旧JSを実行し得る。SW更新だけで旧HTMLのwriterを停止できない。新namespaceへ旧版を戻さないことが必要。公開時だけcache名・更新検出・旧タブ共存を検証する。今回sw.js／manifestは変更しない。
