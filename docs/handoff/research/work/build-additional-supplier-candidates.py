import concurrent.futures,json,pathlib,urllib.request

ROOT=pathlib.Path(__file__).resolve().parent
aw=json.loads((ROOT/'aw-public-structured.json').read_text(encoding='utf-8'))
by_sku={r['sku']:r for r in aw}
AW_POLICY='https://www.aw-dropship.eu/shipping'
CJ_POLICY='https://eur.cjdropshipping.com/help-center?faqType=2&navType=faq&scrollToNum=400'
common_questions=[
    'Vérifier le stock réellement commandable et le prix du SKU au moment de la commande.',
    'Obtenir le coût livré en France, TVA et frais éventuels compris, pour une seule unité.',
    'Confirmer les conditions de retour et la licence de réutilisation des photos avant publication commerciale.',
    'Approuver le coût livré et le prix de vente avant toute activation du paiement.'
]
names={
 'CICC-20':'Housse de coussin Diamonds moutarde',
 'CICC-19':'Housse de coussin Marigold tissée',
 'CICC-18':'Housse de coussin Soft Stone',
 'CICC-17':'Housse de coussin Geo crème',
 'CICC-16':'Housse de coussin Knot à reliefs',
 'CICC-15':'Housse de coussin Rainbow tissée',
 'CICC-14':'Housse de coussin Squares bordeaux',
 'CICC-13':'Housse de coussin Tribal géométrique',
 'CICC-12':'Housse de coussin Stripes multicolore',
 'CICC-11':'Housse de coussin Swirl rétro',
 'HIT-06':'Plaid indigo Namoona Waves',
 'HIT-05':'Plaid indigo Seedha Arrows',
 'HIT-04':'Plaid indigo Desi Stripes',
 'HIT-03':'Plaid indigo Midnight Heerak',
 'HIT-02':'Plaid indigo Chhota Flower',
 'HIT-01':'Plaid indigo Kasba Tiles',
 'BOHOT-04':'Plaid coton Ruby bicolore',
 'BOHOT-01':'Plaid coton Boho à petit motif tissé',
 'BOHOT-06':'Plaid coton Mattala à rayures',
 'BOHOT-03':'Plaid coton Regency',
 'BOHOT-02':'Plaid coton Geometric'
}
color_labels={
 'CICC-20':'Moutarde et écru', 'CICC-19':'Jaune souci', 'CICC-18':'Beige pierre',
 'CICC-17':'Crème', 'CICC-16':'Neutre à rayures et nœuds',
 'CICC-15':'Neutre à fils multicolores','CICC-14':'Bordeaux',
 'CICC-13':'Motif géométrique multicolore','CICC-12':'Rayures roses, orange et multicolores',
 'CICC-11':'Moutarde, rouille et gris','BOHOT-04':'Rouge rubis et crème',
 'BOHOT-06':'Crème, doré et gris foncé','BOHOT-03':'Noir et beige','BOHOT-02':'Gris'
}

def aw_variant(r):
    return {
       'supplierSku':r['sku'], 'url':r['url'],
       'sizeLabel':r['properties'].get('dimensions'),
       'sourceColorLabel':color_labels.get(r['sku'],'Bleu indigo' if r['sku'].startswith('HIT') else r['name'].split(' - ')[-1]),
       'imageUrl':r['imageUrls'][0], 'imageLocalPath':r['imageLocalPath'],
       'unitPriceEvidence':{
          'min':float(r['offer']['price']), 'max':float(r['offer']['price']),
          'currency':r['offer']['priceCurrency'], 'basis':'Balisage public Product/Offer de la fiche fournisseur; prix masqué dans l’interface hors connexion.',
          'approved':False, 'includesShipping':False, 'includesVAT':False,
          'observedIn':'JSON-LD Product/Offer', 'sourceUrl':r['url']
       }
    }

