import json
import re
from pathlib import Path

base = Path(__file__).resolve().parent
bedding = json.loads((base / 'alibaba-bedding-evidence.json').read_text(encoding='utf-8-sig'))
linen = json.loads((base / 'alibaba-linen-evidence.json').read_text(encoding='utf-8-sig'))

category_map = {
    'housses-de-couette': 'housses-couette', 'taies-oreiller': 'taies',
    'taies-oreillers': 'taies', 'draps-housses': 'draps',
    'housses-coussins': 'housses', 'coussins-et-housses': 'coussins',
    'garnissages-coussins': 'coussins',
}
color_fr = {
    'White': 'Blanc', 'Pink': 'Rose', 'Black': 'Noir', 'Brown': 'Marron',
    'Dark brown': 'Marron foncé', 'Khaki': 'Kaki', 'Yellow': 'Jaune',
    '01lavender': '01 lavande', '02Light pink': '02 rose clair', '04Ivory': '04 ivoire',
    '06Light blue': '06 bleu clair', '07Light green': '07 vert clair', '08Purple': '08 violet',
}
name_overrides = {
    '1601070472662': 'Taie à fermeture éclair',
    '1601564961499': 'Parure de draps quatre pièces',
    '1601521930949': 'Parure jacquard quatre pièces',
    '1600901588050': 'Oreiller à dimensions sur mesure',
    '1601816193307': 'Oreiller 48 × 74 cm',
    '1601710942064': 'Taie bleu clair 50 × 75 cm',
    '1601425929295': 'Housse de coussin unie',
    '1601524493215': 'Housse de coussin à texture douce',
    '1600456299693': 'Housse de coussin à pompons',
    '1601420936444': 'Garnissage de coussin',
    '1600663621616': 'Plaid grosse maille',
    '1601024896360': 'Drap-housse Cloudland',
    '1600317900242': 'Taie d’oreiller Yasha',
    '1601563999505': 'Taie d’oreiller rayée',
    '12000003344865': 'Taie d’oreiller rayée à rabat',
    '1600774859826': 'Serviette blanche — plusieurs formats',
    '1601723803318': 'Serviette mains blanche',
    '1600911117672': 'Couvre-lit matelassé',
}
descriptions = {
    '1600241398988': 'Parure polaire comprenant une housse de couette et deux taies, proposée par Shaoxing Skyline.',
    '1601070472662': 'Taie à fermeture éclair, présentée en soie de mûrier par son fournisseur. Composition et livraison à confirmer.',
    '1601564961499': 'Ensemble composé d’un drap plat, d’un drap-housse et de deux taies, proposé en un format King détaillé par le fournisseur.',
    '1601688153742': 'Taie en satin de polyester proposée en sachet d’une pièce. Le nuancier reste à préciser.',
    '1601248538962': 'Parure en velours comprenant une housse de couette, un drap et deux taies. Le type de drap et le minimum de commande demandent confirmation.',
    '1601521930949': 'Parure à motif jacquard comprenant une housse de couette, un drap et deux taies. Dimensions exactes et composition à confirmer.',
    '1601451040881': 'Ensemble avec couette garnie et taie ou taies selon le format sélectionné. Les dimensions sont conservées telles qu’affichées par le fournisseur.',
    '1601080870169': 'Parure rayée comprenant une housse de couette et deux taies, sans couette garnie ni drap.',
    '1600901588050': 'Oreiller avec enveloppe déclarée en coton et garnissage déclaré en polyester. Le fournisseur présente un seul choix combinant plusieurs dimensions sur mesure.',
    '1601816193307': 'Oreiller 48 × 74 cm avec enveloppe déclarée en coton et garnissage déclaré en microfibre polyester. Le nombre de pièces par sac reste inconnu.',
    '1601710942064': 'Taie bleu clair 50 × 75 cm proposée sous la marque Gipetex par un fournisseur situé en Italie selon sa fiche.',
    '1601393545708': 'Housse de coussin à texture côtelée repérée chez Shaoxing Yuanqi. Dimensions, couleurs et conditions de livraison restent à vérifier.',
    '1601425929295': 'Housse de coussin unie repérée chez Yiwu Leshang. Le titre mentionne 45 × 45 cm, sans variante de commande actuellement vérifiée.',
    '1601524493215': 'Housse de coussin à texture douce. La nature de la matière mentionnée dans le titre fournisseur reste ambiguë.',
    '1600456299693': 'Housse de coussin à pompons. Le titre mentionne un format 45 × 45 cm et deux couleurs, encore à vérifier dans les sélecteurs.',
    '1601063679171': 'Coussin uni proposé en housse seule ou avec garnissage selon les libellés indexés. Les variantes et leur stock restent à revérifier sur la fiche courante.',
    '1601420936444': 'Garnissage de coussin proposé par Shaoxing Yuanqi. Les formats cités dans le titre ne sont pas encore vérifiés comme variantes commandables.',
    '1600663621616': 'Plaid à grosse maille proposé en plusieurs formats dans les informations indexées. Composition et options courantes restent à confirmer.',
    '1601024896360': 'Drap-housse proposé sous le nom Cloudland. Dimensions, hauteur de bonnet et contenu du lot restent à confirmer.',
    '1600317900242': 'Taie d’oreiller Yasha dont la composition, le minimum de commande et les variantes restent à confirmer.',
    '1601563999505': 'Taie d’oreiller rayée blanche. Le titre indique 50 × 80, sans unité ni variante de commande vérifiées.',
    '12000003344865': 'Taie d’oreiller rayée à rabat. Le titre mentionne 50 × 70 cm et du coton ; composition et variantes restent à confirmer.',
    '1600774859826': 'Serviette blanche proposée en plusieurs formats dans les informations indexées. Le minimum affiché de 500 pièces ne convient pas à un achat au fil des ventes.',
    '1601723803318': 'Serviette blanche sélectionnée en format 35 × 75 cm sur la fiche fournisseur. Le minimum de commande présente une contradiction.',
    '1600911117672': 'Couvre-lit matelassé présenté en ensemble. Dimensions, couleurs et contenu exact restent à confirmer.',
}
materials_fr = {
    '1600241398988': 'Composition déclarée : 100 % polyester.',
    '1601070472662': 'Composition déclarée : 100 % soie ; marque fournisseur Yashasilk.',
    '1601564961499': 'Composition déclarée : fibre de bambou ; composition textile et certification à vérifier.',
    '1601688153742': 'Composition déclarée : 100 % polyester. Le satin désigne ici le tissu, pas de la soie.',
    '1601248538962': 'Velours de polyester déclaré ; marque fournisseur Petercat’s Home.',
    '1601521930949': 'Lyocell et coton mentionnés ; proportions non indiquées.',
    '1601451040881': 'Enveloppe déclarée en coton à faible densité ; garnissage polyester ; option affichée 250 g/m².',
    '1601080870169': 'Microfibre et tissu satin mentionnés ; sans garnissage ; marque fournisseur Yovepii.',
    '1600901588050': 'Enveloppe déclarée 100 % coton ; garnissage déclaré 100 % fibres polyester.',
    '1601816193307': 'Enveloppe déclarée 100 % coton ; garnissage déclaré en microfibre polyester.',
    '1601710942064': 'Composition déclarée 100 % coton ; marque Gipetex ; origine Italie déclarée par le fournisseur.',
    '1600456299693': 'Lin et coton cités dans le titre ; proportions non confirmées.',
    '1601063679171': 'Polyester déclaré pour la housse ; fibres polyester déclarées pour le garnissage.',
    '1600663621616': 'La composition est contradictoire : chenille, polyester et laine apparaissent dans les informations fournisseur.',
    '1601024896360': 'Coton et coton égyptien cités dans le titre ; origine de la fibre non vérifiée.',
    '1600317900242': 'Composition contradictoire : attribut 100 % soie, titre mentionnant soie et Tencel sur deux faces.',
    '1601563999505': 'Coton cité dans le titre ; proportion non confirmée.',
    '12000003344865': 'Coton et satin rayé cités dans le titre ; proportion non confirmée.',
    '1600774859826': 'Coton et 600 g/m² cités dans le titre ; attribut de grammage 500–699 g/m². Valeur exacte par variante à confirmer.',
    '1601723803318': '100 % coton déclaré ; attribut de grammage 500–699 g/m².',
    '1600911117672': 'Coton biologique cité dans le titre uniquement ; aucune certification vérifiée.',
}
bedding_questions = {
    '1600241398988': ['Coût livré à revalider par taille et couleur ; transport affiché élevé.', 'Accord d’expédition directe à l’unité et adresse de retour.'],
    '1601070472662': ['Frais et délai de livraison France.', 'Composition, marque et droit de revente sans réétiquetage.', 'Ne pas reprendre les promesses antibactériennes ou thérapeutiques sans preuve.'],
    '1601564961499': ['Dimensions du drap-housse incompatibles avec certains matelas français ; vérifier la cible.', 'Composition textile exacte et absence de preuve de certification biologique.', 'Coût livré France élevé ; minimum 350–400 lots pour une couleur personnalisée.'],
    '1601688153742': ['Le sélecteur « colors choice » ne définit aucune couleur : obtenir un nuancier avec codes.', 'Frais et délai de livraison France.'],
    '1601248538962': ['Minimum contradictoire : commande à partir de 1 lot, mais attributs et description à 5 lots.', 'Titre drap-housse, type sélectionné drap plat : confirmer le contenu.', 'Plusieurs libellés couleur sont ambigus ou similaires : conserver les codes et vérifier les photos.', 'Le format 220 × 240 cm cité dans le descriptif n’est pas confirmé dans le sélecteur.'],
    '1601521930949': ['Dimensions exactes de King et Queen.', 'Proportions de lyocell et coton.', 'Le vert cité dans le titre n’est pas une couleur sélectionnable.'],
    '1601451040881': ['Prix livré par variante et nombre exact de pièces.', 'Formats non standard en France ; ne pas les convertir en tailles françaises.', 'Composition et grammage par variante.'],
    '1601080870169': ['Composition textile et dimensions exactes des taies.', 'Correspondance entre codes couleur et photographies.', 'L’expédition directe est citée dans le titre mais ses conditions restent à confirmer.', 'Transport, taxes et coût total par variante.'],
    '1600901588050': ['Un seul libellé de dimension sur mesure regroupe trois formats : aucun format indépendant en stock n’est confirmé.', 'Cinq autres couleurs ne sont pas détaillées ; ne pas les inventer.', 'Prix livré et faisabilité d’une unité sur mesure.'],
    '1601816193307': ['Unité contradictoire : prix par sac et attribut à la pièce ; nombre d’oreillers par sac inconnu.', 'Poids de colis 10 kg incohérent avec poids produit 0,5–1 kg : clarifier le transport.', 'Ne pas reprendre les allégations médicales ou antibactériennes.'],
    '1601710942064': ['Frais, délais et adresse de retour France.', 'Marque Gipetex : vérifier l’autorisation de revente, sans réétiquetage Moon & Pillow.', 'Fournisseur et origine Italie déclarés, non audités.'],
}

