import collections, hashlib, json, pathlib, re, unicodedata
ROOT=pathlib.Path(__file__).resolve().parent

def plain(s):
    return ''.join(c for c in unicodedata.normalize('NFKD',s) if not unicodedata.combining(c)).lower()
def slug(s):return re.sub('[^a-z0-9]+','-',plain(s)).strip('-')
def unique(rows):
    out=[]
    for x in rows:
        if x not in out:out.append(x)
    return out
def dims(s):return re.sub(r'\s*\(cm\)',' cm',s).strip()
shipping_aw='Livraison France tarifée par poids; devis livré, TVA, stock et conditions de compte à confirmer. Aucun abonnement ni achat souscrit.'
shipping_pd='Dropshipping mentionné aux CGV; France métropolitaine sans minimum de commande; délai indicatif fournisseur 3–4 jours ouvrés, frais et contrat à confirmer.'

def aw_models():
    rows=json.loads((ROOT/'specialist-aw-raw.json').read_text(encoding='utf-8'))
    old=json.loads((ROOT/'additional-supplier-candidates.json').read_text(encoding='utf-8'))
    bysku={v['supplierSku'].upper():p for p in old if p.get('supplier')=='AW Dropship Europe' for v in p.get('variants',[])}
    groups=collections.defaultdict(list)
    for r in rows:
        sku=r['sku'].upper()
        if sku.startswith('CICC-'):
            n=int(sku.split('-')[1]);key=f'CICC-{n-20 if n>20 else n:02}'
        elif sku.startswith('VCUSH'):key='VCUSH'
        elif sku in ['BOHOT-01','BOHOT-05']:key='BOHOT-01'
        elif sku.startswith('INNER'):key='INNER'
        elif sku.startswith('LINC'):key='LINC-PALM' if sku in ['LINC-04','LINC-05','LINC-06'] else 'LINC-PLAIN'
        elif sku.startswith('CMC'):
            key='CMC-HAMSA' if 'Hamsa' in r['name'] else 'CMC-LOTUS' if 'Lotus' in r['name'] else 'CMC-TRADITIONAL'
        else:key=sku
        groups[key].append(r)
    out=[]
    for key,variants in groups.items():
        variants.sort(key=lambda r:(r['sku'].upper() not in bysku,r['sku']))
        main=variants[0];prior=bysku.get(main['sku'].upper())
        category='plaids' if key.startswith(('HIT','BOHOT')) else 'couvre-lits' if key.startswith('BWCB') else 'coussins' if key=='INNER' else 'housses-coussins'
        if prior:name=prior['nameFR']
        else:
            stem=re.sub(r'^1x\s+','',main['name'])
            stem=re.sub(r'\s*-?\s*\d+\s*x\s*\d+(?:\s*x\s*\d+)?\s*cm.*','',stem)
            for en,fr in [('Classic Cushion Cover','Housse de coussin'),('Rag Rug Cushion Covers','Housse de coussin tissée'),('Kilim Cushion Cover','Housse de coussin kilim'),('Linen Cushion','Housse de coussin lin'),('Inner Cushion','Garnissage de coussin'),('B&W Double Cotton Bedspread + Wall Hanging','Couvre-lit coton noir et blanc')]:stem=stem.replace(en,fr)
            name=stem
        color_groups=collections.defaultdict(list)
        for r in variants:
            sku=r['sku'].upper()
            if key=='VCUSH':label=r['name'].split(' - ')[-1]
            elif key=='BOHOT-01':label='Bleu marine' if sku=='BOHOT-01' else 'Anthracite'
            elif key.startswith('CICC') and prior:label=prior['colors'][0]['label']
            elif key.startswith('CICC'):label=re.sub(r'^Classic Cushion Cover\s*-\s*','',r['name']).split(' - ')[0]
            elif key.startswith('HIT'):label='Indigo et écru'
            elif key.startswith('BWCB'):label='Noir et blanc'
            elif key=='INNER':label='Blanc'
            elif key.startswith('LINC'):label='Naturel'
            elif key.startswith('CMC'):label='Vert' if key.endswith('HAMSA') else 'Bronze' if key.endswith('LOTUS') else 'Noir'
            else:label=r['name'].split(' - ')[-1]
            color_groups[label].append(r)
        colors=[]
        for label,vs in color_groups.items():
            images=[];seen=set()
            for r in vs:
                for im in r['images']:
                    if im['id'] in seen:continue
                    seen.add(im['id'])
                    images.append({'url':im['url'],'kind':'variant','evidence':f"Galerie publique du SKU {r['sku']}, vue {im['label']}; dimensions source {r['specifications'].get('dimensions') or 'non précisées'}. Association de galerie fournisseur; revue visuelle à effectuer.",
                     'supplierSku':r['sku'],'sourceSize':dims(r['specifications'].get('dimensions') or ''),'sourceUrl':r['url'],'imageId':im['id']})
            colors.append({'id':slug(label),'name':label,'images':images,'associationVerified':False})
        prices=[float(r['price']) for r in variants if r.get('price') is not None]
        sizes=unique([dims(r['specifications'].get('dimensions') or '') for r in variants if r['specifications'].get('dimensions')])
        uncertainty=['Stock, prix du compte professionnel, coût livré et droits de réutilisation des images à confirmer avant vente.','Photos issues de la galerie publique fournisseur; la présence de plusieurs dimensions est documentée dans chaque photo.']
        if len(colors)<2:uncertainty.append('Un seul coloris documenté pour ce modèle; minimum demandé de deux non atteint.')
        if any(len(c['images'])<3 for c in colors):uncertainty.append('Moins de trois photos sources pour au moins un coloris.')
        for r in variants:
            if r['sku'].upper() in ['CICC-08','CICC-09','CICC-10']:uncertainty.append('Dimensions contradictoires entre titre 45x45 cm et fiche technique '+dims(r['specifications']['dimensions'])+'; ne pas annoncer de dimension résolue sans confirmation.')
        out.append({'id':prior['id'] if prior else 'aw-'+slug(key),'source':'AW Dropship Europe','supplierProductId':key,'sourceUrl':main['url'],'nameFR':name,'category':category,
          'descriptionFrench':f'{name}. Dimensions documentées : '+', '.join(sizes)+'. Tarif professionnel, disponibilité et livraison à valider avant commercialisation.',
          'materials':[],'sizes':sizes,'colors':colors,'gallery':[],
          'price':{'currency':'EUR','min':min(prices) if prices else None,'max':max(prices) if prices else None,'basis':'Tarif HT hors livraison exposé dans le JSON public de la fiche; compte professionnel, stock et devis livré non validés.','evidenceUrl':main['url'],'approved':False},
          'moq':1,'shippingNote':shipping_aw,'uncertainties':unique(uncertainty),'variants':variants,'qualifiesRequestedMedia':False})
    return out

