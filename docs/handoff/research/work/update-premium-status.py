from pathlib import Path
state='''# Moon & Pillow — état au 26 octobre 2026

La révision 4 est publiée dans l’[aperçu privé](https://moon-and-pillow-boutique.bahethora.chatgpt.site/). Source `f16dd163f08f1e86c6b3e765f6423de99e4f2fdf`, version `appgprj_6adb9a7bbcc881918aa8b032128d0fd5~appgver_08004fe7e82c8191bccffe975a4dcf1a`, déploiement réussi `appgdep_6adf8b9a042c8191be0db9377b92d4c1`.

**Aucune vente ouverte, Stripe non connecté, aucune dépense supplémentaire.** Le site demeure privé et non indexable. Le site d’origine moon-and-pillow.pages.dev n’est pas modifié.

- 219 références fournisseurs conservées : 25 Alibaba, 42 AW Europe, 44 CJdropshipping, 108 Planete Discount. Deux modèles initiaux supplémentaires, soit 221 au total.
- 123 modèles dans la collection principale, dont 121 fournisseurs : 84 scènes attribuées à une couleur et 39 vues générales signalées. Les 98 autres références fournisseurs restent en préparation.
- 808 vues/vignettes examinées dans cette révision, 764 associations modèle/couleur/URL distinctes. Les doublons entre tailles ne constituent pas de nouvelles photos.
- Scènes et macros sans détourage blanc dans la présentation ; pas de substitution de couleur. Le minimum de deux couleurs et trois photos par couleur n’est toujours pas satisfait pour tout le catalogue. La housse de couette percale dispose de trois vues présentées pour chacune de ses huit couleurs.
- Recherche visible, menus de filtre personnalisés, panier latéral à l’ajout, suggestion séparée, bouton persistant, guides des tailles/entretien et guide imprimable, page Notre univers et aide discrète.
- Prix de vente proposés et non approuvés. La housse initiale est proposée seule à 12,90 € ; les plaids se choisissent séparément. Aucun lot fournisseur n’est artificiellement divisé en références commandables.

28 tests de la boutique réussis, contrôle TypeScript et compilation réussis. Parcours vérifié sur ordinateur et mobile, puis galeries contrôlées après publication. Les 25 tests du prototype d’automatisation antérieur ne constituent pas une connexion aux services réels.

Les achats fournisseurs automatiques restent autorisés uniquement après paiement client capturé, pour des coûts livrés, variantes et références individuellement approuvés ; aucun coût n’est encore approuvé. Le plafond des remboursements automatiques justifiés reste de 50 % cumulés du montant capturé par commande. La réserve et le plafond quotidien restent à chiffrer. Le prototype n’effectue aucune opération financière réelle ; une demande dépassant le plafond doit être traitée humainement, sans tronquer les sommes dues.

Avant ouverture : confirmer les variantes expédiables à l’unité, le stock, le coût livré, les droits photo, les informations légales et les conditions de retour, puis raccorder Stripe et les événements de commande en mode test. Les e-mails, portefeuilles de paiement, paiement fractionné, emballages et Pinterest restent à raccorder/valider. Aucun faux avis, label ni avantage de livraison n’est revendiqué.

Les 120 € également nécessaires aux dépenses essentielles ne sont pas engagés. Publicités, nouveaux outils et emballages : 0 € dépensé dans cette révision.

Documents à jour : [photos et présentation v4](photographies-premium-v4.md), [expérience à activer](experience-premium-a-activer.md), [catalogue fournisseurs](catalogue-fournisseurs-v3.csv), [architecture d’automatisation](architecture-automatisation-v2.md).

Sauvegardes : [sources ZIP](../moon-and-pillow-source.zip), [archive de déploiement v4](../moon-and-pillow-premium-v4-deployment.tar.gz), [capture de la version publiée](../moon-and-pillow-premium-v4.png). Le rapport v3 décrit la version historique précédente.
'''
Path('outputs/founder/etat-boutique.md').write_text(state,encoding='utf-8')
p=Path('outputs/founder/catalogue-v3.md')
s=p.read_text(encoding='utf-8')
note='> Historique du 25 octobre. La [révision photographique v4 du 26 octobre](photographies-premium-v4.md) et l’[état actuel](etat-boutique.md) remplacent les compteurs de collection ci-dessous.\n\n'
if not s.startswith('> Historique'):p.write_text(note+s,encoding='utf-8')
