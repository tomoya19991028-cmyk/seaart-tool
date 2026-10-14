#!/usr/bin/env python3
from pathlib import Path
import subprocess,json,hashlib,re,sys,tempfile
repo=Path(__file__).resolve().parents[2];out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=False);base='3fd1bb9fc34be09d85e3eef71cc1f6122f9054b8';old=lambda f:subprocess.check_output(['git','show',base+':'+f],cwd=repo);rows=[]
def check(id,fn):
 try:assert fn();rows.append({'id':id,'passed':True})
 except Exception as e:rows.append({'id':id,'passed':False,'error':str(e)})
check('Q01',lambda:all((repo/p).read_bytes()==old(p) for p in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'tests'],cwd=repo,text=True).splitlines()))
for i,p in enumerate(['src/horror-catalog.json','src/horror-story-presets.json','src/horror-story-presets.js','src/horror-auto-definitions.json','src/environment-additions.json','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png'],2):check(f'Q{i:02}',lambda p=p:(repo/p).read_bytes()==old(p))
check('Q11',lambda:(repo/'sw.js').read_bytes()==old('sw.js').replace(b'seaart-tool-pwa-v5-forms-structures-environment-ui-v1-http-cache-v1',b'seaart-tool-pwa-v5-tg-yugioh-phase1-v1-http-cache-v1'))
f=json.loads((repo/'src/person-specific-forms.json').read_text());b=json.loads(old('src/person-specific-forms.json'));tg=json.loads((repo/'src/tokyo-ghoul-phase1.json').read_text())
check('Q12',lambda:f['forms'][:11]==b['forms'] and len(f['forms'])==19 and len({(x['owner'],x['id']) for x in f['forms']})==19)
check('Q13',lambda:f['candidates'][:len(b['candidates'])]==b['candidates'] and len({(x['source'],x['value']) for x in f['candidates']})==len(f['candidates']))
check('Q14',lambda:len(tg['characters'])==15 and len({r['id'] for r in tg['characters']})==15 and all(r['group']=='東京喰種' for r in tg['characters']))
h=(repo/'index.html').read_bytes();oh=old('index.html')
check('Q15',lambda:not re.search(rb'(?<!\r)\n',h) and h.decode('utf8').encode('utf8')==h)
def generators():
 for start,end in [('function generate(){','const adultEditorGroups='),('function generateManga(){','const generateMangaBeforeStory=')]:
  extract=lambda v:v[v.index(start.encode()):v.index(end.encode(),v.index(start.encode()))]
  assert extract(h)==extract(oh)
 return True
check('Q16',generators)
def syntax():
 for p in [*(repo/'src').glob('*.js'),repo/'sw.js']:subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
 for i,part in enumerate(re.findall(rb'<script\b[^>]*>([\s\S]*?)</script>',h)):
  if not part.strip():continue
  p=out/f'inline-{i}.js';p.write_bytes(part);subprocess.run(['node','--check',str(p)],check=True,capture_output=True);p.unlink()
 return True
check('Q17',syntax)
check('Q18',lambda:all(s in h for s in [b'seaart-prompt-builder-v5-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1',b'SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1']))
def reproduce():
 with tempfile.TemporaryDirectory() as d:
  p=Path(d)/'index.html';subprocess.run(['python','scripts/build-tg-yugioh-phase1.py',str(p)],cwd=repo,check=True,capture_output=True);assert p.read_bytes()==h
 return True
check('Q19',reproduce)
check('Q20',lambda:all(x['id']=='kakugan' and set(x)<=set(['owner','id','name','eyes','eyesRight','eyeMode','detail']) and set(x['detail'])=={'eyeDetail'} for x in f['forms'][11:]))
baseline_values=json.loads((repo/'tests/tg-yugioh-phase1/baseline-existing-values.json').read_text())
check('Q21',lambda:all(c['value'] not in baseline_values.get(c['source'],[]) for c in f['candidates'][len(b['candidates']):]))
v={'tests':rows,'productSHA256':hashlib.sha256(h).hexdigest(),'physicalDevice':False};(out/'results.json').write_text(json.dumps(v,indent=2));print(json.dumps(v,indent=2));sys.exit(not all(x['passed'] for x in rows))