def pd_models():
    p=ROOT/'specialist-planete-raw.json'
    if not p.exists():return []
    rows=json.loads(p.read_text(encoding='utf-8'))
    palette=unique([r.get('features',{}).get('Couleur marketing','') for r in rows])
    palette=[c for c in palette if c and plain(c) not in ['multicolore','uni']]
    palette += ['Terre De Sienne','Bleu Marine','Bleu Nuit','Vert Kaki','Bleu Mer','Rose Poudré','Rose Thé','Jaune Moutarde','Bleu Azur','Vert Sauge','Celadon','Céladon','Neige','Sable','Ocre','Aqua','Caramel','Charbon','Ficelle','Lila','Crépuscule','Argent','Lichen','Figue','Bleu Fumé','Tomette','Vert d’eau']
    palette=sorted(unique(palette),key=len,reverse=True)
    groups=collections.defaultdict(list)
    for r in rows:
        if r.get('error'):continue
        name=r['name'];normal=re.sub(r'\b\d+\s*x\s*\d+(?:\s*\+\s*\d+)?(?:\s*x\s*\d+)?\s*(?:cm)?',' ',name,flags=re.I)
        normal=re.sub(r'\b\d+\s*cm\b',' ',normal,flags=re.I)
        normal=re.sub(r'\s+',' ',normal).strip()
        color=r['features'].get('Couleur marketing') or None
        title_color=None
        for c in palette:
            if plain(normal).endswith(' '+plain(c)):
                title_color=normal[len(normal)-len(c):];normal=normal[:-len(c)].strip();break
        r['resolvedColorLabel']=title_color or color
        normal=re.sub(r'\b(carré|rectangulaire)\b','',normal,flags=re.I)
        normal=re.sub(r'\s+',' ',normal).strip()
        material=r['features'].get('Matériaux détail') or r['features'].get('Matériaux') or ''
        thread=r['features'].get('Nombre de fils','')
        density=r['features'].get('Grammage (g/m²)','')
        # Same model is grouped across dimensions and real labelled colour choices;
        # fabric/thread count/pack count remain part of the identity.
        key=plain(normal+'|'+material+'|'+thread+'|'+density)
        r['baseName']=normal
        groups[key].append(r)
    out=[]
    for key,variants in groups.items():
        main=variants[0];name=main['baseName'];np=plain(name)
        if np.startswith('housse de couette'):cat='housses-couette'
        elif 'taie' in np:cat='taies'
        elif np.startswith('drap housse'):cat='draps-housses'
        elif np.startswith('drap plat'):cat='draps'
        elif 'parure' in np:cat='parures'
        elif 'coussin' in np:cat='coussins'
        elif 'oreiller' in np or 'traversin' in np:cat='oreillers'
        elif 'couette' in np:cat='couettes'
        elif any(t in np for t in ['serviette','drap de bain','drap de douche','fouta','gant','poncho','peignoir']):cat='serviettes'
        elif any(t in np for t in ['plaid','couverture','edredon','couvre-lit']):cat='plaids'
        elif any(t in np for t in ['protege','alese','cache sommier']):cat='protections'
        else:continue
        cgroups=collections.defaultdict(list)
        for r in variants:cgroups[r['resolvedColorLabel'] or 'Coloris à confirmer'].append(r)
        colors=[]
        for label,vs in cgroups.items():
            seen=set();images=[]
            for r in vs:
                size=r['features'].get('Dimensions (cm)','')
                for url in r['images']:
                    imageid=re.search(r'/([0-9]+)-thickbox_default/',url)
                    imgkey=imageid.group(1) if imageid else url
                    if imgkey in seen:continue
                    seen.add(imgkey)
                    images.append({'url':url,'kind':'variant','supplierSku':r['sku'],'sourceUrl':r['url'],'sourceSize':size,
                      'evidence':f"Galerie publique de la référence {r['sku']}; coloris '{label}' lu dans le titre ou la fiche technique. Taille source : {size or 'non précisée'}. Revue visuelle à effectuer."})
            colors.append({'id':slug(label),'name':label,'images':images,'associationVerified':False})
        sizes=unique([r['features'].get('Dimensions (cm)') for r in variants if r['features'].get('Dimensions (cm)')])
        materials=unique([r['features'].get('Matériaux détail') or r['features'].get('Matériaux') for r in variants if r['features'].get('Matériaux détail') or r['features'].get('Matériaux')])
        uncertainties=['Prix professionnels réservés au compte validé; aucun devis livré ni stock commandable confirmé.','Licence photo et conditions de compte / expédition à confirmer; aucun compte créé, aucun message envoyé.','Association des photos issue du SKU et du libellé fournisseur; revue visuelle avant affichage comme coloris garanti.']
        if len(colors)<2:uncertainties.append('Un seul coloris documenté pour ce modèle; minimum demandé de deux non atteint.')
        if any(len(c['images'])<3 for c in colors):uncertainties.append('Moins de trois photos sources pour au moins un coloris.')
        if cat=='parures' or np.startswith('lot'):uncertainties.append('Conditionnement fournisseur par lot/parure; ne pas proposer les éléments séparément sans référence fournisseur unitaire.')
        # Different commercial names between title and copy are common here; retain
        # source copy in variants for owner review instead of rewriting its claims.
        short=' '.join([name+'.',('Matière indiquée : '+', '.join(materials)+'.') if materials else '',('Dimensions documentées : '+', '.join(sizes)+'.') if sizes else ''])
        out.append({'id':'pd-'+main['productId'],'source':'Planete Discount','supplierProductId':main['sku'] or main['productId'],'sourceUrl':main['url'],'nameFR':name,'category':cat,'descriptionFrench':short,
          'materials':materials,'sizes':sizes,'colors':colors,'gallery':[],
          'price':{'currency':'EUR','min':None,'max':None,'basis':'Tarifs professionnels non affichés avant connexion à un compte validé; HT et hors livraison.','evidenceUrl':main['url'],'approved':False},
          'moq':1,'shippingNote':shipping_pd,'uncertainties':uncertainties,'variants':variants,'qualifiesRequestedMedia':False})
    return out

