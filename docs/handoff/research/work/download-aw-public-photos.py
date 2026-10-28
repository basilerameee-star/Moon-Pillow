import concurrent.futures,json,pathlib,urllib.request
root=pathlib.Path(__file__).resolve().parent
records=json.loads((root/'aw-public-structured.json').read_text(encoding='utf-8'))
out=root/'additional-supplier-images'
out.mkdir(exist_ok=True)
def fetch(r):
    url=r['imageUrls'][0]
    path=out/(r['sku'].lower()+'.jpg')
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=35) as response:
        body=response.read()
    path.write_bytes(body)
    r['imageLocalPath']=str(path)
    return {'sku':r['sku'],'bytes':len(body),'path':str(path)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    done=list(pool.map(fetch,records))
(root/'aw-public-structured.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(done,indent=2))
