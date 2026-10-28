from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "outputs" / "founder"

etat = """# Moon & Pillow — état de la boutique au 25 octobre 2026

La révision du catalogue est préparée pour l’[aperçu privé Moon & Pillow](https://moon-and-pillow-boutique.bahethora.chatgpt.site/). **Sa publication est en cours à la rédaction de ce document** ; elle n’est pas encore annoncée comme réussie. Le précédent déploiement confirmé correspond à la version source `d4e58774b6aae0a564b7cb4a727cf3af2b9f2068`, antérieure à cette révision. Le site d’origine `moon-and-pillow.pages.dev` n’a pas été modifié.

**Aucune vente ouverte, aucun paiement effectué, aucune nouvelle dépense. Stripe n’est pas connecté.** La boutique demeure privée et non indexable.

## Catalogue de cette révision

- **219 références fournisseurs distinctes retenues** : 25 Alibaba, 42 AW Europe, 44 CJdropshipping et 108 Planete Discount. Une taille ou une couleur ne constitue pas une référence supplémentaire.
- **200 références fournisseurs illustrées dans la collection**, hors lots non dissociables, plus les deux modèles initiaux conservés : **202 modèles dans la collection**, sur **221 modèles au total**. Les 19 autres références fournisseurs restent en préparation. Le compteur des références disposant d’au moins une image, 203, comprend aussi des références écartées de la collection : il ne décrit pas la collection marchande.
- **760 libellés couleur et 466 libellés de taille** relevés chez les fournisseurs. Ce sont des options documentées ; toutes leurs combinaisons, leurs stocks et leurs prix exacts ne sont pas confirmés.
- **105 modèles fournisseurs possèdent au moins deux libellés couleur.** Le minimum demandé de deux couleurs et trois photos exactes par couleur n’est pas atteint pour l’ensemble du catalogue.
- **1 349 placements de photos rattachées à des couleurs**, dédupliqués dans leur galerie, et **758 vues générales**. Ce ne sont pas 2 107 photographies uniques : plusieurs placements peuvent utiliser la même image source. Une galerie fournisseur n’est pas une validation visuelle de chaque couleur.
- **Un seul modèle passe actuellement le contrôle strict deux couleurs / trois vues exactes par couleur** : la housse de couette percale `pd-25300`, avec huit couleurs et quatre vues vérifiées par couleur. L’inspection ciblée a porté sur 16 teintes et 56 vues ; elle ne valide pas toutes les références.

Le [catalogue fournisseurs v3](catalogue-fournisseurs-v3.csv) et le [rapport détaillé v3](catalogue-v3.md) précisent le périmètre et les limites. Les anciens fichiers des catalogues 25 et 48 modèles sont conservés comme historique.

## Ce qui change dans les fiches

Les prix numériques sont désormais des **prix de vente proposés, non approuvés**. Ils permettent de travailler le positionnement du catalogue ; ils ne prouvent ni un coût livré connu ni une marge rentable. Ils n’autorisent aucun encaissement.

L’ensemble Cocon a été retiré. La housse initiale se compose à l’unité, au prix proposé de **12,90 €**, et les plaids restent des articles séparés. Le client peut composer son panier produit par produit. Les lots du fournisseur restent en recherche lorsqu’une vente à l’unité n’est pas établie ; leurs pièces ne sont pas transformées artificiellement en références vendables.

La présentation privilégie une première teinte beige ou naturelle lorsqu’une photo correspondante existe réellement. Aucun produit n’est recoloré pour imposer cette palette. Les vues blanches qui apparaissaient à tort dans la galerie rose initiale ont été retirées de cette couleur. Les vues générales non attribuées restent séparées des photos du coloris sélectionné.

## Paiement et automatisation : état exact

Le SIRET et le compte Stripe professionnel ont été confirmés par le fondateur. **Aucune connexion Stripe, commande fournisseur ou opération réelle de remboursement n’est activée dans cette boutique.** Aucun coût fournisseur individuel n’est encore approuvé.

Les autorisations restent celles acceptées : achat automatique après paiement client confirmé, uniquement dans les références, variantes, quantités et coûts livrés approuvés ; remboursement automatique justifié jusqu’à 50 % du montant initial réellement payé, cumulés sur toute la commande. Le plafond sur 24 heures et la réserve restent à chiffrer. Les montants dus au-delà de la limite automatique passent à un humain ; le remboursement n’est jamais tronqué à 50 %.

Le [prototype d’automatisation](../automatisation/README.md) demeure séparé du site : il évalue les règles sans envoyer d’argent. Il reste à installer la conservation durable des commandes et opérations, la réception signée des événements Stripe, les connexions fournisseurs et la gestion des exceptions. L’[architecture v2 mise à jour](architecture-automatisation-v2.md) décrit ces étapes.

## Vérifications et conditions d’ouverture

**19 tests actuels de catalogue et de protection du paiement ont réussi.** Les 25 tests du prototype d’automatisation sont ceux du prototype antérieur, inchangé ; ils ne constituent pas une intégration Stripe ni une commande fournisseur de bout en bout. La confirmation de publication de cette révision doit être ajoutée après le retour de l’hébergeur.

Avant l’ouverture : confirmer les SKU réellement expédiables à l’unité, les correspondances photo/couleur, les coûts livrés, les stocks, les retours et les droits d’utilisation des images ; approuver les prix ; compléter les informations légales et la fiscalité ; raccorder et tester Stripe sans argent réel. Les CGV Planete Discount n’accordent pas de licence commerciale de reproduction des photos : un accord explicite reste nécessaire. [CGV du fournisseur, article 10](https://www.planetediscount.eu/content/23-conditions-generales-de-ventes-b2b)

Les fonds des ventes peuvent rester indisponibles avant le virement Stripe : une avance fournisseur et une réserve de remboursement distinctes sont nécessaires. Les 120 € également destinés aux dépenses essentielles ne sont pas affectés à ces avances. Les publicités et nouveaux outils payants conservent un budget de **0 €**.

Les prochaines sauvegardes et le nouveau numéro de version seront rattachés à cette révision après confirmation de publication. Les sauvegardes antérieures ne sont pas présentées comme les sources finales du catalogue v3.
"""

