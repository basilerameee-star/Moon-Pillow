import concurrent.futures,hashlib,json,pathlib,urllib.request,time
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent
ASSETS=ROOT/'cj-expanded-assets'
manifest=json.loads((ASSETS/'manifest.json').read_text(encoding='utf-8'))
def download(row):
    out=dict(row);p=pathlib.Path(row['localpath'])
    try:
        if not p.exists():
            req=urllib.request.Request(row['url'],headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(req,timeout=25) as r:
                content=r.read()
            p.write_bytes(content)
        b=p.read_bytes()
        with Image.open(p) as im:out.update(width=im.width,height=im.height,format=im.format)
        out.update(status='downloaded',sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
    except Exception as e:out.update(status='failed',error=str(e))
    return out
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    for i,r in enumerate(pool.map(download,manifest)):
        results.append(r)
        if (i+1)%100==0:print(json.dumps({'processed':i+1,'downloaded':sum(x['status']=='downloaded' for x in results)}),flush=True)
(ASSETS/'manifest-downloaded.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
summary={'urls':len(results),'downloaded':sum(x['status']=='downloaded' for x in results),'distinctContentHashes':len(set(x.get('sha256') for x in results if x.get('sha256'))),'bytes':sum(x.get('bytes',0) for x in results)}
print(json.dumps(summary),flush=True)