def numeric_id(p):
    return p.get('supplierProductId') or re.search(r'(\d+)$', p['id']).group(1)

def item(label, verified, source):
    return {'label': label, 'verified': verified, 'source': source}

def translated_size(label):
    return label.replace('(Single pillowcase)', '(housse seule)').replace('(Pillow case+pillow core)', '(housse + garnissage)')

products = []
seen = set()
for data, origin in ((bedding, 'bedding'), (linen, 'linen')):
    for p in data['products']:
        num = numeric_id(p)
        if num in seen:
            continue
        seen.add(num)
        verified_browser = origin == 'bedding'
        if verified_browser:
            sizes = [item(x, True, 'Sélecteur de la fiche consultée en navigateur') for x in p.get('sizesExact', [])]
            colors = [item(x, True, 'Sélecteur de la fiche consultée en navigateur') for x in p.get('colorsExact', []) if x.casefold() != 'colors choice']
        else:
            sizes = [item(translated_size(x['label']), x.get('source') == 'listing_current_selection', x.get('source', 'Non précisé')) for x in p.get('dimensions', [])]
            sizes.extend(item(x, False, 'Titre ou libellé générique ; dimension non vérifiée') for x in p.get('size_labels_only', []))
            colors = [item(color_fr.get(x['label'], x['label']), x.get('source') == 'listing_current_selection', x.get('source', 'Non précisé')) for x in p.get('colors', []) if x['label'].casefold() != 'colors choice']
        moq_raw = p.get('moq') or {}
        moq_conflict = moq_raw.get('conflict') or p.get('moq_conflict')
        if num == '1601723803318':
            moq_conflict = 'Descriptif : 10 ensembles ; encart de commande : 20 pièces.'
        moq = {'quantity': moq_raw.get('quantity'), 'unit': moq_raw.get('unit'), 'conflict': moq_conflict}
        cost = p.get('supplierPrice') or p.get('supplier_price') or {}
        cost = {'currency': cost.get('currency'), 'min': cost.get('min'), 'max': cost.get('max'), 'tier': cost.get('tier') or cost.get('tier_details'), 'approved': False, 'landedCostVerified': False}
        ship = p.get('shippingFrance') or p.get('france_shipping')
        shipping = None if not ship else {
            'currency': ship.get('currency'), 'amount': ship.get('amount'),
            'quantity': ship.get('quantity'), 'unit': ship.get('unit'),
            'displayedWindow': ship.get('displayedWindow'), 'verified': False,
            'noteFR': 'Estimation affichée pour la variante sélectionnée par défaut ; coût livré complet, taxes et disponibilité non confirmés.'
        }
        questions = bedding_questions.get(num, p.get('open_questions', [])).copy()
        if not shipping:
            questions.append('Coût complet livré en France et délai par variante non validés.')
        if not sizes:
            questions.append('Dimensions de produit et variantes commandables à obtenir.')
        if not colors:
            questions.append('Couleurs et codes des variantes commandables à obtenir.')
        if moq.get('quantity') and moq['quantity'] > 1:
            questions.append('Minimum supérieur à une unité : achat au fil des ventes impossible sans accord fournisseur spécifique.')
        if moq_conflict:
            questions.append('Clarifier la contradiction sur le minimum et l’unité de commande avant toute vente.')
        questions.extend(['Combinaisons taille/couleur et stock non confirmés.', 'Accord d’expédition directe au client, retours et droit de réutilisation des photos non validés.'])
        details = []
        if num in materials_fr:
            details.append(materials_fr[num])
        if p.get('includedComponents'):
            details.append('Contenu indiqué par le fournisseur : ' + p['includedComponents'].replace('1 flat sheet+1 fitted sheet+2 pillowcases', '1 drap plat + 1 drap-housse + 2 taies').replace('selected sheet type Flat Bed Sheet', 'type sélectionné : drap plat').replace('no sheet', 'sans drap'))
        if num == '1600901588050':
            details.append('Un seul choix fournisseur : « 45*75cm, 50*70cm ou 50*75cm sur mesure ».')
        if p.get('supplierCountry'):
            details.append('Pays du fournisseur indiqué sur la fiche : ' + p['supplierCountry'] + '.')
        image = (p.get('imageUrls') or [p.get('image_url')])[0]
        result = {
            'id': 'alibaba-' + num, 'supplierProductId': num,
            'nameFR': name_overrides.get(num) or p.get('displayNameDraft') or p.get('working_name_fr'),
            'category': category_map.get(p['category'], p['category']),
            'status': 'draft', 'readyForSale': False, 'sizes': sizes, 'colors': colors,
            'supplier': p['supplier'], 'url': p['url'], 'moq': moq, 'cost': cost,
            'shipping': shipping, 'descriptionFrench': descriptions[num],
            'detailsFrench': details, 'openQuestionsFR': list(dict.fromkeys(questions)),
            'imageUrl': image, 'imageRightsApproved': False,
            'checkedAt': '2026-10-24',
            'evidenceLevel': 'Sélecteurs consultés en navigateur sur la fiche courante' if verified_browser else p.get('evidence_level'),
            'sourceFiles': ['work/alibaba-' + origin + '-evidence.json'],
        }
        if num == '1600901588050':
            result['sourceFiles'].append('work/alibaba-linen-evidence.json')
            result['deduplicationNoteFR'] = 'Conflit de prix avec un résultat indexé en USD : priorité au relevé courant de la fiche navigateur en EUR. Aucun prix livré validé.'
        products.append(result)

