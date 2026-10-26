# 旧41ジョブとの対応

原41ジョブの27 PASS／13 FAIL／1 SKIPを保持し、今回の実行範囲を分けた表です。各旧FAILの原assert・分類は追補報告とoriginal-failures-and-skip.jsonを参照。最終commitでの一括実行はPR最新CIを正とします。

| 旧ジョブ | 旧結果 | 今回の範囲・結果 |
| --- | --- | --- |
| auto-compatibility | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| auto-contracts | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| auto-fixed | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| auto-inherited | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| auto-pwa | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| auto-shared-prompt | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| auto-shared-ui | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| auto-ui | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| boundaries | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| card-contracts | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| card-persistence | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| card-pwa | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| card-ui | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| combined-pwa | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| combined-ui | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| contracts | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| edges | PASS | I08/I09/I10/I11/I12/I28の6件を再実行PASS。元36件全部の再実行ではない |
| faults | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| integration | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| legacy | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| motif | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| motif-boundaries | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| motif-prompts | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| normal-contracts | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| normal-pwa | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| normal-ui | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| prompts | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| pwa | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| pwa-regression | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| r1 | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| round2-retest | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| story-contracts | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| story-pwa | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| story-ui | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| ui | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| ui-extra | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| unified-compatibility | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| unified-contracts | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| unified-pwa | FAIL | 現行向けジョブPASS（旧FAILは保持） |
| unified-ui | PASS | 前回PASSを保持。今回その元ジョブ全件は再実行していない |
| fixed | SKIP | 独立FIXEDケースPASS（補助16の内数） |
