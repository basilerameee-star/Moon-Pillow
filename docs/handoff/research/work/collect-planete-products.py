import concurrent.futures, html, importlib.util, json, pathlib, re

ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('specialist',ROOT/'collect-specialist-public.py')
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
get=helper.get;clean=helper.clean
listing=json.loads((ROOT/'specialist-planete-listings.json').read_text(encoding='utf-8'))
products={p['url']:p for c in listing for p in c['products'] if not re.search(r'Harry Potter|Disney|Pokemon|Pokémon|LOL Surprise|Pat Patrouille|Dragon Ball|Stitch|Spiderman|Minnie|Mickey|Manchester|PSG|Naruto|Friends',p['name'],re.I)}

def collect(p):
    try:
        productid=re.search(r'/([0-9]+)-[^/]+\.html',p['url']).group(1)
        r=get(p['url'],'pd-product-'+productid+'.html')
        title=re.search(r'<h1[^>]*>(.*?)</h1>',r,re.S)
        photos=[]
        # Gallery links, never unrelated products or thumbnail resolutions.
        block=re.search(r'<ul id="thumbs_list_frame">(.*?)</ul>',r,re.S)
        for url in re.findall(r'<a[^>]+href="([^"]+)"',block.group(1) if block else ''):
            url=html.unescape(url)
            if url not in photos:photos.append(url)
        if not photos:
            image=re.search(r'<img[^>]+id="bigpic"[^>]+src="([^"]+)"',r)
            if image:photos.append(html.unescape(image.group(1)))
        props={}
        table=re.search(r'<table class="table-data-sheet">(.*?)</table>',r,re.S)
        if table:
            for key,value in re.findall(r'<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>',table.group(1),re.S):props[clean(key)]=clean(value)
        desc=re.search(r'<section[^>]*id="descriptionTab"[^>]*>(.*?)</section>',r,re.S)
        if not desc:desc=re.search(r'<div[^>]*class="rte"[^>]*>(.*?)</div>',r,re.S)
        sku=re.search(r"var productReference='([^']+)'",r)
        publichint=re.search(r'var productPriceTaxExcluded=([0-9.]+)',r)
        return {'url':p['url'],'productId':productid,'sku':sku.group(1) if sku else None,
          'name':clean(title.group(1)) if title else p['name'],'listedName':p['name'],
          'categorySource':p['categorySource'],'features':props,
          'description':clean(desc.group(1)) if desc else '', 'images':photos,
          'embeddedPriceHintHT':float(publichint.group(1)) if publichint else None,
          'priceNote':'Prix affichés uniquement après validation de compte professionnel; une valeur technique du script public ne constitue pas un devis livré ni un tarif professionnel confirmé.',
          'checkedAt':'2026-10-25'}
    except Exception as e:return {'url':p['url'],'error':str(e)}

if __name__=='__main__':
    results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
        for row in ex.map(collect,products.values()):
            results.append(row)
            if len(results)%50==0:
                (ROOT/'specialist-planete-raw.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
                print(json.dumps({'progress':len(results),'total':len(products),'errors':sum(bool(p.get('error')) for p in results)}),flush=True)
    (ROOT/'specialist-planete-raw.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'done':len(results),'errors':sum(bool(p.get('error')) for p in results),'images':sum(len(p.get('images',[])) for p in results)}),flush=True)
