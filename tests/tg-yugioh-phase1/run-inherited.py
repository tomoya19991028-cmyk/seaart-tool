#!/usr/bin/env python3
"""Run original 41 jobs, changing only the wrapper path in memory; originals stay immutable."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'forms-environment/run-regressions.py'
s=p.read_text().replace('tests/forms-environment/replay.cjs','tests/tg-yugioh-phase1/replay.cjs')
s=s.replace("if x.get('wrapperSHA256') and x['wrapperSHA256']!=sha(repo/'tests/tg-yugioh-phase1/replay.cjs'):continue", "if x.get('wrapperSHA256') and x['wrapperSHA256']!=sha(repo/'tests/tg-yugioh-phase1/replay.cjs') and (name in {'r1','legacy'} or x['wrapperSHA256']!=sha(repo/'tests/tg-yugioh-phase1/replay-before-gender.cjs')):continue")
s=s.replace('sha=lambda p:', "jobs.sort(key=lambda job:0 if job[0] in {'r1','legacy','unified-compatibility'} else 1)\nsha=lambda p:")
s=s.replace('jobs.sort(key=', "wrapper.add('boundaries')\ndef phase1_wrapper(name):return 'tests/tg-yugioh-phase1/route.cjs' if name=='boundaries' else 'tests/tg-yugioh-phase1/replay.cjs'\njobs.sort(key=")
s=s.replace("['tests/tg-yugioh-phase1/replay.cjs'] if name in wrapper", "[phase1_wrapper(name)] if name in wrapper")
s=s.replace("sha(repo/'tests/tg-yugioh-phase1/replay.cjs')", "sha(repo/phase1_wrapper(name))")
exec(compile(s,str(p),'exec'),{'__file__':str(p),'__name__':'__main__'})
