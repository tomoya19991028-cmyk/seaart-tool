# 回収第2回HTMLに対する既存回帰の再実行手順

この手順は今回利用可能だった既存試験の再現用である。未回収の第2回新規テスト3件とtests/README-creature-motif-person-integration2.mdを復元したものではなく、main統合・公開を許可する完全な試験手順でもない。

対象コード保存commit：f6326a9ced70ea5abdf281f3c6b942caad9e6f90。HTML SHA-256：a4ba6a92c90bcceab8117fc9406447f7fdd5802469ae9a7afa7f172f35a1e431。

環境：Chromium 154.0.8037.57、Playwright 1.62.1、Node v24.19.0、Noto Sans CJK JP。既存テストのrequire('playwright')を解決できる環境を使う。ブラウザは/usr/bin/chromium。実機・公開URLの試験ではない。

## HTTP fixturesの準備

既存試験に固定されたURLをそのまま使うため、次の別パスを用意する。回収HTMLを旧ファイルで上書きしない。

| パス | 内容 |
| --- | --- |
| /workspace/seaart-tool | 第2回回収HTMLを含む専用ブランチ |
| /workspace/seaart-creature-motif-person | 上記repoを指すsymlink |
| /workspace/seaart-creature-motif-integration1/baseline | main基点5b5bb03589dcc9a661402395d6c3db20cfd4cf52の製品6ファイル |
| /workspace/seaart-r1-save-worktree | 元R1保存commit326b4e482f17d4bd94605696ed2e3fdda30b43d0の製品6ファイル |

製品6ファイルはindex.html、sw.js、manifest.json、icon-192.png、icon-512.png、icon-maskable-512.png。各commitのgit showで別の空ディレクトリへ書き出し、読取専用にする。既存パスに成果物がある場合は上書きせず保護する。元R1／固定fixture／テスト原本を編集しない。

別プロセスで `python -m http.server 8765 --bind 127.0.0.1 --directory /workspace` を起動。PWA試験は自身で127.0.0.1:8782を使うので競合を避ける。

## 既存試験の実行

未使用の外部ディレクトリを `REPLAY_ROOT` に設定し、試験ごとに出力先を分ける。今回の出力先は/workspace/seaart-artifact-recovery-20261011T112758Z/revalidationだった。元の検証記録の上に再実行しない。

作業ディレクトリは/workspace/seaart-tool。共通環境は次のとおり。

```sh
export TARGET_URL=http://127.0.0.1:8765/seaart-tool/index.html
export LEGACY_URL=http://127.0.0.1:8765/seaart-r1-save-worktree/index.html
export BASELINE_URL=http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html
export CHROMIUM_PATH=/usr/bin/chromium
```

各試験について `RESULT_DIR` に以下の出力先を指定し、mkdirで作成してからnodeで実行する。stdout、stderr、exit codeを別ファイルに保持する。いずれかが非0なら原因を調査し、初回失敗記録を消さない。

| nodeで実行するテスト | RESULT_DIR |
| --- | --- |
| tests/creature-motif-person.cjs | $REPLAY_ROOT/feature |
| tests/creature-motif-person-boundaries.cjs | $REPLAY_ROOT/boundaries |
| tests/creature-motif-person-legacy-regression.cjs | $REPLAY_ROOT/legacy-regression |
| tests/creature-motif-person-ui.cjs | $REPLAY_ROOT/ui |
| tests/creature-motif-person-pwa.cjs | $REPLAY_ROOT/pwa |
| tests/creature-motif-person-r1.cjs | $REPLAY_ROOT/final-r1 |

R1完了後、$REPLAY_ROOT/baseline/index.htmlに上記main基点の読取専用HTMLを用意し、`RESULT_DIR=$REPLAY_ROOT node tests/creature-motif-person-fixed-baseline.cjs` を実行する。固定fixtureはtests/fixtures/creature-motif-person-r1-original-baseline.json.gzをそのまま使う。元のexpectedは生成・更新しない。creature-motif-person-r1.cjsは元R1テストを変更せず既存承認済みschema assertionをメモリ上でv4に適用する既存wrapperである。

診断用creature-motif-person-save-boundary.cjsは古いHTMLの拒否不備を再現するテストであり、今回の移行8ケースはcreature-motif-person.cjs内のmigrationで実行する。診断テストを現HTMLに向けて移行PASSと解釈しない。

構文はHTML内13スクリプトとSWをNode vm.Scriptで解析し、UTF-8の往復一致とCRLFを確認する。新規第2回テストの構文は原本が届くまで確認できない。

## 結果の意味と制約

第1回36契約／作成障害8／保存移行8／追加境界20、R1 49契約／865 assertionsと固定全文210／210／420、12dataset、Native252／252、既存人物成人21、第1回6viewport、簡易漫画、旧R1→現SWの9ケースを検証する。第2回の48契約・再取込み障害7・拡張外見の21／21／42・再取込みを含む6viewportはこの手順に含まれない。

PWA原本は旧cache名と現cache名を固定している。公開用SWのcache名更新を行った後の試験とは別で、既存テスト原本を無断で変更して通さない。第1回→第2回の更新試験と公開URLの受入が別途必要。

今回の観測全文はrecords内のgzipに保存している。これらはexpected baselineではない。元のJSONや失敗観測は外部出力先に保持している。
