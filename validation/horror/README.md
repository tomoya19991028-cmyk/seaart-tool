# 怪異タブ検証資料

製品commit `6673f871caa8c9611137629d4cd13b7bfc77f8d1`。ローカル隔離Chromiumの結果。実機／公開originは未検証。T01〜T30の対応はT01-T30.json、個別assertionは各JSON、全文はgzipに保存する。gzipは `gzip -dc r1-fulltext.json.gz` 等で展開できる。

元の既存テストと固定fixtureは変更していない。基点からの再生成、14 inline scripts＋SW構文、UTF-8／CRLF、元のgenerate／generateManga body一致はfixed-comparison.json。artifact-manifest.jsonは保存資料のSHA-256、product-identity.jsonは製品・source・既存50テストのSHA-256。

R1とNative・第1回の回帰は全文比較。最終の変更前一括固定・削除Undoもcontracts.jsonに含む。faults.jsonはRAM／disk／Undo rollbackとjournal救済14ケース、boundaries.jsonは読込中guard／実import／1000項目保存とreload等20項目。失敗原本は別試行ディレクトリで保護し、重要なものをfailures/へ複製した。

再実行手順：[tests/horror/README.md](../../tests/horror/README.md)。
