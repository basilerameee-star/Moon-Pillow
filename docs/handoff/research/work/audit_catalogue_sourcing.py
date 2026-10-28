import csv
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs' / 'founder'
OUT.mkdir(parents=True, exist_ok=True)

bedding = json.loads((ROOT / 'work/alibaba-bedding-evidence.json').read_text(encoding='utf-8-sig'))
linen = json.loads((ROOT / 'work/alibaba-linen-evidence.json').read_text(encoding='utf-8-sig'))

def labels(values):
    return [v.get('label', '') if isinstance(v, dict) else v for v in values]

rows = {}
for origin, data in [('alibaba-bedding-evidence.json', bedding), ('alibaba-linen-evidence.json', linen)]:
    for p in data['products']:
        pid = str(p.get('supplierProductId') or re.search(r'(\d+)$', p['id']).group(1))
        if pid in rows:
            rows[pid]['fichiers_source'] += '; ' + origin
            rows[pid]['notes'] += ' | Doublon : données de la page consultée dans le navigateur retenues ; le second relevé indexé ne constitue pas un modèle supplémentaire.'
            continue
        moq = p.get('moq') or {}
        qty = moq.get('quantity')
        conflict = moq.get('conflict') or p.get('moq_conflict') or ''
        name = p.get('displayNameDraft') or p.get('working_name_fr')
        sizes = labels(p.get('sizesExact', p.get('dimensions', [])))
        colors = labels(p.get('colorsExact', p.get('colors', [])))
        images = p.get('imageUrls') or ([p['image_url']] if p.get('image_url') else [])
        price = p.get('supplierPrice') or p.get('supplier_price') or {}
        shipping = p.get('shippingFrance') or p.get('france_shipping')
        category = p['category'].replace('taies-oreillers', 'taies-oreiller')
        if qty == 1 and conflict:
            moq_status = 'MOQ 1 affiché, contradiction à résoudre'
        elif qty == 1:
            moq_status = 'Candidat MOQ 1 ; expédition à l’unité non validée'
        elif qty:
            moq_status = 'MOQ supérieur à 1 ; exclure de la vente à l’unité en l’état'
        else:
            moq_status = 'MOQ / unité contradictoires ; exclure en l’état'
        if not sizes:
            size_status = 'Dimensions absentes'
        elif pid == '1601521930949':
            size_status = 'King / Queen seulement ; dimensions en cm absentes'
        elif pid == '1600901588050':
            size_status = 'Libellé combiné sur mesure ; pas trois variantes de stock confirmées'
        elif pid == '1600317900242':
            size_status = 'Dimensions citées ; option Toddler contradictoire à exclure'
        elif pid == '1601563999505':
            size_status = '50*80 dans le titre ; unité à confirmer'
        elif origin == 'alibaba-bedding-evidence.json':
            size_status = 'Libellés de variantes relevés sur la page ; couples taille / couleur non validés'
        else:
            size_status = 'Dimensions citées dans le titre ou le relevé ; variantes de stock non validées'
        color_status = 'Couleurs citées ; stock et correspondance photo non validés' if colors else 'Couleurs absentes'
        if pid == '1601688153742':
            color_status = 'Sélecteur générique colors choice ; aucune couleur précise confirmée'
        photo_status = 'URL source relevée ; droit de réutilisation non obtenu' if images else 'Aucune URL photo relevée'
        if images and origin == 'alibaba-linen-evidence.json':
            photo_status += ' ; image non vérifiée visuellement'
        if shipping:
            shipping_status = f"{shipping['amount']:.2f} {shipping['currency']} pour {shipping.get('quantity', '?')} {shipping.get('unit', '')} ; devis indicatif, pas coût livré complet validé"
        else:
            shipping_status = 'Transport France non chiffré dans le relevé'
        notes = [p.get('status', ''), conflict, p.get('materialSupplier') or p.get('material_claim') or '']
        notes += p.get('caveats', []) + p.get('open_questions', [])
        rows[pid] = {
            'id_fournisseur': pid,
            'modele_brouillon': name,
            'categorie': category,
            'fournisseur': p.get('supplier', ''),
            'url_produit': p['url'],
            'moq_affiche': qty if qty is not None else '',
            'unite_moq': moq.get('unit', ''),
            'etat_moq': moq_status,
            'contradiction_moq': conflict,
            'prix_fournisseur_min': price.get('min', ''),
            'prix_fournisseur_max': price.get('max', ''),
            'devise': price.get('currency', ''),
            'transport_france': shipping_status,
            'dimensions_relevees': ' | '.join(sizes),
            'etat_dimensions': size_status,
            'couleurs_relevees': ' | '.join(colors),
            'etat_couleurs': color_status,
            'url_photos': ' | '.join(images),
            'etat_photos': photo_status,
            'niveau_preuve': p.get('evidence_level', 'Page produit ouverte dans le navigateur, relevé du 24/10/2026'),
            'accord_expedition_client_valide': 'Non',
            'cout_livre_complet_valide': 'Non',
            'pret_a_vendre': 'Non',
            'date_releve': '2026-10-24',
            'fichiers_source': origin,
            'notes': ' | '.join(n for n in notes if n),
        }

