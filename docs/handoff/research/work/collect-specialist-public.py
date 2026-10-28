import concurrent.futures, html, json, pathlib, re, urllib.parse, urllib.request

ROOT=pathlib.Path(__file__).resolve().parent
RAW=ROOT/'specialist-public-evidence'
RAW.mkdir(exist_ok=True)

def get(url,filename):
    p=RAW/filename
    if p.exists(): return p.read_text(encoding='utf-8')
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=40) as response:
        raw=response.read().decode('utf-8')
    p.write_text(raw,encoding='utf-8')
    return raw

def clean(s): return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s))).strip()

def anchors(raw,base):
    out=[]
    for u,n in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>',raw,re.S):
        pair=(urllib.parse.urljoin(base,html.unescape(u)),clean(n))
        if pair not in out: out.append(pair)
    return out

def aw_pages():
    urls=[]
    cat=get('https://www.aw-dropship.eu/homeware/sd-rugs','aw-category.html')
    for u,n in anchors(cat,'https://www.aw-dropship.eu'):
        if re.search(r'cushion|throw|bedspread|linen',n,re.I) and re.search(r'/[^/]+-\d+',u) and not re.search(r'Rug(?!\s+Cushion)',n,re.I): urls.append(u)
    mandala=get('https://www.aw-dropship.eu/homeware/cmc-ds','aw-mandala.html')
    urls.extend(u for u,n in anchors(mandala,'https://www.aw-dropship.eu') if re.search(r'1x .*Mandala Cushion',n,re.I))
    def one(u):
        try:
            r=get(u,'aw-'+u.rsplit('/',1)[-1]+'.html')
            m=re.search(r'data-page="([^"]+)"',r)
            props=json.loads(html.unescape(m.group(1)))['props']
            p=next(b['structure']['product'] for b in props['web_blocks'] if b.get('type')=='product-1')
            photos=[]
            for im in p.get('images',[]):
                if im.get('type')=='image' and im.get('id') and im.get('images',{}).get('original'):
                    photos.append({'id':im['id'],'label':im.get('label'),'url':im['images']['original']})
            return {'url':u,'sku':p['code'],'name':p['name'],'familyCode':p['family_code'],
              'description':clean((p.get('description') or '')+' '+(p.get('description_extra') or '')),
              'specifications':p['specifications'],'price':p.get('price'),'stockObserved':p.get('stock'),
              'units':p.get('units'),'images':photos,'checkedAt':'2026-10-25'}
        except Exception as e:return {'url':u,'error':str(e)}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex: rows=list(ex.map(one,dict.fromkeys(urls)))
    (ROOT/'specialist-aw-raw.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'awPages':len(rows),'errors':[r for r in rows if r.get('error')],'images':sum(len(r.get('images',[])) for r in rows)}),flush=True)

def planete_listings():
    index=get('https://www.planetediscount.eu/235-linge-de-lit','pd-index.html')
    wanted=['Couette','Oreiller','Coussin','Drap housse','Housse de couette',"Taie d'oreiller",'Drap plat','Linge de bain','Linge de maison']
    cats=[]
    for u,n in anchors(index,'https://www.planetediscount.eu'):
        if n in wanted and re.fullmatch(r'https://www.planetediscount.eu/\d+-[^/.?]+',u) and (u,n) not in cats:cats.append((u,n))
    def one(pair):
        u,n=pair
        raw=get(u+'?n=125','pd-cat-'+u.rsplit('/',1)[-1]+'.html')
        products=[]
        for pu,name in re.findall(r'<a[^>]+class="product-name"[^>]+href="([^"]+)"[^>]+title="([^"]+)"',raw):
            row={'url':html.unescape(pu),'name':html.unescape(name),'categorySource':n}
            if row not in products:products.append(row)
        return {'url':u,'name':n,'products':products}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:rows=list(ex.map(one,cats))
    (ROOT/'specialist-planete-listings.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'planeteCategories':[{'name':r['name'],'products':len(r['products'])} for r in rows]}),flush=True)

if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
        list(ex.map(lambda f:f(),[aw_pages,planete_listings]))
