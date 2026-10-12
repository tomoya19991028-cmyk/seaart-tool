#!/usr/bin/env python3
"""Embed reviewed sources without rewriting existing CRLF or catalog data."""
from pathlib import Path
import json,re,os
root=Path(__file__).resolve().parent.parent
p=Path(os.environ.get('HORROR_BUILD_HTML',str(root/'index.html')))
b=p.read_bytes()
def block(name,source):
    global b
    start=f'// BEGIN HORROR {name}\r\n'.encode();end=f'// END HORROR {name}\r\n'.encode()
    payload=start+source.replace('\r\n','\n').replace('\n','\r\n').encode()+b'\r\n'+end
    if start in b:
        left=b.index(start);right=b.index(end,left)+len(end);b=b[:left]+payload+b[right:]
    elif name=='FOUNDATION':
        anchor=b"const actorFormMotifNamespace=" if b"const actorFormMotifNamespace=" in b else b"const actorFormStorageNamespace=";offset=b.index(anchor);b=b[:offset]+payload+b[offset:]
    else:
        anchor=b'</body>';offset=b.rindex(anchor);b=b[:offset]+b'<script>\r\n'+payload+b'</script>\r\n'+b[offset:]
block('FOUNDATION',(root/'src/horror-foundation.js').read_text())
runtime=root/'src/horror-runtime.js'
if runtime.exists():
    catalog=json.loads((root/'src/horror-catalog.json').read_text())
    text=b.decode();start=text.index('function generateManga(){');end=text.index('const generateMangaBeforeStory=',start)
    producer=text[start:end].replace('function generateManga(){','function hGenerateManga(){',1)
    producer=producer.replace('const panel=mangaState.panels[i],context=',"const panel=mangaState.panels[i];hMangaPanelContext(panel);const context=",1)
    producer=producer.replace("parts.push(...presentActors.filter(a=>a.kind==='character')","parts.push(...hMangaPanelTags(panel,presentActors));\n  parts.push(...presentActors.filter(a=>a.kind==='character')",1)
    producer=producer.replace('...present.map(p=>identities[people.indexOf(p)])','...present.map(p=>hPanelPersonIdentity(p,identities[people.indexOf(p)],panel))',1)
    producer=producer.replace('...presentCreatures.map(mangaCreatureIdentity)','...presentCreatures.map(c=>hPanelCreatureIdentity(c,panel))',1)
    producer=producer.replace('const hasLettering=', 'hMangaPanelContext(null);\n const hasLettering=',1)
    block('RUNTIME','const horrorInitialCatalog='+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\n'+producer+'\n'+runtime.read_text())
normal_ui=root/'src/horror-normal-ui.js'
if normal_ui.exists():
    block('NORMAL_UI',normal_ui.read_text())
card_tags=root/'src/horror-card-tags.js'
if card_tags.exists():
    block('CARD_TAGS',card_tags.read_text())
p.write_bytes(b)