records = list(rows.values())
with (OUT / 'catalogue-sourcing-etat.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=list(records[0]), delimiter=';')
    writer.writeheader()
    writer.writerows(records)

counts = Counter(p['categorie'] for p in records)
moq1 = [p for p in records if p['moq_affiche'] == 1]
clean = [p for p in moq1 if not p['contradiction_moq']]
moq_more = [p for p in records if isinstance(p['moq_affiche'], int) and p['moq_affiche'] > 1]
with_images = [p for p in records if p['url_photos']]
shipping = [p for p in records if p['transport_france'].startswith(('58.19', '49.57', '42.84', '48.16', '13.14'))]

text = '''# État réel du sourcing Moon & Pillow

Relevés fournisseurs datés du **24 octobre 2026**. Cet audit relit les deux fichiers de recherche locaux ; il ne constitue pas une nouvelle confirmation fournisseur. Aucune commande ni prise de contact n’a été effectuée.

## Ce qui existe aujourd’hui

| Mesure | Résultat |
|---|---:|
| Fiches dans les deux relevés | 26 |
| Modèles Alibaba distincts, après dédoublonnage par identifiant produit | 25 |
| Modèles affichant un minimum de commande de 1 | 12 |
| Parmi eux, contradictions explicites sur la quantité ou l’unité | 2 |
| Candidats MOQ 1 sans contradiction explicite relevée | 10 |
| Modèles avec minimum supérieur à 1 | 12 |
| Modèle avec minimum / unité indéterminés et contradictoires | 1 |
| Modèles avec une URL photo relevée | 13 |
| Modèles avec un transport France indicatif chiffré | 5 |
| Modèles avec coût livré complet, accord d’expédition client et conditions de retour validés | **0** |
| Modèles prêts à être mis en vente selon ces pièces | **0** |

**MOQ 1 signifie ici « quantité minimale affichée : 1 pièce ou 1 ensemble », pas « un fournisseur accepte de livrer chaque client pour ce prix ».** L’expédition individuelle, le contenu de l’ensemble, les options et les délais restent à valider. Les dix candidats ne sont donc pas dix produits prêts à vendre.

Le doublon est l’oreiller **1600901588050**, présent dans les deux recherches. Le relevé de sa page consultée dans le navigateur est retenu dans le CSV ; son autre prix indexé en dollars n’est pas mélangé au prix de la page en euros.

## Répartition des 25 modèles

| Famille | Modèles distincts |
|---|---:|
'''
for category, count in sorted(counts.items()):
    text += f'| {category} | {count} |\n'
text += '''
Les couleurs, tailles, lots et variantes de garnissage restent rattachés au même modèle. Ils ne sont pas comptés comme des produits supplémentaires. Les deux écritures « taies-oreiller » et « taies-oreillers » sont regroupées.

## Les dix candidats avec MOQ 1 sans contradiction explicite relevée

Les prix ci-dessous sont ceux des relevés fournisseurs, hors coût livré complet. La liste ne classe pas les marges : le prix de vente, les frais de paiement, le transport, les taxes et les retours ne sont pas tous connus.

| Modèle | Fournisseur | Prix fournisseur relevé | Point bloquant principal |
|---|---|---|---|
'''
blockers = {
    '1600241398988': 'Transport indicatif 58,19 € pour un jeu ; rentabilité non établie.',
    '1601070472662': 'Transport France absent ; marque fournisseur et droit de revente à clarifier.',
    '1601564961499': 'Transport indicatif 49,57 € ; dimensions du drap-housse peu usuelles en France.',
    '1601688153742': 'Couleurs réelles non identifiées ; transport absent.',
    '1601521930949': 'King / Queen sans dimensions en cm ; transport indicatif 48,16 €.',
    '1601451040881': 'Dimensions fournisseur à vérifier pour la France ; transport absent.',
    '1601080870169': 'Transport indicatif 13,14 € ; composition et taille des taies à confirmer.',
    '1600901588050': 'Choix de taille sur mesure combiné ; variantes de stock et transport non validés.',
    '1601710942064': 'Fournisseur déclaré en Italie ; transport, stock et droit de revente à confirmer.',
    '1601024896360': 'MOQ issu d’un relevé de catégorie ; dimensions, contenu, couleurs et transport absents.',
}
for p in clean:
    pr = f"{p['prix_fournisseur_min']}–{p['prix_fournisseur_max']} {p['devise']}"
    text += f"| [{p['modele_brouillon']}]({p['url_produit']}) | {p['fournisseur']} | {pr} | {blockers[p['id_fournisseur']]} |\n"
text += '''
Trois cas doivent être isolés des candidats :

- **Parure velours 1601248538962** : le panier commence à 1 jeu, mais les attributs / le descriptif mentionnent 5 jeux minimum.
- **Oreiller 1601816193307** : minimum de 1 sac, attribut MOQ 1 pièce ; le nombre d’oreillers par sac et le poids sont incohérents.
- **Taie Yasha 1600317900242** : attribut MOQ 10, encart minimum « 1 meter » ; aucune unité de vente exploitable n’est confirmée.

Les douze autres modèles ont un minimum affiché de 2 à 500 unités. Ils ne conviennent pas à une vente client à l’unité sans stock préalable ou nouvel accord fournisseur. Vendre un lot ne résout le problème que si le client achète réellement le lot complet correspondant au minimum et si le fournisseur confirme ce conditionnement ; aucun accord de ce type n’est validé ici.

## Dimensions, couleurs et photographies

- **4 modèles** n’ont aucune dimension relevée : housse côtelée 1601393545708, housse douce 1601524493215, drap-housse 1601024896360 et couvre-lit 1600911117672. La parure 1601521930949 ajoute seulement « King / Queen », sans mesures en cm.
- Pour l’oreiller 1600901588050, trois mesures sont réunies dans **un seul libellé de sur-mesure** : ce ne sont pas trois tailles de stock distinctes confirmées.
- La taie 1601688153742 propose seulement « colors choice » : aucune liste précise de couleurs ne peut en être déduite. La taie Yasha comporte aussi une mesure Toddler incohérente ; cette option enfant est à écarter du lancement.
- Pour les modèles renseignés, une liste de tailles et une liste de couleurs ne prouvent pas que toutes les combinaisons soient commandables. Le CSV conserve les libellés et leur limite de preuve.
- **13 modèles ont une URL photo**, dont 2 photos indiquées comme non vérifiées visuellement dans le relevé linge. Les 12 autres n’ont aucune URL photo enregistrée. Une URL accessible ne donne pas un droit de réutilisation. Aucun droit n’est acquis selon les fichiers.
- Les coûts de transport chiffrés sont des estimations pour la variante sélectionnée au moment du relevé. Ils ne prouvent ni un prix final avec taxes, ni le même tarif pour d’autres tailles / couleurs.

## Cible de travail : 50 modèles fournisseurs qualifiés

La cible est **50 modèles distincts qualifiés**, chacun avec ses variantes réelles. Un modèle en cinq couleurs compte pour un modèle. Le nombre repéré actuel est 25 ; le nombre qualifié est 0. Atteindre 50 liens repérés demanderait au moins 25 liens distincts supplémentaires, mais cela ne suffirait pas à atteindre 50 modèles qualifiés.

Pour passer de « repéré » à « qualifié », chaque modèle doit disposer des éléments suivants :

1. Achat d’une pièce ou d’un ensemble correspondant exactement à une commande client, sans regroupement de clients ni minimum caché par taille / couleur.
2. Prix et disponibilité pour chaque variante vendue, contenu précis du colis, mesures en cm et composition documentée.
3. Expédition directe au client en France acceptée, transport chiffré pour cette variante, suivi et délai confirmé.
4. Coût livré complet établi et marge calculée à partir du prix de vente réellement retenu.
5. Photos réutilisables et fiches sans promesses ou certifications non étayées.
6. Conditions de retour, adresse de retour et traitement d’un défaut clarifiés ; aucun produit ne dépend d’un remboursement « au cas où le minimum ne serait pas atteint ».

Ce seuil sert de grille de sélection, pas de quota à publier. Les modèles insuffisamment documentés restent privés. La liste des familles et le nombre de modèles par famille restent à arrêter ensemble avant d’élargir le sourcing.

## Références déjà écartées du relevé literie

| Identifiant | Motif enregistré |
|---|---|
'''
for p in bedding.get('excluded', []):
    text += f"| [{p['supplierProductId']}]({p['url']}) | {p['reason']} |\n"
text += '''
Ces quatre fiches écartées ne figurent pas dans les 25 modèles candidats. La référence 1600540534767 illustre la limite des résultats indexés : le résultat annonçait MOQ 1, mais la page France affichait 150 ensembles minimum.

## Pièces de travail

- `work/alibaba-bedding-evidence.json` : 11 modèles, pages produit consultées dans le navigateur ; 4 autres références écartées.
- `work/alibaba-linen-evidence.json` : 15 modèles, mélange de catégories, titres, contenus indexés et une page produit au contenu accessible.
- `outputs/founder/catalogue-sourcing-etat.csv` : 25 lignes dédoublonnées, sources, prix dans leur devise d’origine, variantes relevées et motifs de blocage. Les valeurs absentes restent absentes.

Cet état décrit la recherche, pas un catalogue commercial, une confirmation de stock ou un accord fournisseur. Aucun prix de vente n’a été inventé.
'''
(OUT / 'catalogue-sourcing-etat.md').write_text(text, encoding='utf-8')
print(json.dumps({'distinct_models': len(records), 'moq1_displayed': len(moq1), 'moq1_without_explicit_conflict': len(clean), 'moq_over_1': len(moq_more), 'photo_urls': len(with_images), 'shipping_indicative': len(shipping), 'categories': dict(counts)}, ensure_ascii=True))