architecture = (OUT / "architecture-automatisation-v2.md").read_text(encoding="utf-8")
start = architecture.index("Une boutique de linge de maison")
end = architecture.index("## Autorisations à respecter")
architecture = architecture[:start] + """Une boutique de linge de maison qui vend au fil des commandes, avec une collection de 200 références fournisseurs illustrées, des variantes et photos exactes, une acquisition préparée et des remboursements automatiques sur des critères vérifiables. Conserver le site actuel pendant cette préparation, sans nouvel abonnement.

Révision v3 préparée : **219 références fournisseurs retenues** — 25 Alibaba, 42 AW Europe, 44 CJdropshipping, 108 Planete Discount. **200 apparaissent dans la collection**, hors lots non dissociables ; 19 restent en préparation. Avec les deux articles initiaux conservés, la boutique compte **221 modèles au total, dont 202 dans la collection**. L’ensemble Cocon a été retiré ; les housses et les plaids se composent séparément dans le panier.

Les 760 libellés couleur et 466 libellés de taille ne garantissent pas toutes les combinaisons ni les stocks. 105 modèles possèdent au moins deux libellés couleur ; **un seul a passé le contrôle strict deux couleurs et trois vues exactes par couleur**. Les autres galeries restent à qualifier. [Rapport et limites du catalogue v3](catalogue-v3.md)

Les prix de vente numériques sont **proposés et non approuvés**. Aucun dossier nouveau n’est complet sur le coût livré, le stock, les photos et les retours. Les contrôles côté serveur maintiennent le paiement fermé. Stripe n’est pas connecté ; aucun coût fournisseur individuel n’est approuvé ; aucun achat fournisseur ni remboursement réel n’est activé.

**Publication de cette révision en cours à la rédaction.** Le dernier succès confirmé avant cette révision est la version `d4e58774b6aae0a564b7cb4a727cf3af2b9f2068` sur [Moon & Pillow](https://moon-and-pillow-boutique.bahethora.chatgpt.site/). Ne pas confondre cet ancien déploiement avec une confirmation du catalogue v3. La boutique reste privée et non indexable.

""" + architecture[end:]
architecture = architecture.replace("A[Alibaba + comparaison CJ et AW Europe]", "A[Alibaba + CJ + AW Europe + Planete Discount]")
architecture = architecture.replace("Alibaba reste une source sélective. Comparer par modèle avec CJdropshipping et AW Dropship Europe lorsque leurs catalogues conviennent.", "Alibaba reste une source sélective. Comparer par modèle avec CJdropshipping, AW Dropship Europe et Planete Discount lorsque leurs catalogues conviennent.")
start = architecture.index("Les 48 modèles importés constituent")
end = architecture.index("## Éviter les annulations MOQ")
architecture = architecture[:start] + """Les 219 références retenues constituent une base de préparation, pas une validation de demande ou de rentabilité. La collection comporte 200 références fournisseurs illustrées, sans compter leurs tailles et couleurs comme des modèles supplémentaires. Les lots sans variante unitaire vérifiée restent en recherche ; les pièces ne sont pas séparées artificiellement. Les prix numériques proposés doivent encore être approuvés après calcul du coût livré et de la marge. [Catalogue v3](catalogue-fournisseurs-v3.csv)

Planete Discount prévoit un compte professionnel validé, l’absence de minimum d’achat et le dropshipping ; cela ne garantit ni le stock ni une autorisation de réutiliser les photographies. Ses conditions de retours sont à intégrer à la comparaison fournisseur, indépendamment des droits du client final. [CGV Planete Discount, articles 4, 6, 7 et 10](https://www.planetediscount.eu/content/23-conditions-generales-de-ventes-b2b)

""" + architecture[end:]
start = architecture.index("## Préparation technique réellement livrée")
architecture = architecture[:start] + """## Préparation technique réellement livrée

- [Catalogue des 219 références retenues](catalogue-fournisseurs-v3.csv) et [rapport v3 avec limites des galeries](catalogue-v3.md).
- Les rapports des catalogues 25 et 48 modèles sont conservés comme historique ; leurs compteurs ne décrivent plus le catalogue actuel.
- [Comparaison initiale des sources à l’unité](fournisseurs-unite-2026-10-24.md) et [spécification complète des remboursements](remboursements-automatiques-spec.md).
- Boutique : **19 tests locaux actuels de catalogue et de protection du paiement réussis**. Les prix proposés n’autorisent aucun encaissement, y compris en appelant directement la validation côté serveur.
- [Prototype local des règles](../automatisation/README.md) et [autorisations enregistrées](../automatisation/autorisations.json) : fournisseur, remboursement, achats fournisseur et publication. Les **25 tests du prototype antérieur inchangé** restent distincts des tests de cette révision. Ce prototype évalue une éligibilité ; il n’exécute aucune opération financière.
- Publication de la révision v3 en cours ; le nouveau numéro de source et la confirmation du déploiement restent à ajouter après succès de l’hébergeur.

Aucun test de bout en bout du compte Stripe ni d’une commande fournisseur réelle n’est revendiqué. Le prototype d’automatisation n’est pas raccordé au site.

Avant raccordement réel : source fournisseur exploitable et identifiants de variantes, droits sur les visuels, base durable pour commandes/événements/opérations, paramètres et limites, accès Stripe sécurisé côté serveur, réception publique signée des événements, tests de bout en bout sans argent réel, gestion des erreurs et reprise. La boutique n’est pas présentée comme autonome ou prête à vendre à ce stade.
"""

