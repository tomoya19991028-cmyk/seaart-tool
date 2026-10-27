#!/usr/bin/env python3
"""Reproduce current v44 from reviewed sources; never read index.html as build input."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
class InlineScripts(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=False);self.text=text;self.rows=[];self.start=None;self.lines=[0]+[i+1 for i,c in enumerate(text)if c=='\n']
 def pos(self):line,column=self.getpos();return self.lines[line-1]+column
 def handle_starttag(self,tag,attrs):
  if tag=='script':self.start=self.pos()+len(self.get_starttag_text())
 def handle_endtag(self,tag):
  if tag=='script'and self.start is not None:self.rows.append(self.text[self.start:self.pos()]);self.start=None

def build():
 manifest=json.loads((ROOT/'src/current/manifest.json').read_text());revision=manifest['baselineCommit'];cache={}
 def original(path):
  if path not in cache:
   try:cache[path]=subprocess.check_output(['git','show',revision+':'+path],cwd=ROOT)
   except subprocess.CalledProcessError as e:raise RuntimeError('Protected baseline is missing; fetch the documented baseline commit first')from e
  return cache[path]
 baseline=original('index.html');assert hashlib.sha256(baseline).hexdigest()==manifest['baselineHTMLSHA256'],'Baseline HTML SHA mismatch'
 parser=InlineScripts(baseline.decode('utf-8').replace('\r\n','\n'));parser.feed(parser.text)
 edits=json.loads((ROOT/'src/current/script-edits.json').read_text());blocks=[]
 for index,entry in enumerate(manifest['scripts']):
  if 'source'in entry or 'sources'in entry:
   body='\n'.join((ROOT/source).read_text()for source in entry.get('sources',[entry.get('source')]));body=body[:-1]if entry.get('trimFinalNewline')and body.endswith('\n')else body;body=entry.get('prefix','')+body+entry.get('suffix','')
  else:
   lines=parser.rows[entry['baselineScript']].splitlines(keepends=True)
   for edit in reversed(edits.get(str(index),[])):
    start,end=edit['startLine'],edit['endLine'];assert hashlib.sha256(''.join(lines[start:end]).encode()).hexdigest()==edit['oldSHA256'],f'Base context mismatch in script {index}'
    lines[start:end]=[edit['replacement']]
   body=''.join(lines)
  if entry.get('prependSources'):
   body='\n'.join((ROOT/source).read_text()for source in entry['prependSources'])+'\n'+body
  blocks.append(body)
 for source in manifest['managedJS']:
  old=original(source).decode().replace('\r\n','\n').strip();new=(ROOT/source).read_text().strip();hits=sum(b.count(old)for b in blocks);assert hits==1,f'Managed source span missing/duplicated: {source}'
  blocks=[b.replace(old,new)for b in blocks]
 for source in manifest['managedJSON']:
  encode=lambda value:json.dumps(value,ensure_ascii=False,separators=(',',':'))
  old=encode(json.loads(original(source)));new=encode(json.loads((ROOT/source).read_text()));hits=sum(b.count(old)for b in blocks);assert hits==1,f'Managed JSON span missing/duplicated: {source}'
  blocks=[b.replace(old,new)for b in blocks]
 template=(ROOT/manifest['template']).read_text()
 for i,body in enumerate(blocks):
  token=f'@@SEAART_SCRIPT_{i:02d}@@';assert template.count(token)==1,f'Template slot {i} missing/duplicated';template=template.replace(token,body,1)
 assert '@@SEAART_SCRIPT_'not in template,'Unresolved template slot'
 parsed=InlineScripts(template);parsed.feed(template);assert len(parsed.rows)==len(blocks),'Unexpected script boundary'
 return template.encode('utf-8')

if __name__=='__main__':
 content=build()
 if sys.argv[1:]==['--check']:
  assert content==(ROOT/'index.html').read_bytes(),'index.html differs from maintained sources; build to a new output and review the diff'
  print('Exact build SHA-256',hashlib.sha256(content).hexdigest())
 elif len(sys.argv)==2:
  output=Path(sys.argv[1]).resolve();assert output!=ROOT/'index.html'and not output.exists(),'Use a new isolated output path; review before updating index.html'
  output.parent.mkdir(parents=True,exist_ok=True);output.write_bytes(content);print(output,hashlib.sha256(content).hexdigest())
 else:raise SystemExit('Usage: build-current.py --check | NEW_OUTPUT_HTML')
