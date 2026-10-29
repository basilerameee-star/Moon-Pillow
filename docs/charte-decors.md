# Charte des décors photo — Moon & Pillow

Sert à remplacer les fonds blancs des photos fournisseurs par un décor cohérent avec le site,
sans jamais modifier le produit. Établie le 29/10/2026 à partir des photos d'ambiance du site
(`public/img/plaid-detente.jpg`, `plaid-blanc.jpg`, `blanc.jpg`, `plaid-matiere.jpg`).

## Style validé par Basile (29/10/2026, nuit) : plans variés, Nano Banana 2.1

Référence : le plan large du canapé en lin (coussin petit dans le cadre, appareil de face à hauteur d'assise, lin froissé,
voilage en contre-jour). Le gros plan de trois quarts répété partout est rejeté (« les angles se ressemblent trop »).

- Modèle : **Nano Banana 2.1**, 2k, carré, 2 crédits/image.
- Chaque produit reçoit dans l'ordre : **plan large** (toute la pièce, produit petit), **mise en scène** (coin lecture, rebord
  de fenêtre, lit du dimanche, panier, banc), **détail** (texture en lumière rasante). Les variantes tournent d'un produit à l'autre.
- Lumières variées (matin en contre-jour, fin d'après-midi dorée), pièces variées (salon, chambre, coin fenêtre).
- Fin de prompt commune : « Use the reference image only to reproduce this exact product… natural, lived-in, quiet… »
- Script de référence : `plans_v4.py` (dans le dossier de travail de la série).

## Mise à jour du 29/10/2026 (soir) : intégrer le produit, pas le coller

Retour de Basile sur la première série : avec la consigne « même position, même taille, ne le bouge pas », le produit est posé
à plat, de face, sans perspective ni contact : rendu collé, pas beau. Nouvelle consigne, validée sur 4 essais (housse salon,
housse chambre, plaid drapé, serviettes) :

> Re-photograph exactly this [product] in a real [room]. Keep its design identical: same pattern, same number and arrangement
> of motifs, same colours, same texture, same edges/fringes. Place it naturally with correct perspective and physics: [pose
> réaliste : coussin incliné qui s'enfonce dans l'assise, coins détendus ; plaid drapé sur l'accoudoir en plis souples ;
> couvre-lit qui couvre tout le lit et retombe sur les côtés ; serviettes pliées qui se tassent], soft contact shadows.
> The light on the product matches the room. Camera at a three-quarter angle, 50 mm, shallow depth of field. [style de la pièce]
> Only one [product]. No people, no animals, no text, no logos.

Règles apprises : toujours vérifier que la photo de référence est bien celle du produit (une erreur de référence donne un autre
produit) ; préciser la quantité vendue (« only one ») ; retirer explicitement animaux et accessoires des photomontages fournisseur.

## Méthode retenue après essais (29/10/2026)

Essais comparés sur la housse AW « Cream Lux Criss-Cross » : Nano Banana 2.1, Flux Kontext, Seedream 5 Pro, GPT Image 2.5.
Le plus fidèle (motif, nombre de losanges, touffes, teinte) et le moins cher : **GPT Image 2.5, qualité « medium », 2k, 1 crédit**.
Flux Kontext et Seedream déforment ou éclaircissent le produit : écartés. Nano Banana 2.1 reste correct en secours (2 crédits).

1. Poser la photo fournisseur détourée (fond blanc) à ~45 % de la largeur, centrée, un peu sous le milieu, sur une toile blanche 2048 × 2048.
   Le modèle construit alors la pièce autour du produit sans le recadrer.
2. Prompt = consigne d'édition ci-dessous + scène de la pièce.
3. Contrôle visuel du produit, original et résultat côte à côte : motif, proportions, couleur. Un résultat douteux est refait ou écarté.
4. Mention « Image virtuelle » sur toute image dont le décor est généré.

Consigne d'édition (toujours en tête du prompt) :

> Edit the image: replace only the plain white background with a photorealistic cosy French interior. Preserve the product
> exactly as photographed: same position, same size, same outline, same pattern and number of motifs, same texture, same
> colours. Do not redraw or move it.

## Première méthode envisagée (abandonnée : le recollage des pixels donne un rendu découpé)

1. Partir de la photo fournisseur sur fond blanc, en haute définition.
2. Générer le décor avec le prompt ci-dessous, la photo en référence (modèle d'édition d'image, format « auto » pour garder le cadrage).
3. Recoller par-dessus les pixels d'origine du produit (masque = tout ce qui n'est pas le fond blanc), puis adoucir le bord.
   Le produit affiché est donc celui du fournisseur au pixel près : couleur, motif et texture inchangés.
4. Contrôler : écart de couleur du produit ≤ 3 % avec l'original, aucun objet en double, aucun texte ni logo.
5. Mention « Image virtuelle » sur toute image dont le décor est généré.

## Bloc commun (toujours inclus)

> Photorealistic interior product photograph for a premium French home-linen brand. Warm, airy, minimal and cosy
> interior: creamy ivory and warm off-white walls, soft beige tones, light oak wood, natural linen, a few dried
> pampas or olive branches at most. Soft diffuse morning daylight from a side window with sheer linen curtains,
> gentle natural shadows, no harsh contrast, no colour cast. 50 mm lens, eye level, shallow depth of field,
> editorial catalogue look, uncluttered. No people, no text, no logos, no watermark, no other patterned textiles.
>
> Keep the product from the reference image exactly as it is: same shape, proportions, pattern, colours, texture,
> stitching and fringe, same position and size in the frame. Do not recolour, restyle, redraw or duplicate it.
> Only replace the plain white background with the scene described below.

Palette du site pour mémoire : ivoire `#F7F3EB`, beige `#EAE4D9`, brun texte `#2C2621`, accent bordeaux `#6A3A3A`
(l'accent n'apparaît jamais en grand dans le décor).

## Blocs par pièce

| Pièce | Scène (ajoutée au bloc commun) | Catégories |
|---|---|---|
| Salon | The product rests on a cream linen or bouclé sofa, a light oak side table with a ceramic vase nearby, soft plaster wall behind. | housses de coussin, coussins, plaids |
| Chambre | The product lies on a neatly made bed with plain ivory linen bedding, a light oak bedside table with a small ceramic lamp, softly panelled cream wall. | couvre-lits, housses de couette, draps, taies, oreillers, couettes, plaids |
| Salle de bain | The product is neatly folded on a light oak stool or hangs on a wooden towel ladder, cream zellige tiles and a stone basin softly blurred behind. | serviettes, tapis de bain |
| Sol (tapis) | The rug lies flat on a light oak parquet floor, seen from a slightly high angle, the edge of a linen sofa or a wooden bench in the background. | tapis |
| Fenêtre (rideaux) | The curtain hangs from a slim black or brass rod in front of a tall window, morning light passing through, light oak floor. | rideaux |

Pour 3 vues par produit : vue 1 = pièce principale de la catégorie, vue 2 = seconde pièce (ex. plaid : salon puis chambre),
vue 3 = gros plan de la matière dans le même décor (« close-up detail of the fabric texture, same room, shallow depth of field »).
