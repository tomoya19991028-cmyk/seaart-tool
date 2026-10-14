#!/usr/bin/env python3
"""Build phase one from the protected, verified forms branch into a new file."""
from pathlib import Path
import json, os, subprocess, sys

root = Path(__file__).resolve().parent.parent
if len(sys.argv) != 2:
    raise SystemExit('Usage: build-tg-yugioh-phase1.py NEW_OUTPUT_HTML')
target = Path(sys.argv[1]).resolve()
if target.exists() or target == root / 'index.html':
    raise SystemExit('Use a new isolated output path')
base = json.loads((root / 'src/tg-yugioh-core-edits.json').read_text())['base']
target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes(subprocess.check_output(['git', 'show', base + ':index.html'], cwd=root))
env = {**os.environ, 'HORROR_BUILD_HTML': str(target)}
for script in ['embed-horror.py', 'embed-tg-yugioh-phase1.py']:
    subprocess.run([sys.executable, str(root / 'scripts' / script)], cwd=root, env=env, check=True)
print(target)
