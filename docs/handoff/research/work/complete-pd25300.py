import json
from pathlib import Path
p=Path('work/lifestyle-extra-verified-views.json')
rows=json.loads(p.read_text(encoding='utf-8'))
model=next(m for m in json.loads(Path('work/photo-verified-overrides.json').read_text(encoding='utf-8'))['models'] if m['id']=='pd-25300')
known={r['url'] for r in rows}
for name,color_id in [('Terre De Sienne','color-2'),('Neige','color-4')]:
    color=next(c for c in model['colors'] if c['name']==name)
    for image in color['images'][2:4]:
        if image['url'] not in known:rows.append({**image,'src':image['url'],'productId':'pd-25300','colorId':color_id,'colorName':name,'classification':'macro','reason':'Original du même SKU et coloris vérifié en plein format : boutons/ourlet ou texture plein cadre. Le tapis vert est un accessoire du décor.'})
p.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
