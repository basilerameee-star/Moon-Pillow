import json,pathlib,urllib.request,hashlib,concurrent.futures,math
from PIL import Image,ImageOps,ImageDraw,ImageFont
root=pathlib.Path(__file__).parent
out=root/'gallery-proof-assets';out.mkdir(exist_ok=True)
p=json.loads((root/'specialist-corrected-2026-10-25.json').read_text('utf-8-sig'))['products']
choices={'pd-25300':['Sable','Terre De Sienne','Neige'],'pd-25536':['Naturel','Aqua','Caramel'],'pd-25080':['Naturel','Terracotta']}
jobs=[]
for model in p:
 if model['id'] not in choices:continue
 for color in model['colors']:
  if color['name'] not in choices[model['id']]:continue
  for i,img in enumerate(color['images']):
   jobs.append(dict(modelId=model['id'],color=color['name'],colorId=color['id'],index=i+1,**img))
def fetch(row):
 name=f"{row['modelId']}-{row['colorId']}-{row['index']:02}.jpg";path=out/name
 try:
  if not path.exists():
   req=urllib.request.Request(row['url'],headers={'User-Agent':'Mozilla/5.0'})
   with urllib.request.urlopen(req,timeout=25) as response:path.write_bytes(response.read())
  data=path.read_bytes();im=Image.open(path);im.verify()
  return dict(row,localPath=str(path.resolve()),sha256=hashlib.sha256(data).hexdigest())
 except Exception as e:return dict(row,error=str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:rows=list(pool.map(fetch,jobs))
(out/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),'utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',13)
for mid in choices:
 group=[r for r in rows if r['modelId']==mid and not r.get('error')]
 # Include all downloaded views, retain source indices so repetitions are obvious.
 cw,ch=240,265;sheet=Image.new('RGB',(cw*4,ch*math.ceil(len(group)/4)),'#eeeeee');draw=ImageDraw.Draw(sheet)
 for j,r in enumerate(group):
  x=j%4*cw;y=j//4*ch
  im=Image.open(r['localPath']).convert('RGB');im.thumbnail((230,220))
  sheet.paste(im,(x+(cw-im.width)//2,y))
  draw.text((x+4,y+222),f"{mid} {r['color']} #{r['index']}",fill='black',font=font)
  draw.text((x+4,y+240),f"{r.get('supplierSku','')} {r.get('sourceSize','')}",fill='black',font=font)
 sheet.save(out/f'{mid}-contact.jpg',quality=90)
print(json.dumps({'downloaded':sum(not r.get('error') for r in rows),'errors':sum(bool(r.get('error')) for r in rows),'sheets':[str(out/f'{m}-contact.jpg') for m in choices]}))
