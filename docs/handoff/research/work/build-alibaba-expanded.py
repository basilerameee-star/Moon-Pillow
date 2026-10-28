import json, pathlib, re, unicodedata
root=pathlib.Path(__file__).resolve().parent
base=json.loads((root/'catalog-expanded.json').read_text(encoding='utf-8'))['products']
prior=json.loads((root/'alibaba-assets/manifest.json').read_text(encoding='utf-8'))['images']
manifest_path=root/'alibaba-expanded-assets/manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
source_gallery=json.loads((root/'alibaba-gallery-urls-2026-10-25.json').read_text(encoding='utf-8'))
lookup={(r['group'],r['index']):r for r in manifest['images']}
prior_lookup={r['id'].replace('ali-','alibaba-'):r for r in prior}
def slug(s):
    return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def img(group,index,kind='lifestyle',evidence=None):
    r=lookup[(group,index)]
    return {'url':r['url'],'localpath':r['localpath'],'kind':kind,'evidence':evidence or 'Photographie de la galerie officielle, relevée dans une copie publique indexée de la fiche et inspectée visuellement le 25 octobre 2026.','rightsApproved':False,'visuallyInspected':True}
products=[]
for old in base:
    if not old['id'].startswith('alibaba-'): continue
    p={
      'id':old['id'],'source':'Alibaba','supplierProductId':old['supplierProductId'],
      'sourceUrl':old['url'],'supplier':old.get('supplier'), 'nameFR':old['nameFR'],
      'category':old['category'],'descriptionFrench':old.get('descriptionFrench',''),
      'materials':old.get('detailsFrench',[]),'sizes':[v['label'] for v in old.get('sizes',[])],
      'colors':[{'id':f"{slug(v['label'])}-{i+1}",'name':v['label'],'images':[],'evidence':v.get('source','Relevé antérieur')} for i,v in enumerate(old.get('colors',[]))],
      'gallery':[], 'price':{'currency':old['cost'].get('currency'),'min':old['cost'].get('min'),'max':old['cost'].get('max'),'basis':old['cost'].get('tier') or 'Prix fournisseur indicatif du relevé du 24 octobre 2026, hors coût livré non confirmé ; ce n’est pas un prix public de vente.','evidenceUrl':old['url'],'checkedAt':old.get('checkedAt'),'approved':False},
      'moq':old.get('moq'),'shippingNote':old.get('shipping',{}),'uncertainties':old.get('openQuestionsFR',[])+['La liste des tailles et couleurs ne prouve ni les combinaisons disponibles ni le stock.','L’accès actuel à Alibaba est arrêté par une vérification CAPTCHA ; aucun nouveau relevé en session connectée.'],
      'readyForSale':False,'newModel':False,'evidenceCheckedAt':old.get('checkedAt'),
      'photoRightsApproved':False,'minimumTwoColorsThreePhotosEachVerified':False
    }
    oldphoto=prior_lookup.get(p['id'])
    if oldphoto:
        photo={'url':oldphoto['url'],'localpath':oldphoto['localpath'],'kind':'lifestyle','evidence':oldphoto.get('descriptionFr'),'rightsApproved':False,'visuallyInspected':oldphoto.get('visualVerified',False),'commercialGalleryRecommended':oldphoto.get('privatePreviewRecommended',False)}
        p['gallery']=[photo]
        p['uncertainties']+=oldphoto.get('caveats',[])
        if p['id']=='alibaba-1600241398988':
            next(c for c in p['colors'] if c['name']=='Rose')['images']=[photo]
    products.append(p)
velvet=next(p for p in products if p['id']=='alibaba-1601248538962')
velvet['gallery']=[img('velvet',i) for i in range(1,7)]
mapping=[('Rouge',7,[3]),('Pourpre',8,[]),('Poudre pour la peau',9,[6]),('Jaune',10,[]),('rose profond',11,[]),('rose',12,[2]),('PU ciel',13,[])]
for name,variant_index,extra in mapping:
    colour=next(c for c in velvet['colors'] if c['name']==name)
    colour['images']=[img('velvet',variant_index,'variant',f'Vignette explicitement libellée {name} dans le sélecteur fournisseur ; copie publique indexée de la fiche. Les libellés fournisseur sont conservés.')]
    colour['images'] += [img('velvet',i,evidence='Vue supplémentaire de la galerie : correspondance visuelle de teinte et de modèle avec la vignette explicite, inspectée le 25 octobre 2026. Aucun recoloriage ni vue fabriquée.') for i in extra]
    if name=='rose':
        colour['images'][1]['possibleDuplicateOfVariant']=True
        colour['images'][1]['countsAsDistinctPhoto']=False
        colour['uncertainty']='La vue de galerie et la vignette semblent utiliser la même prise de vue ; ne pas compter comme deux photos distinctes.'
