from pathlib import Path
import json,subprocess,hashlib,re,sys
repo=Path(__file__).resolve().parents[2];root=Path(sys.argv[1]);root.mkdir(parents=True,exist_ok=False);base='7b16f4914372131f4f93677bf645b41e40f07258';sha=lambda b:hashlib.sha256(b).hexdigest();old=lambda f:subprocess.check_output(['git','show',base+':'+f],cwd=repo);tests=[]
def check(id,fn):
 try:v=fn();tests.append({'id':id,'passed':True,'detail':v})
 except Exception as e:tests.append({'id':id,'passed':False,'error':str(e)})
def need(v,msg='check failed'):
 assert v,msg
 return True
check('Q01',lambda:need(all((repo/f).read_bytes()==old(f) for f in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'tests'],cwd=repo,text=True).splitlines()),'old tests or fixtures changed'))
for id,f in [('Q02','src/horror-catalog.json'),('Q03','src/horror-story-presets.json'),('Q04','src/horror-story-presets.js')]:check(id,lambda f=f:need((repo/f).read_bytes()==old(f),f))
cache='seaart-tool-pwa-v5-forms-structures-environment-ui-v1-http-cache-v1'
check('Q05',lambda:need((repo/'sw.js').read_bytes()==old('sw.js').replace(b'seaart-tool-pwa-v5-horror-auto-mobile-ui-v1-http-cache-v1',cache.encode()),'SW change exceeds cache name'))
for id,f in [('Q06','manifest.json'),('Q07','icon-192.png'),('Q08','icon-512.png'),('Q09','icon-maskable-512.png')]:check(id,lambda f=f:need((repo/f).read_bytes()==old(f),f))
a=json.loads((repo/'src/horror-auto-definitions.json').read_text());o=json.loads(old('src/horror-auto-definitions.json'))
check('Q10',lambda:need(all({k:v for k,v in t.items() if k!='structures'}=={k:v for k,v in u.items() if k!='structures'} and all(t['structures'][p]==u['structures'][p] for p in ['wings','horns','tail']) for t,u in zip(a['types'],o['types'])),'old auto definitions changed'))
check('Q11',lambda:need(len(a['types'])==6 and all(set(t['structures'])==set(['wings','horns','tail','tentacles','extraArms','extraLegs']) for t in a['types']) and len(set(t['structures'][p][s] for t in a['types'] for p in t['structures'] for s in ['partial','complete']))==72,'six type/six structure matrix'))
f=json.loads((repo/'src/person-specific-forms.json').read_text());e=json.loads((repo/'src/environment-additions.json').read_text())
check('Q12',lambda:need(len(f['forms'])==11 and len(set((r['owner'],r['id']) for r in f['forms']))==11 and len(set(r['owner'] for r in f['forms']))==3,'confirmed form count'))
check('Q13',lambda:need(len(set((c['source'],c['value']) for c in f['candidates']))==len(f['candidates']) and all(c['name'] and c['value'] for c in f['candidates']),'candidate uniqueness by source'))
check('Q14',lambda:need(len(e['places'])==44 and len(e['states'])==48 and len(set(x['id'] for x in e['places']+e['states']))==92 and len(set(x['value'] for x in e['places']+e['states']))==92,'environment counts/IDs/tags'))
h=(repo/'index.html').read_bytes();oh=old('index.html')
check('Q15',lambda:need(re.search(rb'const itemColorPalette=.*?;\r\n',h).group()==re.search(rb'const itemColorPalette=.*?;\r\n',oh).group(),'shared palette changed'))
check('Q16',lambda:need(not re.search(rb'(?<!\r)\n',h) and h.decode('utf8').encode('utf8')==h,'HTML encoding'))
def generators():
 for begin,end in [('function generate(){','const adultEditorGroups='),('function generateManga(){','const generateMangaBeforeStory=')]:
  def extract(v):a=v.index(begin.encode());return v[a:v.index(end.encode(),a)]
  need(extract(h)==extract(oh),'raw generator body changed')
 return True
check('Q17',generators)
def syntax():
 for p in (repo/'src').glob('*.js'):subprocess.run(['node','--check',str(p)],cwd=repo,check=True,capture_output=True)
 subprocess.run(['node','--check','sw.js'],cwd=repo,check=True,capture_output=True)
 return True
check('Q18',syntax)
check('Q19',lambda:need(all(b in h for b in [b'seaart-prompt-builder-v5-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1',b'SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1']), 'namespace changed'))
(root/'results.json').write_text(json.dumps({'tests':tests,'productSHA256':sha(h),'physicalDevice':False},indent=2));print('quality',sum(t['passed'] for t in tests),'/',len(tests));sys.exit(0 if all(t['passed'] for t in tests) else 1)