records=[]
for sku,name in names.items():
    r=by_sku[sku]
    category='housses-coussins' if sku.startswith('CICC') else 'plaids'
    size=r['properties'].get('dimensions')
    variants=[aw_variant(r)]
    if sku=='BOHOT-01':
        # Regroupement prudent : deux couleurs/petits tissages voisins, aucun gonflement du nombre de modèles.
        variants.append(aw_variant(by_sku['BOHOT-05']))
        variants[0]['sourceColorLabel']='Navy Zigzag'
        variants[1]['sourceColorLabel']='Charcoal'
    colors=[{'label':v['sourceColorLabel'],'verified':True,
             'evidence':'Coloris ou motif décrit dans le texte produit et associé à la photo du SKU; disponibilité commerciale non vérifiée.'}
            for v in variants]
    records.append({
        'id':'aw-'+sku.lower(), 'nameFR':name, 'category':category,
        'supplier':'AW Dropship Europe','url':r['url'],
        'sourceEvidenceFR':f"Fiche publique {sku}; dimensions {size}; conditionnement annoncé à l’unité. Prix de compte, stock et coût livré non vérifiés.",
        'sizes':[{'label':size.replace(' (cm)',' cm'),'verified':True,'sourceUrl':r['url']}],
        'colors':colors,
        'moqquantity':1,
        'moqEvidenceFR':'Titre 1x et règle générale AW : pas de minimum de commande export. Frais de petite commande de 1 € + TVA si valeur produits inférieure à 3 €; stock/SKU à revérifier.',
        'moqSourceUrl':AW_POLICY,
        'costmin':None,'costmax':None,'currency':None,
        'unitPriceEvidence':variants[0]['unitPriceEvidence'],
        'materialEvidence':r['properties'].get('ingredients'),
        'imageUrl':r['imageUrls'][0],'imageLocalPath':r['imageLocalPath'],
        'galleryImageUrls':r['imageUrls'],'photoAssociationFR':f"Image déclarée par le fournisseur dans Product.image de la fiche {sku}; aucune recoloration ni remplacement.",
        'variants':variants,'checkedAt':'2026-10-25', 'qualifiedForSale':False,
        'openQuestionsFR':common_questions.copy()
    })

cj_items=[
 {
  'id':'cj-flannel-solid', 'nameFR':'Plaid polaire uni', 'category':'plaids',
  'url':'https://cjdropshipping.com/product/flannel-sheets-solid-blanket-p-A1CDE1BA-8380-4606-8D74-353616C822E8.html',
  'sku':'CJJJJFCZ00025-Green-150x200',
  'sourceEvidenceFR':'Fiche CJ publique : polyester; tailles listées 150×200, 180×200, 200×230, 100×150 et 70×100. Le coloris sélectionné porte le nom Green; autres noms de couleur non récupérés.',
  'sizes':['150×200 cm','180×200 cm','200×230 cm','100×150 cm','70×100 cm'],
  'colors':['Green'], 'material':'Polyester', 'price':(2.57,7.33),
  'imageUrl':'https://cc-west-usa.oss-accelerate.aliyuncs.com/15874848/2896586012240.jpg',
  'questions':['Vérifier la correspondance exacte photo/couleur et chaque combinaison taille–couleur; le sélecteur public ne prouve pas le stock.']
 },
 {
  'id':'cj-suede-cushion-cover','nameFR':'Housse de coussin effet suédine','category':'housses-coussins',
  'url':'https://cjdropshipping.com/product/household-products-solid-color-candy-pillow-p-A9BF8C90-4082-4131-A83C-2AA072723560.html',
  'sku':'CJJJJFKD00575-White-40X60cm',
  'sourceEvidenceFR':'Fiche CJ publique : housse en polyester; 11 options dimension/lot listées. White est la couleur sélectionnée. La liste inclut une option 45×45 en lot de 2 à distinguer de la pièce unique.',
  'sizes':['40×60 cm','55×55 cm','35×50 cm','30×45 cm','70×70 cm','45×45 cm — lot de 2','50×50 cm','60×60 cm','40×40 cm','65×65 cm','45×45 cm'],
  'colors':['White'], 'material':'100 % polyester', 'price':(0.99,2.40),
  'imageUrl':'https://cf.cjdropshipping.com/20200707/1674191289511.jpg',
  'questions':['Vérifier la correspondance exacte photo/couleur et le nombre de pièces de chaque SKU; aucun choix croisé couleur–taille n’a été testé.']
 },
 {
  'id':'cj-satin-pillowcase','nameFR':'Taie unie satinée','category':'taies',
  'url':'https://cjdropshipping.com/product/pillowcase-satin-solid-color-simulation-silk-single-pillowcase-ice-silk-pillowcase-p-F25DF9B2-5E6B-42C9-85FD-B34D55E39822.html',
  'sku':'CJJJJFZT00222-Silver-20x29inches-1PC',
  'sourceEvidenceFR':'Fiche CJ publique : une taie par pièce; dimensions proposées en pouces et 75×50 cm. La composition diffère selon les variantes : polyester ou soie de mûrier selon le texte; aucune promesse soie n’est approuvée.',
  'sizes':['20×29 pouces','20×36 pouces','20×26 pouces','75×50 cm'],
  'colors':['Silver','Grey','Champagne','Beige','Silk white','white','Blue','Pink','Coffee','black'],
  'material':'Polyester / soie de mûrier selon variante, à confirmer', 'price':None,
  'priceNote':'Affichage public 1,25–2,00 $ et autre plage 2,50–17,40 $ sans affectation SKU claire; aucun prix retenu pour le calcul de marge.',
  'imageUrl':'https://cc-west-usa.oss-accelerate.aliyuncs.com/20200307/1836969237760.jpg',
  'questions':['Faire confirmer la composition de chaque SKU, les associations taille–couleur et leur prix; les noms Silk white/Champagne ne suffisent pas à promettre la soie.']
 },
 {
  'id':'cj-solid-four-piece-set','nameFR':'Parure unie quatre pièces — composition à confirmer','category':'housses-couette',
  'url':'https://cjdropshipping.com/product/four-piece-bed-set-solid-color-sanding-washed-cotton-duvet-cover-p-2503020244061618700.html',
  'sku':'CJCS231293601AZ',
  'sourceEvidenceFR':'Fiche CJ : une housse de couette, un drap et deux taies. Le titre dit Cotton, mais le détail matière dit polyester; elle ne doit pas être présentée comme coton. L’option 180×220 porte aussi une unité contradictoire.',
  'sizes':['Housse 150×200 cm','Housse 200×230 cm','Housse 220×240 cm'],
  'colors':['Gemstone Green','Blue Gray','Blue','Sea Salt Blue','Caramel','Mustard Green','Romantic Orange','Streamer Gray','Agate Yellow','Phantom Blue','Monroe Pink','Milk Tea','Cream Blue','Lemon Yellow','Fresh Green','Elegant Pink','Taro Purple'],
  'material':'Polyester indiqué dans le descriptif; contradiction avec le titre Cotton', 'price':(9.78,11.43),
  'imageUrl':'https://cf.cjdropshipping.com/quick/product/9ae60669-c7b2-4f21-8b9b-ed584071eaf1.jpg',
  'questions':['Bloquer la vente jusqu’à confirmation matière, tailles du drap et des taies, dimensions 180×220 (cm/mm contradictoires), et chaque combinaison taille–couleur.']
 }
]

