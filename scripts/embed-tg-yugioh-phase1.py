#!/usr/bin/env python3
"""Apply the reviewed phase-one core edits without changing existing CRLF bytes."""
from pathlib import Path
import json, os

root = Path(__file__).resolve().parent.parent
target = Path(os.environ.get('HORROR_BUILD_HTML', str(root / 'index.html')))
data = target.read_bytes()
for before, after in json.loads((root / 'src/tg-yugioh-core-edits.json').read_text())['edits']:
    old = before.replace('\n', '\r\n').encode()
    new = after.replace('\n', '\r\n').encode()
    if new in data:
        continue
    if data.count(old) != 1:
        raise SystemExit('Core edit anchor must occur exactly once: ' + before[:100])
    data = data.replace(old, new, 1)
target.write_bytes(data)
