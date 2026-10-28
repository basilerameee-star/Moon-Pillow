# Moon & Pillow — travail restant

Liste de reprise pour poursuivre le projet sans perdre les décisions. Les priorités sont ordonnées pour éviter de mettre en vente des informations fournisseur ou des promesses non vérifiées.

## 1. Sauvegarde et reprise

- [ ] Vérifier que le commit complet est bien présent sur la branche `main` du dépôt `basilerameee-star/Moon-Pillow`.
- [ ] Contrôler après poussée les fichiers et le nombre d'images présents sur GitHub.
- [ ] Conserver les secrets hors dépôt; le dépôt est public selon les métadonnées GitHub consultées le 28 octobre 2026.

## 2. Références et fournisseurs

- [ ] Établir une liste fournisseur vérifiée des produits uniques et séparer les variantes de taille/couleur des références distinctes.
- [ ] Pour chaque référence, confirmer URL fournisseur, SKU, MOQ, couleur, tailles, prix, frais de livraison, délai, stock et conditions de retour.
- [ ] Calculer le coût total rendu en France, TVA/douane le cas échéant, frais de paiement et marge nette avant de valider les prix.
- [ ] Confirmer par écrit que le fournisseur accepte l'expédition à l'unité après commande client ou fixer un seuil de commandes et un mécanisme qui évite les commandes client impossibles à honorer.
- [ ] Ne pas lancer une commande automatique tant que les coûts fournisseurs et plafonds autorisés ne sont pas inscrits dans une liste approuvée.

## 3. Qualité des fiches et des médias

- [ ] Auditer chaque association produit/couleur/taille avec la source d'origine; vérifier les écarts déjà repérés entre coussins proches et photos d'autres tailles.
- [ ] Garder les pastilles uniquement si une option couleur vérifiée existe et si son image correspondante se charge.
- [ ] Remplacer les premières images peu séduisantes par les meilleures mises en scène disponibles; garder des macros matière cohérentes.
- [ ] Retirer autant que possible les fonds blancs et les marques/étiquettes visibles, en respectant les droits d'utilisation des images fournisseur.
- [ ] Continuer l'objectif de trois photos exactes par couleur sans réutiliser une photo d'une autre couleur ou d'un autre produit pour gonfler le nombre.
- [ ] Valider la hiérarchie des photos, les variantes de prix par dimensions et l'achat d'articles séparés plutôt que des lots imposés.
- [ ] Compléter et simplifier les réponses de la section « Un peu d'aide » et les guides de taille.

## 4. Légal, confiance et opérations

- [ ] Vérifier les mentions légales, CGV, rétractation, politique de livraison, retours, confidentialité et cookies avec les informations réelles de l'entreprise.
- [ ] Garder en réserve, sans les publier comme affirmations, les avis, certifications, livraison offerte et retours gratuits non vérifiés.
- [ ] Définir les cas autorisant un remboursement automatique, les preuves requises, la limite par commande (50 % maximum du panier indiquée par le propriétaire), la réserve et le plafond quotidien.
- [ ] Écrire et tester le parcours de commande, confirmation fournisseur, suivi, rupture de stock, litige, annulation et remboursement.

## 5. Connecter et ouvrir la boutique

- [ ] Raccorder le domaine Cloudflare `moonandpillow.com` au site hébergé et vérifier HTTPS, redirections et DNS.
- [ ] Connecter Stripe via variables secrètes, puis faire des commandes et remboursements de test avant activation réelle.
- [ ] Ajouter les intégrations Meta et Google, le flux Merchant Center, le suivi d'événements et le consentement requis.
- [ ] Programmer les publications sociales seulement après validation des produits, prix, délais et visuels.
- [ ] Lancer les campagnes avec un budget distinct et explicitement approuvé.
- [ ] Faire une revue complète sur mobile et ordinateur avant toute ouverture au public.

## Contrôle de reprise

Le dépôt contient actuellement le code source, les données catalogue suivies et les 826 images présentes dans `public/img/catalogue/`. Les archives temporaires d'images non utilisées ne sont pas une source de vérité de production; inspecter leur association visuelle avant de les incorporer.