deepblue=next(c for c in velvet['colors'] if c['name']=='Deep blue')
deepblue['images']=[img('velvet',1,evidence='Deux vues bleu nuit de la galerie ; libellé Deep blue confirmé dans le sélecteur antérieur. Correspondance visuelle, stock et commande du SKU à confirmer.'),img('velvet',5,evidence='Deuxième vue bleu nuit observée dans la galerie, même modèle ; correspondance visuelle, pas de preuve de stock.')]
deepblue['mappingNeedsSupplierConfirmation']=True
velvet['gallery'] += [img('velvet',i,'variant') for i in range(7,14)]
velvet['additionalSizeEvidence']=[{'label':'200 × 230 cm — housse, drap 230 × 250 cm, 2 taies 48 × 74 cm','status':'description fournisseur, format déjà sélectionnable 200×230 cm'},{'label':'220 × 240 cm — housse, drap 230 × 250 cm, 2 taies 48 × 74 cm','status':'description fournisseur seulement, pas confirmé au sélecteur : ne pas ajouter comme variante achetable'}]
velvet['secondaryPriceObservations']=[{'currency':'USD','amount':16,'quantityBasis':'1–99 lots','sourceUrl':velvet['sourceUrl'],'evidence':'Copie publique indexée il y a cinq mois ; valeur historique, ne remplace pas le relevé EUR du 24 octobre 2026.'}]
velvet['uncertainties']+=['Aucun coloris ne dispose de trois vues distinctes confirmées.','Les 13 images sont 6 vues de galerie et 7 vignettes, pas 13 vues d’une seule couleur.','Les vues peuvent montrer des coussins de mise en scène supplémentaires ; le contenu fournisseur reste une housse de couette, un drap et deux taies.']
towel=next(p for p in products if p['id']=='alibaba-1601723803318')
towel['rejectedGallery']=[dict(img('towel',i),commercialGalleryRecommended=False,reason='Marques de clients, personnalisation de logo, montage promotionnel ou capture d’avis : impropre à illustrer une serviette Moon & Pillow vendue sans ces éléments.') for i in range(1,7)]
towel['uncertainties']+=['La galerie supplémentaire entière a été inspectée et exclue de la galerie commerciale : logos et contenus de personnalisation.','La description mentionne gris, rose, bleu et fabrication sur mesure ; seul Blanc est confirmé au sélecteur. Ne pas ajouter ces teintes comme variantes à l’unité.']
for row in manifest['images']:
    row['visuallyInspected']=True
    row['rightsApproved']=False
    row['commercialGalleryRecommended']=row['group']=='velvet'
    row['noteFR']='Photographie réelle du modèle inspectée ; droits, SKU et stocks non confirmés.' if row['group']=='velvet' else ('Galerie rejetée : logos de clients ou documentation de personnalisation.' if row['group']=='towel' else 'Piste exclue : incohérence entre photos de jupe de lit et attributs de couette/coton ; trois prises de vue réutilisées comme vignettes, pas trois vues par couleur.')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
result={
 'checkedAt':'2026-10-25',
 'sourceNotes':['25 modèles Alibaba existants normalisés ; aucune multiplication des tailles ou couleurs en modèles distincts.','Nouvelles galeries issues de fiches officielles Alibaba dans des copies publiques indexées. La fiche active dans le navigateur est bloquée par un CAPTCHA, qui n’a pas été résolu ni contourné.','13 photos et vignettes réelles utiles sur la parure velours, toutes inspectées ; elles ne valident pas 3 vues distinctes pour chaque teinte.','Aucune nouvelle référence ne satisfait complètement MOQ1 récurrent + 2 couleurs + 3 photos uniques par couleur + coût livré + droits images. Aucun produit nouveau n’a été ajouté au catalogue marchand par cet agent.','Prix fournisseurs indicatifs conservés avec devises et dates. Aucun prix public de vente inventé, aucun accord de coût ni de stock reçu.'],
 'products':products,
 'excludedCandidates':[{'supplierProductId':'1601514865637','source':'Alibaba','sourceUrl':'https://www.alibaba.com/product-detail/Wholesale-Luxury-Duvet-Bedding-Set-King_1601514865637.html','nameFR':'Parure avec jupe de lit — contenu à confirmer','category':'draps','price':{'currency':'USD','min':4.60,'max':9.20,'basis':'Quantité minimum annoncée 1 lot, prix non livré et variante non définie'},'moq':{'quantity':1,'unit':'lot','recurrentDropshippingConfirmed':False},'colors':[{'id':'supplier-1','name':'1','images':[img('newParure',4,'variant')]},{'id':'supplier-2','name':'2','images':[img('newParure',5,'variant')]}],'gallery':[img('newParure',i) for i in [1,2,3,6]],'uncertainties':['Fiche présentée comme Comforter Set 100% Cotton, photos montrant une housse à volant/jupe de lit sans couette identifiable.','Dimensions seulement personnalisables, aucune taille de vente vérifiée.','Délais annoncés 31 jours de production pour 1–50 lots, hors transport.','Couleurs numérotées sans correspondance de nom ; les trois vues principales sont des couleurs différentes, pas trois vues d’un coloris.','Prix fournisseur actuel, contenu, stock, expédition au client et droits photos non confirmés.'],'exclusionReason':'Contenu produit et variantes non qualifiés, esthétique et délai peu compatibles avec le lancement envisagé.','readyForSale':False}],
 'counts':{'existingModels':len(products),'additionalModelsApprovedForImport':0,'newUsefulPhotos':13,'rejectedTowelImages':6,'rejectedNewCandidateImages':6,'modelsMeetingFullRequestedPhotoMinimum':0}
}
(root/'alibaba-expanded-2026-10-25.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result['counts']))
