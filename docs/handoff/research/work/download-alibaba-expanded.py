import json, pathlib, urllib.request, concurrent.futures
from PIL import Image, ImageOps, ImageDraw
root=pathlib.Path(__file__).resolve().parent
assets=root/'alibaba-expanded-assets'
assets.mkdir(exist_ok=True)
data=json.loads((root/'alibaba-gallery-urls-2026-10-25.json').read_text(encoding='utf-8'))
tasks=[(group,i,u) for group in ['velvet','towel','newParure'] for i,u in enumerate(data[group],1)]
def download(task):
    group,i,u=task
    p=assets/f'{group}-{i:02}.jpg'
    try:
        req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
        b=urllib.request.urlopen(req,timeout=30).read()
        p.write_bytes(b)
        with Image.open(p) as im: size=im.size
        return {'group':group,'index':i,'url':u,'localpath':str(p),'size':size,'bytes':len(b),'status':'downloaded','visuallyInspected':False}
    except Exception as e:
        return {'group':group,'index':i,'url':u,'status':'error','error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    results=list(executor.map(download,tasks))
(assets/'manifest.json').write_text(json.dumps({'checkedAt':'2026-10-25','rightsApproved':False,'images':results},indent=2,ensure_ascii=False),encoding='utf-8')
for group in ['velvet','towel','newParure']:
    subset=[r for r in results if r['group']==group and r['status']=='downloaded']
    canvas=Image.new('RGB',(900,((len(subset)+3)//4)*245),'white')
    draw=ImageDraw.Draw(canvas)
    for n,r in enumerate(subset):
        with Image.open(r['localpath']) as im: thumb=ImageOps.contain(im.convert('RGB'),(215,215))
        x=(n%4)*225+(225-thumb.width)//2
        y=(n//4)*245
        canvas.paste(thumb,(x,y))
        draw.text(((n%4)*225+10,y+220),f"{group} {r['index']}",fill='black')
    canvas.save(assets/f'{group}-contact-sheet.jpg')
print(json.dumps({'downloaded':sum(r['status']=='downloaded' for r in results),'errors':[r for r in results if r['status']=='error']},ensure_ascii=False))