rapport = """# Moon & Pillow — rapport catalogue v3

État du 25 octobre 2026. **Révision préparée ; publication en cours, pas encore confirmée dans ce rapport.** Aperçu privé : [Moon & Pillow](https://moon-and-pillow-boutique.bahethora.chatgpt.site/). Le prix d’une fiche n’autorise pas encore sa vente.

## Références et collection

| Périmètre | Nombre |
|---|---:|
| Références fournisseurs retenues | 219 |
| Alibaba | 25 |
| AW Europe | 42 |
| CJdropshipping | 44 |
| Planete Discount | 108 |
| Références fournisseurs illustrées dans la collection, hors lots non dissociables | 200 |
| Références fournisseurs restant en préparation | 19 |
| Modèles initiaux conservés | 2 |
| Ensemble du catalogue intégré | 221 |
| Modèles dans la collection avec les deux initiaux | 202 |

Les 259 modèles examinés pendant cette recherche ne sont pas tous retenus : le total de recherche n’est pas le total intégré. De même, le compteur technique de 203 références avec au moins une image n’est pas la collection : certaines images appartiennent à des fiches conservées en préparation. Les tailles et couleurs restent des variantes du modèle.

Fichier de travail réutilisable : [catalogue fournisseurs v3, CSV](catalogue-fournisseurs-v3.csv). Les anciens [48 modèles](catalogue-fournisseurs-48.csv) et [25 modèles Alibaba](catalogue-sourcing-etat.csv) sont conservés pour l’historique.

## Photos, couleurs et dimensions : résultat réel

Le catalogue contient **760 libellés couleur et 466 libellés de taille**. Leur présence dans une annonce ne confirme ni toutes les combinaisons taille/couleur ni leur disponibilité. **105 modèles** présentent au moins deux noms de couleur.

Les galeries comptent **1 349 placements rattachés à des couleurs**, dédupliqués au sein de leur galerie, et **758 vues générales non affectées**. Une photographie peut apparaître dans plusieurs placements : ces chiffres ne désignent pas autant de photographies uniques. Les vues générales ne doivent pas devenir automatiquement des vues exactes de toutes les couleurs.

**L’objectif deux couleurs minimum et trois photos exactes par couleur n’est pas atteint pour les 200 références de la collection.** Un seul modèle a passé ce contrôle strict : [housse de couette percale, fiche fournisseur](https://www.planetediscount.eu/housse-de-couette/25300-housse-de-couette-240x260-cm-percale-de-coton-thym.html), identifiant interne `pd-25300`, avec huit couleurs et quatre vues exactes par couleur. L’inspection ciblée a porté au total sur **16 teintes et 56 vues** ; elle ne valide pas tout le catalogue et ne constitue pas une confirmation physique des teintes.

Les contrôles ont corrigé des familles de motifs AW regroupées à tort par numéro de produit. Des images partagées ambiguës ont été retirées des galeries de couleur et conservées comme vues générales. Les noms et tailles ont été regroupés sans multiplier artificiellement les références. Les différences de matières, de densité, de conditionnement et les contradictions des annonces restent à confirmer.

Une teinte beige, sable ou naturelle est choisie en premier lorsqu’une option et une photo correspondantes existent. Aucun recoloriage n’est utilisé pour rendre tous les produits beiges. La galerie rose des articles initiaux ne reprend plus les vues blanches qui lui étaient attribuées à tort.

## Composition du panier et prix

L’ensemble Cocon a été retiré. La housse initiale est proposée à l’unité à **12,90 €**, les plaids se choisissent séparément. Les quantités se composent dans le panier. Les lots fournisseurs restent en recherche lorsqu’une référence unitaire n’est pas isolée et confirmée : leurs pièces ne sont pas présentées comme vendables séparément.

Les 219 références fournisseurs ont un **prix de vente numérique proposé, non approuvé**. Ce sont des hypothèses de positionnement ; elles ne sont pas des devis fournisseurs, des marges garanties ou des prix autorisés à encaisser. Les devises des coûts sources, le port, les taxes, les frais et les retours doivent encore être rapprochés du SKU exact avant approbation.

## Sources et conditions fournisseurs

Les sources sont les fiches publiques des fournisseurs ; les liens par modèle restent dans le CSV. La consultation d’une annonce ne vaut pas accord commercial, stock réservé ou confirmation de livraison.

Les [CGV Planete Discount](https://www.planetediscount.eu/content/23-conditions-generales-de-ventes-b2b), relues le 25 octobre 2026, réservent la commande aux professionnels dont le compte est validé (4.1), sans minimum d’achat (4.4). Le dropshipping figure à l’article 6 ; les 3–4 jours annoncés sont indicatifs. L’article 7 prévoit des retours restrictifs. L’article 10 interdit la reproduction des photographies : **obtenir un accord explicite avant diffusion commerciale publique**. Aucun compte ou accord nouveau n’a été créé ou accepté ici.

Autres conditions à rapprocher des dossiers : [AW Europe, conditions](https://www.aw-dropship.eu/terms-and-conditions), [AW Europe, livraison](https://www.aw-dropship.eu/shipping), [CJ, politique de litiges et retours](https://www.cjdropshipping.com/dispute-policy.html). Les recours fournisseur sont séparés des remboursements éventuellement dus au client de Moon & Pillow.

## État commercial et vérifications

**Aucune dépense nouvelle, aucune commande fournisseur, aucune vente ni remboursement réel. Stripe n’est pas connecté.** Les prix proposés et les nouvelles images n’activent aucun paiement. Les publicités et les outils payants restent inactifs avec un budget de 0 €.

**19 tests actuels de catalogue/paiement ont réussi.** Les 25 tests du prototype d’automatisation correspondent au prototype antérieur, inchangé ; ils ne prouvent pas une connexion Stripe ou fournisseur. Le nouveau numéro de source et la confirmation de publication doivent être ajoutés après réussite du déploiement.

Les prochaines validations portent sur les photos exactes restantes, les droits de réutilisation, les variantes commandables à l’unité, le coût livré et le stock, puis l’approbation des prix et les essais de paiement sans argent réel. [État de la boutique](etat-boutique.md) · [Architecture et autorisations](architecture-automatisation-v2.md) · [Spécification remboursements](remboursements-automatiques-spec.md).
"""

for filename, content in [("etat-boutique.md", etat), ("architecture-automatisation-v2.md", architecture), ("catalogue-v3.md", rapport)]:
    (OUT / filename).write_text(content, encoding="utf-8")
    print(filename, len(content))