allowed = {'housses','plaids','ensembles','housses-couette','couettes','oreillers','taies','draps','coussins','serviettes','couvre-lits'}
assert len(products) == 25 and len({p['id'] for p in products}) == 25
assert all(p['category'] in allowed for p in products)
assert all(p['status'] == 'draft' and not p['readyForSale'] for p in products)
assert all('colors choice' not in [c['label'] for c in p['colors']] for p in products)
custom = next(p for p in products if p['id'] == 'alibaba-1600901588050')
assert len(custom['sizes']) == 1

out = {
    'schemaVersion': 1, 'checkedAt': '2026-10-24', 'market': 'France',
    'status': 'draft', 'products': products,
    'notesFR': [
        '25 modèles distincts ; doublon 1600901588050 fusionné en privilégiant le relevé navigateur courant.',
        'verified indique seulement qu’un libellé a été observé dans un sélecteur courant. Cela ne confirme ni stock, ni combinaison taille/couleur, ni expédition à l’unité.',
        'Les libellés issus seulement du titre ou d’une fiche indexée au détail inaccessible sont conservés avec verified:false ; ils ne constituent pas des variantes vendables.',
        'Tous les produits restent en brouillon, sans prix de vente. Coûts fournisseurs indicatifs dans leur devise d’origine, sans conversion.',
        'Les libellés fournisseur ambigus restent littéraux ; aucune taille française, couleur, combinaison ou photo de remplacement inventée.',
    ],
}
(base / 'catalog-normalized.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'models': len(products), 'verifiedSizes': sum(sum(x['verified'] for x in p['sizes']) for p in products), 'verifiedColors': sum(sum(x['verified'] for x in p['colors']) for p in products), 'images': sum(bool(p['imageUrl']) for p in products), 'moqOneWithoutConflict': sum(p['moq']['quantity']==1 and not p['moq']['conflict'] for p in products)}, ensure_ascii=False))
