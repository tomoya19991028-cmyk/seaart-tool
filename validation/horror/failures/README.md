# 失敗記録と修正

元の失敗記録は `/workspace/seaart-horror-validation/` の各試行ディレクトリに残している。再実行は別ディレクトリへ出力した。既存テスト原本50ファイル・固定expectedはbytes不変。以下は必要な記録を複製したもの。

| 記録 | 原因と修正 | 再検証 |
| --- | --- | --- |
| transient-scope-before-fix.json | 複数人物の通常生成で一時演出が落ちる。対象blockへ追加するよう修正 | T23の42構成 |
| fixed-on-before-fix.json | 固定ONが基本強度に追従。固定時の実強度を保存 | T06/T08 |
| undo-limit-fixture-failure.json | 新規T08試験がsession内10件上限を考慮していない。新規assertionだけ修正 | T08の4変更と全文比較 |
| import-overlap-before-fix.json.gz | 新規試験がasync JSON読込の完了前に次の編集へ進んだ。読込中の保存skip経路も判明。試験で完了を待ち、製品で読込中編集を拒否 | 3読込guard、実キャンセル、1000項目のreload一致 |
| deletion-undo-before-fix.json | 削除Undoが削除前snapshotへ戻り30日履歴を消す。履歴を保持し復活は新incarnation／明示復元logへ | T12：期限切れ拒否も検証 |

一括固定は旧状態／構造／元特徴のpolicyも保存するよう補正し、T08で4種類の変更前後全文とreceipt Undoを比較した。タグを出さない内部metadata `horror-meta-facets` は状態等だけを固定する。承認された正の候補12件には数えず、追加の英語タグは生成しない。