if __name__=='__main__':
    aw=aw_models();pd=pd_models();products=aw+pd
    out={'checkedAt':'2026-10-25','sourceNotes':[
      {'source':'AW Dropship Europe','url':'https://www.aw-dropship.eu/homeware/sd-rugs','note':'82 SKU publics lus; vrais objets image identifiés dans le JSON public et regroupement des tailles/couleurs. Galerie ne signifie pas licence commerciale ni validation visuelle.'},
      {'source':'Planete Discount','url':'https://www.planetediscount.eu/content/23-conditions-generales-de-ventes-b2b','note':'CGV : aucun minimum de commande (4.4), vente aux professionnels après validation du compte, dropshipping traité en article6. Tarifs HT hors livraison après connexion. Aucun compte, accord, achat ou contact engagé.'},
      {'source':'Planete Discount','url':'https://www.planetediscount.eu/235-linge-de-lit','note':'Index et catégories publiques; les variantes de taille et de couleur sont regroupées par libellé, matière et densité/conditionnement conservés. Les regroupements restent à contrôler avant vente.'}],
      'products':products}
    (ROOT/'specialist-expanded-2026-10-25.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'awModels':len(aw),'planeteModels':len(pd),'totalModels':len(products),'colors':sum(len(p['colors']) for p in products),'images':sum(len(c['images']) for p in products for c in p['colors']),'with2ColorsAnd3ImagesEach_unreviewed':sum(len(p['colors'])>=2 and all(len(c['images'])>=3 for c in p['colors']) for p in products)},ensure_ascii=False))
