import json,re,pathlib
root=pathlib.Path(__file__).resolve().parent
rows=[]
for file in sorted(root.glob('cj-open-batch-*.json')):
    raw=json.loads(file.read_text(encoding='utf-8'))['result']
    for section in raw.split('\n--------------------------------------------------------------------------------\n'):
        url=re.search(r'^.*?\((https://(?:www\.)?cjdropshipping\.com/product/[^\s)]+)\)',section)
        ref=re.search(r'cite([^]+)',section)
        if not url or not ref: continue
        lines=[re.sub(r'^L\d+: ?', '',x) for x in section.splitlines()]
        body='\n'.join(lines)
        name=re.search(r'^# (.+)',body,re.M)
        if not name: continue
        images=[]
        for m in re.finditer(r'【(\d+)†Image†((?:cf|oss-cf)\.cjdropshipping\.com|cc-west-usa\.oss-accelerate\.aliyuncs\.com)】',body):
            if int(m[1]) not in images:images.append(int(m[1]))
        rows.append({'url':url[1],'ref':ref[1],'name':name[1],'body':body,'imageRefs':images})
ids=set();unique=[]
for row in rows:
    pid=row['url'].rsplit('-p-',1)[-1].removesuffix('.html')
    if pid in ids:continue
    ids.add(pid);row['pid']=pid;unique.append(row)
(root/'cj-parsed-pages.json').write_text(json.dumps(unique,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{'id':p['pid'],'name':p['name'],'images':len(p['imageRefs'])} for p in unique],ensure_ascii=False,indent=2))
