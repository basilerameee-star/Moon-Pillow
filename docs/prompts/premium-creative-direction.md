Tu es un Directeur Artistique et Développeur Front-End spécialisé dans le e-commerce de luxe (High-End Home Decor). Tu dois coder une maquette fonctionnelle (HTML/CSS/JS) pour la marque "Moon & Pillow" (linge de maison premium).
Nous appliquons les principes de Sam Crawford (restriction volontaire, espace blanc, hiérarchie visuelle) couplés aux données de conversion (CRO) du secteur de la maison.

🚫 RÈGLE D'OR ABSOLUE (NON NÉGOCIABLE)
ZÉRO FOND BLANC (#FFFFFF) DERRIÈRE LES PRODUITS. Les produits doivent être présentés exclusivement via des photos lifestyle (mise en scène) et des photos macro (gros plan sur la texture). Le fond blanc est interdit pour les visuels produits.

📊 DONNÉES DE MARCHÉ À INTÉGRER (Les "Pourquoi" de ton design)

· La recherche est cruciale : Les utilisateurs qui cherchent convertissent 7 fois plus (4% vs 0,6%). Intègre une vraie barre de recherche visible dans le header.
· La vidéo augmente l'ajout au panier de 12 à 34% : Prévois un emplacement vidéo sur la fiche produit (le tissu qui bouge).
· Le Sticky Cart est indispensable : Le bouton d'achat doit rester fixé en bas de l'écran quand on scrolle (surtout sur mobile).
· Le Shop the Look : Les clients veulent acheter l'ambiance. Crée des images de scènes avec des "hotspots" (points cliquables) sur les produits.

🎨 1. SYSTÈME DE DESIGN (Variables CSS obligatoires)

· --bg-main: #F7F3EB (Beige chaud - Fond de page).
· --bg-card: #EAE4D9 (Beige plus foncé - Fond de secours si l'image charge mal).
· --text-dark: #2C2621 (Marron très foncé - Titres).
· --text-light: #6B635E (Taupe - Textes secondaires, prix).
· --accent: #6A3A3A (Bordeaux profond - UNIQUEMENT pour les CTA et le mot "demeure").
· --font-title: 'Playfair Display', serif (Google Fonts).
· --font-body: 'Inter', sans-serif (Google Fonts).
· Espacement : Padding vertical généreux (padding: 6rem 5%). Grille avec gap: 3rem. Laisse respirer le contenu.

🧱 2. ARCHITECTURE DE LA PAGE D'ACCUEIL

· Header (Sticky) : Logo "Moon & Pillow" (Playfair). Navigation centrée : La Collection, La Chambre, Le Salon, Notre Univers. À droite : Barre de recherche (input text), icône Panier.
· Hero Section (Split 50/50) : Gauche : Titre "La douceur, à demeure.", sous-titre court, CTA bordeaux. Droite : Image d'ambiance Unsplash (lit texturé, lumière naturelle).
· Bandeau de Réassurance (Sous le Hero) : 3 icônes fines + texte : Livraison offerte dès 80€ | Retours 30 jours | Paiement sécurisé.
· Section "Shop the Look" : Image immense d'un salon. Ajoute des hotspots (petits cercles bordeaux) positionnés en CSS absolu sur les coussins/plaids. Au survol d'un hotspot, affiche une infobulle avec le nom du produit et son prix.
· Section Produits (Grille 3 colonnes) :
· Chaque carte produit affiche une image lifestyle.
· Micro-interaction (Survol) : L'image lifestyle disparaît en fondu (transition 0.5s) pour révéler l'image macro (texture).
· Sous l'image : Titre (Playfair), Prix (Inter, plus petit), 3 pastilles de couleur (cercles CSS).

🛒 3. LA FICHE PRODUIT (PDP) - Optimisée CRO

· Gauche : Carrousel d'images (Lifestyle > Macro > Emplacement Vidéo avec un bouton "Play").
· Droite :
· Titre, Prix.
· Preuve Sociale : Note "★★★★★ 4.9/5 (basé sur 124 avis)" cliquable.
· Sélecteur de couleur (pastilles).
· Bouton "Ajouter au panier" (Bordeaux, pleine largeur).
· Sticky Add to Cart : En CSS/JS, faire en sorte que le bouton d'ajout au panier reste collé en bas de la fenêtre (position: fixed; bottom: 0;) après avoir scrollé au-delà de la zone d'achat initiale.
· Accordéon Informations : Matière & Entretien / Dimensions / Livraison & Retours.

⚙️ 4. FONCTIONNALITÉS JAVASCRIPT (À coder)

· Slide-out Cart (Tiroir latéral) : Au clic sur "Ajouter au panier", ne recharge pas la page. Fais glisser un panneau depuis la droite (transform: translateX(100%) vers 0).
· Upsell intelligent : Dans le tiroir latéral, affiche "Complétez votre cocon" avec 1 produit suggéré (ex: si c'est un drap, proposer la taie d'oreiller).
· Menu déroulant (Filtres) : Interdiction d'utiliser le <select> natif. Crée un menu custom en CSS avec fond beige et chevron personnalisé.

📱 5. RESPONSIVE & CONTENU

· Mobile : La grille passe à 1 colonne. Le Hero s'empile (texte au-dessus, image en dessous). Le bouton d'achat sticky est hyper accessible.
· Images : Utilise des liens Unsplash qui correspondent à l'ambiance (ex: https://images.unsplash.com/photo-1584100936595-c0654b55a2e2 pour un canapé). Aucun fond blanc.
· Texte : Rédige des textes courts, évocateurs et sensibles (pas de jargon technique). Ex: "Un lin lavé qui se patine avec le temps."

Génère le code complet (HTML/CSS/JS) dans un seul fichier pour un test immédiat, en commentant les sections clés (ex: /* --- SECTION SHOP THE LOOK --- */).

---

💡 Pourquoi ce prompt est-il beaucoup plus puissant ?

1. Il justifie les choix : L'IA sait pourquoi elle doit mettre une barre de recherche (4% de conversion) ou une vidéo (+12% d'ajout au panier). Elle fera donc des choix de design cohérents avec ces objectifs.
2. Il détaille les micro-interactions : Il précise comment faire le fondu au survol, comment coder le tiroir latéral, et comment faire le Sticky Cart.
3. Il donne le contenu exact : Il impose les textes ("La douceur, à demeure"), les polices, les couleurs exactes (avec les codes hexadécimaux), et même les liens d'images de test.
4. Il structure le parcours utilisateur : Il suit exactement l'entonnoir dont nous avons parlé (Inspiration avec le Shop the Look -> Découverte avec les macros -> Conversion avec le Sticky Cart et l'Upsell).
