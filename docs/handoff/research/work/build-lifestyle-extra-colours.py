import json,hashlib
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageStat,ImageFilter
root=Path(__file__).resolve().parent
read=lambda n:json.loads((root/n).read_text(encoding='utf-8-sig'))
products=read('lifestyle-extra-products.json');previous=read('lifestyle-review/candidates.json')
urlmap=read('catalog-image-cache/url-map.json');webmap=read('catalog-image-web/url-map.json')
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
ident=lambda src:str(Path(cached(src) or src)).lower()
seen={ident(c['src']) for c in previous}
seen.update(ident(c['src']) for c in read('lifestyle-extra-first.json'))
seen.update(ident(c['url']) for c in read('lifestyle-extra-verified-views.json'))
reviews=read('lifestyle-reviewed-first.json')+read('lifestyle-reviewed-second.json')+read('lifestyle-review-corrections.json')
byid={r['reviewId']:r for r in reviews}
scenecolors={(c['productId'],c['colorId']) for c in previous if byid.get(c['reviewId'],{}).get('classification')=='scene' and c['colorId']}
scenecolors.update((c['productId'],c['colorId']) for c in read('lifestyle-extra-first.json') if c['classification']=='scene')
sceneproducts={p for p,c in scenecolors}
statscache={}
def stats(f):
 if f in statscache:return statscache[f]
 im=Image.open(f).convert('RGB').resize((64,64));pixels=list(im.getdata())
 white=sum(min(px)>235 for px in pixels)/len(pixels)
 edge=ImageStat.Stat(im.filter(ImageFilter.FIND_EDGES)).mean
 out={'whiteFraction':round(white,3),'edgeMean':round(sum(edge)/3,3)};statscache[f]=out;return out
def neutral(name):
 return any(w in name.lower() for w in ['beige','sable','naturel','blanc','lin','ficelle','creme','cream','crème'])
pool=[]
for p in products:
 names={c['id']:c['name'] for c in p.get('colorOptions',[])}
 for color,images in p.get('colorGalleries',{}).items():
  for i,src in enumerate(images):
   f=cached(src)
   if not f or ident(src) in seen:continue
   st=stats(f)
   if st['whiteFraction']>.36:continue
   pool.append({'productId':p['id'],'productName':p['name'],'category':p['category'],'colorId':color,'colorName':names.get(color,color),'src':src,'photoIndex':i+1,'localPath':f,**st})
def priority(c):
 key=(c['productId'],c['colorId']);cat=c['category']
 return (c['productId']!='pd-25300',key in scenecolors,cat not in ['housses-couette','taies'], c['productId'] not in sceneproducts,not neutral(c['colorName']),c['photoIndex']>1,c['whiteFraction'],c['photoIndex'])
pool.sort(key=priority)
selection=[];selected=set();colorcounts={}
def add(c):
 key=(c['productId'],c['colorId']);selected.add(ident(c['src']));selection.append(c);colorcounts[key]=colorcounts.get(key,0)+1
# Inspect every still-unreviewed exact view for all eight percale colours first.
for c in pool:
 if c['productId']=='pd-25300':add(c)
for limit in [1,2,3]:
 for c in pool:
  if len(selection)>=180:break
  key=(c['productId'],c['colorId'])
  if ident(c['src']) in selected or colorcounts.get(key,0)>=limit:continue
  add(c)
 if len(selection)>=180:break
for i,c in enumerate(selection,1):c['extraId']=i
(root/'lifestyle-extra-colours-candidates.json').write_text(json.dumps(selection,ensure_ascii=False,indent=2),encoding='utf8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
for start in range(0,len(selection),60):
 rows=selection[start:start+60];sheet=Image.new('RGB',(1200,2400),'#eee9e0');draw=ImageDraw.Draw(sheet)
 for j,c in enumerate(rows):
  x=(j%6)*200;y=(j//6)*240
  im=Image.open(c['localPath']).convert('RGB');im.thumbnail((190,188))
  sheet.paste(im,(x+(200-im.width)//2,y+(188-im.height)//2))
  lines=[f"{c['extraId']:03} {c['productId']}",c['colorName'][:27],f"{c['category']} vue {c['photoIndex']}"]
  draw.multiline_text((x+3,y+190),'\n'.join(lines),font=font,fill='black',spacing=1)
 sheet.save(root/f'lifestyle-extra-colours-sheet-{start//60+1}.jpg',quality=91)
print({'pool':len(pool),'selected':len(selection),'models':len({c['productId'] for c in selection}),'colors':len(colorcounts),'percaleViews':sum(c['productId']=='pd-25300' for c in selection)})
