#!/usr/bin/env python3
"""Reproduce the integrated HTML in an explicitly selected output file."""
from pathlib import Path
import os,subprocess,sys
root=Path(__file__).resolve().parent.parent
target=os.environ.get('HORROR_BUILD_HTML')
if not target:
    raise SystemExit('Set HORROR_BUILD_HTML to an isolated output path')
p=Path(target).resolve()
if p==root/'index.html':
    raise SystemExit('Use an isolated path; compare bytes before updating the product')
if p.exists():
    raise SystemExit('Output already exists; preserve prior build records')
p.parent.mkdir(parents=True,exist_ok=True)
p.write_bytes(subprocess.check_output(['git','show','5b5bb03589dcc9a661402395d6c3db20cfd4cf52:index.html'],cwd=root))
env={**os.environ,'HORROR_BUILD_HTML':str(p)}
for script in ['embed-motif-person.py','integrate-horror.py','embed-horror.py']:
    subprocess.run([sys.executable,str(root/'scripts'/script)],env=env,cwd=root,check=True)
print(p)
