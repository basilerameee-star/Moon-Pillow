import concurrent.futures
import html
import json
import pathlib
import re
import urllib.parse
import urllib.request
from html.parser import HTMLParser

BASE = 'https://www.aw-dropship.eu'
OUT = pathlib.Path(__file__).resolve().parent
RAW = OUT / 'aw-public-evidence'
RAW.mkdir(exist_ok=True)

def get(url):
    request = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=35) as response:
        return response.read().decode('utf-8')

class Anchors(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links=[]
    def handle_starttag(self, tag, attrs):
        if tag=='a':
            a=dict(attrs)
            if a.get('href'):
                self.links.append(urllib.parse.urljoin(BASE, a['href']))

catalog=get(BASE+'/homeware/sd-rugs')
(RAW/'category.html').write_text(catalog,encoding='utf-8')
parser=Anchors()
parser.feed(catalog)
selected=[]
for url in parser.links:
    suffix=url.rsplit('/',1)[-1]
    if (re.fullmatch(r'cicc-(1[1-9]|20)',suffix) or re.fullmatch(r'(bohot|hit)-0[1-6]',suffix)) and url not in selected:
        selected.append(url)

def collect(url):
    raw=get(url)
    suffix=url.rsplit('/',1)[-1]
    (RAW/(suffix+'.html')).write_text(raw,encoding='utf-8')
    product=None
    for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',raw,re.S):
        data=json.loads(html.unescape(block))
        if isinstance(data,dict) and data.get('@type')=='Product':
            product=data
            break
    if not product:
        return {'url':url,'error':'No public Product structured data'}
    props={p.get('name'):p.get('value') for p in product.get('additionalProperty',[])}
    images=product.get('image',[])
    if isinstance(images,str):
        images=[images]
    image_urls=[i.get('contentUrl') if isinstance(i,dict) else i for i in images]
    return {'url':url,'name':product.get('name'),'sku':product.get('sku'),'description':product.get('description'),
            'properties':props,'offer':product.get('offers'),'imageUrls':image_urls,
            'rawFile':str(RAW/(suffix+'.html'))}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(collect,selected))
(OUT/'aw-public-structured.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':len(results),'errors':[r for r in results if r.get('error')],
                  'models':[{'sku':r.get('sku'),'name':r.get('name'),'dimensions':r.get('properties',{}).get('dimensions'),'price':r.get('offer',{}).get('price')} for r in results]},ensure_ascii=False,indent=2))
