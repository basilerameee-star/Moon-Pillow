# Moon & Pillow — état du projet

Dernière mise à jour : 28 octobre 2026

## Objectif

Construire une boutique française de linge de maison sous la marque **Moon & Pillow**, avec une direction visuelle premium, une sélection de produits cohérente et une expérience de catalogue claire. Le domaine `moonandpillow.com` a été acheté dans Cloudflare mais n'est pas encore raccordé à la boutique.

Le projet est en phase de préparation. Le site local visible sur `http://127.0.0.1:8787/` est une prévisualisation, pas une mise en production. Aucune intégration Stripe, Alibaba, Google Ads ou Meta Ads n'est confirmée comme opérationnelle.

## État du code et du catalogue

- Boutique web construite dans ce dépôt avec Next/Vinext et aperçu local via Wrangler.
- Catalogue importé d'environ **221 références produit** et **826 images catalogue** actuellement suivies par Git.
- Les sources principales du catalogue sont `lib/imported-products.ts`, `lib/sourcing-data.ts`, `lib/catalog.ts` et `lib/photo-curation.ts`.
- Les pages comprennent la vitrine, l'univers de marque, des guides de linge, le parcours de commande et des pages d'information/préparation.
- Des changements locaux non encore commités au moment de cette note ajoutent ou modifient notamment la préparation de commande, l'expérience de préparation, la carte cadeau, les informations de rétractation, les séquences email et des contenus légaux. Voir l'historique Git et les derniers changements pour le détail exact.
- Plusieurs contrôles de curation ont déjà corrigé des couleurs, des associations d'images, des variantes de tailles et quelques photos portant une marque visible. Cela n'établit pas que tout le catalogue a été vérifié.

## Décisions et exigences du propriétaire

### Produits, options et prix

- Construire un assortiment substantiel (objectif évoqué : 100 à 200 références fournisseurs), mais distinguer les vrais produits des tailles/couleurs qui sont seulement des variantes.
- Chaque fiche doit montrer les tailles réellement proposées par le fournisseur, les dimensions et les couleurs réellement disponibles. Ne pas créer d'option qui n'est pas confirmée par la source.
- Les produits composés doivent être décomposés en articles achetables indépendamment lorsque la source le permet. Ne pas imposer un lot de plusieurs pièces si le client devrait pouvoir choisir les éléments séparément.
- Afficher un prix sur chaque produit et prévoir des prix différents selon les dimensions lorsqu'un coût fournisseur différent les justifie. Les prix présents sont des propositions de préouverture à vérifier par les coûts réels, la livraison, les taxes, les retours et les frais de paiement.
- Le propriétaire souhaite comparer Alibaba et d'autres sources en tenant compte du MOQ. Le client devrait payer avant la commande fournisseur, afin d'éviter un achat bloqué par une quantité minimale non atteinte.

### Images et couleurs

- Priorité aux photos de mise en situation et aux gros plans de matière. Éviter les photos produit sur fond blanc, les logos/étiquettes visibles et les images génériques.
- La première photo de chaque produit/couleur doit donner envie de découvrir l'article et montrer un contexte de chambre ou de maison.
- Les photos d'une couleur, d'une taille et d'un produit doivent correspondre à la même référence fournisseur. Ne pas mélanger les images d'articles proches, les autres coussins présents dans la scène, ni des formats différents.
- Les pastilles doivent refléter la vraie couleur; n'afficher que les variantes confirmées et rendre l'image correspondante au changement de couleur.
- Objectif demandé : au moins deux coloris et trois photos exactes par couleur et par produit lorsque les sources le permettent. Ne jamais fabriquer des photos ou leur attribuer une couleur non vérifiée pour atteindre ce seuil.

### Direction artistique et contenu

- Style premium inspiré des principes attribués à Sam Crawford : restriction volontaire, hiérarchie visuelle nette, espacement généreux et interactions discrètes. La structure de Parachute Home sert d'inspiration, sans copier ses textes ou créations.
- Réponses d'aide simples et précises, guides de taille compréhensibles, et composition claire de chaque produit.
- Les avis inventés, certifications non vérifiées, mentions de livraison offerte et retours gratuits ont été explicitement mis en réserve pour une décision ultérieure. Ne pas les présenter comme des faits ou promesses tant qu'ils ne sont pas validés.

### Paiements, commandes et automatisations souhaités

- Le propriétaire a indiqué disposer d'un SIRET et d'un compte Stripe. Le site n'est pas pour autant connecté à Stripe.
- Objectif futur : commander automatiquement au fournisseur après paiement client, uniquement pour les produits et plafonds de coûts approuvés.
- Objectif futur : remboursements automatiques en cas de problème, avec un plafond fixé par le propriétaire à 50 % du panier. Les critères précis, la réserve et les plafonds globaux restent à définir avant d'autoriser tout mouvement d'argent automatisé.
- Google Shopping/Performance Max, Meta Ads et publications sociales sont des objectifs futurs, pas des campagnes confirmées en service.
- Ne jamais demander ni committer des mots de passe, clés Stripe, jetons Cloudflare, accès fournisseurs ou clés publicitaires. Configurer les secrets seulement dans les services concernés.

## État de partage

Le dépôt GitHub cible communiqué par le propriétaire est `https://github.com/basilerameee-star/Moon-Pillow`. Au 28 octobre 2026, les métadonnées GitHub indiquent que ce dépôt est **public**. Il contient donc du contenu visible publiquement. Le code, le catalogue et les ressources demandés sont destinés à y être sauvegardés; aucun identifiant de compte ou secret d'API ne doit y être ajouté.

## Démarrer localement

Voir la section technique du [README](../../README.md). Pour une prévisualisation, utiliser le script `npm run start` après installation et build; le serveur local n'est pas une publication sur le domaine.
