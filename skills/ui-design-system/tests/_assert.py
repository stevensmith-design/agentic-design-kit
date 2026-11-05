import sys, json
manifest, base, jsonfile = sys.argv[1], sys.argv[2], sys.argv[3]
want=None
try:
    for ln in open(manifest):
        if ln.startswith('#') or not ln.strip(): continue
        p=ln.rstrip('\n').split('\t')
        if p[0]==base: want=(p[1],p[2]); break
except FileNotFoundError:
    pass
if not want:
    print("UNSPECIFIED"); sys.exit(0)
data=json.load(open(jsonfile))
got={i['check']: i['level'] for i in data['items']}
chk,lvl=want
print("OK" if got.get(chk)==lvl else f"want {chk}={lvl}, got {chk}={got.get(chk,'(absent)')}")
