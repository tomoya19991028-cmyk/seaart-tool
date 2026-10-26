#!/usr/bin/env python3
"""Create a review artifact only. No deploy, storage access, or product rewriting."""
from pathlib import Path
import hashlib,json,subprocess,sys,zipfile
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve();assert not out.exists(),'Use a fresh artifact directory';out.mkdir(parents=True)
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip()
source=root/'index.html';html=source.read_bytes();name='SeaArt_v44_Audited_Android_Check.html';(out/name).write_bytes(html)
files=['index.html','sw.js','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png']
manifest={'sourceCommit':commit,'androidHTML':{'filename':name,'bytes':len(html),'sha256':hashlib.sha256(html).hexdigest()},'assets':{n:{'bytes':(root/n).stat().st_size,'sha256':hashlib.sha256((root/n).read_bytes()).hexdigest()}for n in files},'AndroidTested':False,'published':False}
(out/'SHA256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
readme='''SeaArt v44 Android確認用（未公開）
最初に現在利用中の画面から設定JSONを書き出し、画像・下書き・未保存編集も別に保護してください。
HTMLのコピーは端末データのバックアップではありません。

SeaArt_v44_Audited_Android_Check.html は最終製品index.htmlと同一バイトです。
HTMLを展開してブラウザで開いて確認します。file://の対応・保存領域は端末に依存します。
PWA_assets/ は同じcommitの6資産です。展開したHTMLの直開きはHTTPSのPWA更新・オフライン試験と同じではありません。
新しいホストの公開は行っていません。main・公開PWA・Sitesは未変更です。
GitHub PWA・Sites・ダウンロードHTML・簡易漫画UIのデータは自動転送されません。
簡易漫画は専用キー seaart-studio-mobile-v2 と専用JSONを使用します。
画像合成の元画像と配置はセッション専用です。必要な元画像・合成PNGを別に保存してください。
新しい構造化ポーズ付き人型Creatureのデータは旧mainで拒否され得ます。コード復旧とデータ復旧は別工程です。

短い確認表は同梱のAndroid確認.mdを参照。Android実機・実IME・SeaArt/PixAIの実画像は未確認です。
'''
(out/'README.txt').write_text(readme)
check=root/'docs/v44-audit/CHECKLIST_v44_Android確認.md'
(out/'Android確認.md').write_bytes(check.read_bytes())
with zipfile.ZipFile(out/'SeaArt_v44_Android_Check_PWA_assets.zip','w',compression=zipfile.ZIP_DEFLATED)as z:
 for n in [name,'README.txt','SHA256.json','Android確認.md']:z.write(out/n,n)
 for n in files:z.write(root/n,'PWA_assets/'+n)
assert (out/name).read_bytes()==source.read_bytes()
print(json.dumps(manifest,ensure_ascii=False))
