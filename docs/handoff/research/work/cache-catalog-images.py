"""Cache supplier photo URLs; no visual certification or editing of product colors."""
import concurrent.futures,hashlib,io,json,pathlib,time,urllib.request,os
from PIL import Image,ImageOps
ROOT=pathlib.Path(__file__).parent
OUT=ROOT/'catalog-image-cache';OUT.mkdir(exist_ok=True)
SOURCE=ROOT/'sites/moon-and-pillow/lib/imported-products.ts'
raw=SOURCE.read_text('utf-8-sig');products=json.JSONDecoder().raw_decode(raw.split('=',1)[1].lstrip())[0]
queue=[];seen=set();usage={}
def add(url,pid,kind):
 if not isinstance(url,str) or not url.startswith('https://'):return
 usage.setdefault(url,[]).append({'productId':pid,'kind':kind})
 if url not in seen:seen.add(url);queue.append(url)
for p in products:add(p.get('coverImage'),p['id'],'cover')
for p in products:
 for col,urls in p.get('colorGalleries',{}).items():
  for url in urls:add(url,p['id'],'color:'+col)
for p in products:
 for url in p.get('sharedGallery',[]):add(url,p['id'],'shared')
 for url in p.get('gallery',[]):add(url,p['id'],'gallery')
records={};binary={};pixels={};started=time.time()
prior=OUT/'manifest.json'
if prior.exists():
 try:records=json.loads(prior.read_text('utf-8'))['images']
 except Exception:pass
for u,r in records.items():
 if r.get('status')=='cached' and pathlib.Path(r.get('localPath','')).is_file():
  binary[r['sourceSha256']]=r;pixels[r['pixelHash']]=r
seed={}
for mf in [ROOT/'gallery-proof-assets/manifest.json']:
 if mf.exists():
  for r in json.loads(mf.read_text('utf-8-sig')):
   if not r.get('error'):seed[r['url']]=r['localPath']
def fetch(url):
 try:
  if url in seed:data=pathlib.Path(seed[url]).read_bytes()
  else:
   req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
   with urllib.request.urlopen(req,timeout=15) as response:
    data=response.read(25_000_001)
   if len(data)>25_000_000:raise ValueError('Image exceeds 25 MB')
  sourcehash=hashlib.sha256(data).hexdigest()
  im=Image.open(io.BytesIO(data));im.load();im=ImageOps.exif_transpose(im)
  if im.mode not in ('RGB','RGBA'):im=im.convert('RGBA' if 'transparency' in im.info else 'RGB')
  rgb=im.convert('RGB')
  pixelhash=hashlib.sha256(f'{rgb.width}x{rgb.height}:'.encode()+rgb.tobytes()).hexdigest()
  size=im.size
  # Stable file identity derives from decoded original pixels. Different source URLs may share it.
  path=OUT/(pixelhash[:24]+'.webp')
  im.thumbnail((1200,1200),Image.Resampling.LANCZOS)
  if not path.exists():im.save(path,'WEBP',quality=83,method=4)
  return {'status':'cached','localPath':str(path.resolve()),'fileName':path.name,'sourceSha256':sourcehash,'pixelHash':pixelhash,'sourceWidth':size[0],'sourceHeight':size[1],'cachedWidth':im.width,'cachedHeight':im.height,'bytes':path.stat().st_size,'visualAssociationVerified':False}
 except Exception as e:return {'status':'error','error':str(e),'visualAssociationVerified':False}
def save():
 ok=[r for r in records.values() if r.get('status')=='cached']
 stat={'queuedUrls':len(queue),'processed':len(records),'cachedUrls':len(ok),'errors':sum(r.get('status')=='error' for r in records.values()),'uniqueSourceHashes':len({r['sourceSha256'] for r in ok}),'uniquePixelHashes':len({r['pixelHash'] for r in ok}),'elapsedSeconds':round(time.time()-started,1)}
 obj={'checkedAt':'2026-10-25','method':'Download and technical binary/decoded RGB pixel deduplication only. No automatic visual certification. Thumbnail max1200px WebP quality83; colors/content not changed.','source':str(SOURCE.resolve()),'progress':stat,'images':records}
 for name,value in [('manifest.json',obj),('url-map.json',{u:r['localPath'] for u,r in records.items() if r.get('status')=='cached'})]:
  temp=OUT/(name+'.tmp');temp.write_text(json.dumps(value,ensure_ascii=False,indent=2),'utf-8');os.replace(temp,OUT/name)
 print(json.dumps(stat),flush=True)
save()
pending=[u for u in queue if not (records.get(u,{}).get('status')=='cached' and pathlib.Path(records[u]['localPath']).is_file())]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 # Bounded submission so covers and associated colors are processed before general galleries.
 for start in range(0,len(pending),80):
  batch=pending[start:start+80]
  future_urls={pool.submit(fetch,u):u for u in batch}
  for future in concurrent.futures.as_completed(future_urls):
   url=future_urls[future];result=future.result();result['usage']=usage[url]
   if result.get('status')=='cached':
    canonical=binary.get(result['sourceSha256']) or pixels.get(result['pixelHash'])
    if canonical:result['localPath']=canonical['localPath'];result['fileName']=canonical['fileName'];result['deduplicated']=True
    binary[result['sourceSha256']]=result;pixels[result['pixelHash']]=result
   records[url]=result
   if len(records)%100==0:save()
  save()
  if time.time()-started>285:
   print('Time budget reached; rerun to resume cache.',flush=True);break
save()
