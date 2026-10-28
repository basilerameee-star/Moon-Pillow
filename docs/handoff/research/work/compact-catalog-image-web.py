import pathlib,json,concurrent.futures,time,os,sys
from PIL import Image
root=pathlib.Path(__file__).parent;source=root/'catalog-image-cache';out=root/'catalog-image-web';out.mkdir(exist_ok=True)
MAX_EDGE=int(sys.argv[1]) if len(sys.argv)>1 else 900
mapping=json.loads((source/'url-map.json').read_text('utf-8'));unique=sorted(set(mapping.values()));records={};start=time.time()
def compact(path):
 p=pathlib.Path(path);target=out/p.name
 with Image.open(p) as im:
  im.load();original=im.size;im.thumbnail((MAX_EDGE,MAX_EDGE),Image.Resampling.LANCZOS);im.save(target,'WEBP',quality=72,method=4)
  return path,{'localPath':str(target.resolve()),'sourcePath':path,'width':im.width,'height':im.height,'sourceWidth':original[0],'sourceHeight':original[1],'bytes':target.stat().st_size}
def save():
 mapped={url:records[path]['localPath'] for url,path in mapping.items() if path in records}
 stat={'processedImages':len(records),'totalImages':len(unique),'mappedUrls':len(mapped),'bytes':sum(r['bytes'] for r in records.values()),'elapsedSeconds':round(time.time()-start,1)}
 for name,obj in [('url-map.json',mapped),('manifest.json',{'method':f'Aspect-ratio-preserving thumbnail max{MAX_EDGE}x{MAX_EDGE}, WEBP quality72 method4. No cropping, recoloring or semantic edits. Technical compression only; originals retained in catalog-image-cache.','progress':stat,'images':records})]:
  temp=out/(name+'.tmp');temp.write_text(json.dumps(obj,ensure_ascii=False,indent=2),'utf-8');os.replace(temp,out/name)
 print(json.dumps(stat),flush=True)
save()
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for original,result in pool.map(compact,unique):
  records[original]=result
  if len(records)%100==0:save()
save()
