#!/usr/bin/env python3
"""Embed the reviewed round-2 source before horror runtime installation."""
from pathlib import Path
import os,re
root=Path(__file__).resolve().parent.parent
p=Path(os.environ.get('HORROR_BUILD_HTML',str(root/'index.html')))
data=p.read_bytes()
pattern=rb'(<script id="creatureMotifIndependentPerson">\r\n)(.*?)(</script>)'
if len(re.findall(pattern,data,re.S))!=1:
    raise RuntimeError('Expected exactly one motif-person script')
source=((root/'src/creature-motif-person.js').read_text().replace('\r\n','\n').rstrip('\n')+'\n\n').replace('\n','\r\n').encode()
p.write_bytes(re.sub(pattern,lambda m:m[1]+source+m[3],data,count=1,flags=re.S))
