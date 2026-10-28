import json,re,pathlib,datetime,concurrent.futures,urllib.request,hashlib
ROOT=pathlib.Path(__file__).resolve().parent
ASSETS=ROOT/'cj-expanded-assets';ASSETS.mkdir(exist_ok=True)
pages=json.loads((ROOT/'cj-parsed-pages.json').read_text(encoding='utf-8'))
def clean(t):return re.sub(r'【[^】]+】','',t).strip()
def block(body,label):
    m=re.search(r'^'+label+r'\(([^\n]+)\)\s*\n((?:\s*\n|\s*\*[^\n]*\n)+)',body,re.M|re.I)
    if not m:return []
    vals=[clean(x) for x in re.findall(r'^\s*\* (.+)',m[2],re.M)]
    vals=[x for x in vals if x]
    return list(dict.fromkeys(vals or [m[1]]))
def field(body,label):
    m=re.search(r'^'+label+r':\s*([^\n]+)',body,re.M|re.I)
    return m[1].strip() if m else ''
def category(name):
    n=name.lower()
    if any(x in n for x in ['pillowcase','pillow cover','cushion cover']): return 'housses' if any(x in n for x in ['sofa','cushion','decorative','gold peach','cat print']) else 'taies'
    if 'towel' in n and 'sofa' not in n:return 'serviettes'
    if 'blanket' in n:return 'plaids'
    if 'duvet cover' in n or 'quilt cover' in n:return 'housses-couette'
    if 'quilt' in n:return 'couettes'
    if any(x in n for x in ['bedspread','bed cover']):return 'couvre-lits'
    if any(x in n for x in ['sheet','bedsheet','bedding']):return 'draps'
    return 'coussins'
