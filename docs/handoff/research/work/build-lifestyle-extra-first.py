import json,hashlib,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageStat,ImageFilter
root=Path(__file__).resolve().parent
products=json.loads((root/'lifestyle-extra-products.json').read_text(encoding='utf8'))
previous=json.loads((root/'lifestyle-review/candidates.json').read_text(encoding='utf-8-sig'))
urlmap=json.loads((root/'catalog-image-cache/url-map.json').read_text(encoding='utf-8-sig'))
webmap=json.loads((root/'catalog-image-web/url-map.json').read_text(encoding='utf-8-sig'))
hashmap={}
for url,p in webmap.items():
 f=Path(p)
 if f.exists():hashmap[hashlib.sha256(f.read_bytes()).hexdigest()[:16]]=urlmap[url]
public=root/'sites/moon-and-pillow/public'
def cached(src):
 if src.startswith('http'):return urlmap.get(src)
 f=public/src.lstrip('/')
 if f.exists():return hashmap.get(f.stem,str(f))
 return None
seen={str(Path(cached(c['src']) or c['localPath'])).lower() for c in previous}
reviews=[]
for f in ['lifestyle-reviewed-first.json','lifestyle-reviewed-second.json']:
 if (root/f).exists():reviews+=json.loads((root/f).read_text(encoding='utf-8-sig'))
byid={r['reviewId']:r for r in reviews}
sceneproducts={c['productId'] for c in previous if byid.get(c['reviewId'],{}).get('classification')=='scene' and c['colorId']}
scenecolors={(c['productId'],c['colorId']) for c in previous if byid.get(c['reviewId'],{}).get('classification')=='scene' and c['colorId']}
statscache={}
def stats(f):
 if f in statscache:return statscache[f]
 im=Image.open(f).convert('RGB').resize((96,96));pixels=list(im.getdata())
 white=sum(min(px)>235 for px in pixels)/len(pixels)
 edge=ImageStat.Stat(im.filter(ImageFilter.FIND_EDGES)).mean
 out={'whiteFraction':round(white,3),'edgeMean':round(sum(edge)/3,3)};statscache[f]=out;return out
pool=[]
for p in products:
 names={c['id']:c['name'] for c in p.get('colorOptions',[])}
 for color,images in p.get('colorGalleries',{}).items():
  for i,src in enumerate(images):
   f=cached(src)
   if not f or str(Path(f)).lower() in seen:continue
   st=stats(f)
   if st['whiteFraction']>.32:continue
   pool.append({'productId':p['id'],'productName':p['name'],'category':p['category'],'colorId':color,'colorName':names.get(color,color),'src':src,'photoIndex':i+1,'localPath':f,**st})
pool.sort(key=lambda c:(c['productId'] in sceneproducts,(c['productId'],c['colorId']) in scenecolors,c['whiteFraction'], -c['edgeMean']))
selection=[];modelcounts={};colorcounts={};identities=set()
for maxmodel in [1,2,3,5,120]:
 for c in pool:
  if len(selection)>=120:break
  key=(c['productId'],c['colorId']);identity=str(Path(c['localPath'])).lower()
  if identity in identities or modelcounts.get(c['productId'],0)>=maxmodel:continue
  # Start with new colours, then allow alternative views.
  if maxmodel<3 and colorcounts.get(key,0):continue
  identities.add(identity);selection.append(c)
  modelcounts[c['productId']]=modelcounts.get(c['productId'],0)+1;colorcounts[key]=colorcounts.get(key,0)+1
 if len(selection)>=120:break
for i,c in enumerate(selection,1):c['extraId']=i
(root/'lifestyle-extra-first-candidates.json').write_text(json.dumps(selection,ensure_ascii=False,indent=2),encoding='utf8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
for start in range(0,len(selection),60):
 rows=selection[start:start+60];sheet=Image.new('RGB',(1200,2400),'#eee9e0');draw=ImageDraw.Draw(sheet)
 for j,c in enumerate(rows):
  x=(j%6)*200;y=(j//6)*240
  im=Image.open(c['localPath']).convert('RGB');im.thumbnail((190,188))
  sheet.paste(im,(x+(200-im.width)//2,y+(188-im.height)//2))
  lines=[f"{c['extraId']:03} {c['productId']}",c['colorName'][:27],f"{c['category']} vue {c['photoIndex']}"]
  draw.multiline_text((x+3,y+190),'\n'.join(lines),font=font,fill='black',spacing=1)
 sheet.save(root/f'lifestyle-extra-first-sheet-{start//60+1}.jpg',quality=91)
print({'pool':len(pool),'selected':len(selection),'models':len(modelcounts),'modelsWithoutPreviousScene':len(set(modelcounts)-sceneproducts),'colors':len(colorcounts)})
