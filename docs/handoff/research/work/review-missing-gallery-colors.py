import json,pathlib,math,hashlib
from PIL import Image,ImageDraw,ImageFont
root=pathlib.Path(__file__).parent;out=root/'gallery-proof-assets'
src=json.loads((root/'specialist-corrected-2026-10-25.json').read_text('utf-8-sig'))['products']
cache=json.loads((root/'catalog-image-cache/manifest.json').read_text('utf-8'))['images']
choices={'pd-25300':['Thym','Havane','Galet','Céladon','Bleu Nuit'],'pd-25080':['Romarin','Eucalyptus'],'pd-25536':['Kaki']}
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14);allrows=[]
for p in src:
 if p['id'] not in choices:continue
 rows=[]
 for c in p['colors']:
  if c['name'] not in choices[p['id']]:continue
  seen=set()
  for i,img in enumerate(c['images']):
   ca=cache.get(img['url'],{})
   if ca.get('status')!='cached':continue
   key=ca['pixelHash']
   if key in seen:continue
   seen.add(key)
   rows.append(dict(modelId=p['id'],colorId=c['id'],color=c['name'],index=i+1,**img,localPath=ca['localPath'],pixelHash=key,sha256=ca['sourceSha256']))
 allrows+=rows
 if not rows:continue
 cw,ch=260,280;sheet=Image.new('RGB',(cw*4,ch*math.ceil(len(rows)/4)),'#eeeeee');draw=ImageDraw.Draw(sheet)
 for j,r in enumerate(rows):
  x=j%4*cw;y=j//4*ch;im=Image.open(r['localPath']).convert('RGB');im.thumbnail((250,230))
  sheet.paste(im,(x+(cw-im.width)//2,y));draw.text((x+4,y+233),f"{p['id']} {r['color']} #{r['index']}",fill='black',font=font);draw.text((x+4,y+254),r['supplierSku']+' '+r.get('sourceSize',''),fill='black',font=font)
 sheet.save(out/(p['id']+'-additional-colors.jpg'),quality=92)
(out/'additional-colors-manifest.json').write_text(json.dumps(allrows,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps([{'modelId':mid,'color':col,'uniqueViews':sum(r['modelId']==mid and r['color']==col for r in allrows)} for mid,cols in choices.items() for col in cols],ensure_ascii=False))