products=[];manifest=[]
for p in pages:
    name=p['name'];body=p['body'];pid=p['pid']
    if any(t in name.lower() for t in ['baby','pet ','dogs','disposable','child','exfoliat','gloves']):continue
    sizes=[]
    for label in ['Size Specification','Size','Dimensions','Bedding Size','Che Che']:sizes+=block(body,label)
    colors=[]
    for label in ['Color','Colour','Pattern','Flower Pattern']:colors+=block(body,label)
    descColors=field(body,'Color') or field(body,'Colour')
    if descColors and len(colors)<2:
        colors+=re.split(r'[,，;；]',descColors)
    colors=list(dict.fromkeys(clean(c).strip(' ,') for c in colors if clean(c).strip(' ,') and 'multiple colors' not in c.lower()))
    sizes=list(dict.fromkeys(sizes))
    if not sizes:
        info=field(body,'Size') or field(body,'Size specifications') or field(body,'Dimensions')
        if info:sizes=[info]
    mat=field(body,'Material')
    # The first generic Material section is 'Cloth'; a colon field is the detailed composition.
    materials=[mat] if mat else []
    principal=field(body,'Fabric principal component')
    if principal and principal not in materials:materials.append(principal)
    sku=re.search(r'^SKU: ([^\n]+)',body,re.M)
    pricepart=body.split('QDR:',1)[-1].split('Shipping From',1)[0]
    prices=re.findall(r'\$(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?',pricepart)
    rawprices=['$'+a+('-'+b if b else '') for a,b in prices]
    price={'currency':'USD','min':float(prices[0][0]) if prices else None,'max':float(prices[0][1] or prices[0][0]) if prices else None,'basis':'Fourchette publique du produit, hors livraison France, taxes et conversion; non approuvée.','evidenceUrl':p['url'],'observedText':' / '.join(rawprices)}
    imagefile=ROOT/f'cj-image-links-{pid}.json'
    urls=[]
    if imagefile.exists():
        im=json.loads(imagefile.read_text(encoding='utf-8'))
        urls=im.get('urls') or list(dict.fromkeys(re.findall(r'https://[^\s:)\]";]+\.(?:jpg|jpeg|png|webp)',im['result'],re.I)))
    gallery=[]
    for i,u in enumerate(urls):
        ext=pathlib.PurePosixPath(u).suffix.lower(); filename=f'{pid.lower()}-{i+1:02d}{ext}'
        local=ASSETS/filename
        gallery.append({'url':u,'localpath':str(local),'kind':'detail','evidence':f'Image {i+1} liée depuis la galerie ou le descriptif de la fiche CJ. Type de scène et coloris à auditer visuellement; aucune affectation automatique à une couleur.'})
        manifest.append({'productId':pid,'index':i+1,'url':u,'localpath':str(local)})
    uncertainties=[
      'Fiche publique indexée consultée le 25 octobre 2026; prix, variantes et disponibilité à reconfirmer directement avant vente.',
      'Le rapprochement entre chaque photo et chaque coloris n’est pas encore validé: les images restent dans la galerie générale et ne doivent pas être copiées dans toutes les variantes.',
      'Le critère deux coloris avec trois vues exactes par coloris n’est pas acquis; le produit reste un candidat en préparation.',
      'Le port affiché 0.00 sur la page non connectée ne constitue pas une livraison gratuite. Coût livré en France inconnu.',
      'Licence des photos, stock commandable, taxes et retour fournisseur à confirmer; aucun achat ni compte nouveau.'
    ]
    if len(colors)<2:uncertainties.append('Au moins deux noms de coloris ne sont pas récupérés dans la version publique de la fiche.')
    if len(prices)>1:uncertainties.append('Plusieurs fourchettes de prix sont présentes; la première est relevée sans conclure au prix final d’une variante.')
    if 'cotton' in name.lower() and any('polyester' in m.lower() or 'chemical' in m.lower() for m in materials):uncertainties.append('Le titre évoque du coton mais le détail matière indique une fibre chimique/polyester. Ne pas afficher une promesse coton.')
    if any(s in name.lower() for s in ['four-piece','three-piece','three or four']):uncertainties.append('Conditionnement fournisseur en ensemble: aucune preuve que chaque pièce puisse être commandée séparément. Ne pas transformer le lot en pièces vendables sans confirmation.')
    products.append({'id':'cj-'+pid.lower(),'source':'CJdropshipping','supplierProductId':pid,'supplierSku':sku[1] if sku else None,'sourceUrl':p['url'],'nameFR':name,'nameOriginal':name,'category':category(name),'descriptionFrench':'Référence fournisseur de linge de maison en préparation. Les caractéristiques ci-dessous sont relevées sur la fiche CJ; la matière, le stock et le coût livré restent à confirmer.','materials':materials,'sizes':sizes,'colors':[{'id':re.sub(r'[^a-z0-9]+','-',c.lower()).strip('-'),'name':c,'images':[]} for c in colors], 'gallery':gallery,'price':price,'moq':1,'moqBasis':'Commande à l’unité annoncée pour le service CJ dropshipping; disponibilité du SKU et livraison France à confirmer.','shippingNote':'Coût livré en France inconnu; calcul de transport non connecté indisponible. Ne pas interpréter 0.00 comme port gratuit.','uncertainties':uncertainties,'draftOnly':True,'fullyMeetsPhotoRequirement':False})
output={'checkedAt':'2026-10-25','sourceNotes':['Sources primaires CJdropshipping uniquement; aucune URL de produit inventée.','Le navigateur CJ et le HTML direct affichent une vérification humaine. Aucune tentative de résolution ou de contournement; seules les fiches publiques indexées et leurs liens médias sont utilisées.','Galeries du modèle séparées des images du coloris exact. Aucune image recolorée ni dupliquée pour remplir artificiellement le seuil.','Prix fournisseurs USD observés hors port/taxes; aucun prix de vente déduit ou approuvé ici.'], 'products':products}
(ROOT/'cj-expanded-2026-10-25.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
(ASSETS/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'models':len(products),'galleryUrls':len(manifest),'withAtLeast2ColorLabels':sum(len(p['colors'])>=2 for p in products),'fullyMeetsPhotoRequirement':0},ensure_ascii=False))
print(json.dumps([{'id':p['supplierProductId'],'name':p['nameOriginal'],'colors':[x['name'] for x in p['colors']],'sizes':p['sizes'],'price':p['price']['observedText']} for p in products],ensure_ascii=False,indent=2))