for r in cj_items:
    price=r.get('price')
    records.append({
       'id':r['id'],'nameFR':r['nameFR'],'category':r['category'], 'supplier':'CJdropshipping','url':r['url'],
       'supplierSku':r['sku'],'sourceEvidenceFR':r['sourceEvidenceFR'],
       'sizes':[{'label':s,'verified':True,'sourceUrl':r['url']} for s in r['sizes']],
       'colors':[{'label':c,'verified':True,'evidence':'Libellé dans le sélecteur public CJ; présence dans la liste, sans preuve de stock ni de toutes les combinaisons.'} for c in r['colors']],
       'moqquantity':1,'moqEvidenceFR':'FAQ officielle CJ : commande d’une seule pièce acceptée en dropshipping; chaque SKU, stock et destination restent à confirmer.','moqSourceUrl':CJ_POLICY,
       'costmin':None,'costmax':None,'currency':None,
       'unitPriceEvidence':{'min':price[0] if price else None,'max':price[1] if price else None,'currency':'USD','basis':r.get('priceNote','Plage visible sur la fiche publique; aucune affectation à chaque combinaison SKU.'),'sourceUrl':r['url'],'approved':False,'includesShipping':False,'includesVAT':None},
       'materialEvidence':r['material'], 'imageUrl':r['imageUrl'],
       'photoAssociationFR':'Image reliée par la galerie de la fiche CJ; photo du modèle, affectation exacte à un coloris non validée.',
       'variants':[],'checkedAt':'2026-10-25','qualifiedForSale':False,
       'openQuestionsFR':common_questions+r['questions']
    })

image_dir=ROOT/'additional-supplier-images'
def download_cj(r):
    path=image_dir/(r['id']+'.jpg')
    req=urllib.request.Request(r['imageUrl'],headers={'User-Agent':'Mozilla/5.0'})
    try:
       with urllib.request.urlopen(req,timeout=35) as response:
           body=response.read()
       path.write_bytes(body)
       r['imageLocalPath']=str(path)
       return {'id':r['id'],'bytes':len(body)}
    except Exception as err:
       r['imageLocalPath']=None
       r['openQuestionsFR'].append('La récupération de la photo doit être réessayée ou validée dans le navigateur.')
       return {'id':r['id'],'error':str(err)}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
   images=list(pool.map(download_cj,[r for r in records if r['supplier']=='CJdropshipping']))

assert len(records)==25
assert len({r['id'] for r in records})==25
assert all(r['qualifiedForSale'] is False for r in records)
(ROOT/'additional-supplier-candidates.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'models':len(records),'awModels':sum(r['supplier']=='AW Dropship Europe' for r in records),'awSkus':22,'cjModels':4,'images':images,'saleApproved':0},ensure_ascii=False,indent=2))
