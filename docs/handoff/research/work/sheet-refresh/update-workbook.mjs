import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const dependencyModules =
  "C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const artifactEntry = require.resolve("@oai/artifact-tool", {
  paths: [dependencyModules],
});
const { FileBlob, SpreadsheetFile } = await import(
  pathToFileURL(artifactEntry).href
);

const workbookPath =
  "outputs/01a16951-c1e0-7ea1-8f06-d2e9250ed4ff/Moon-and-Pillow-audit-et-catalogue.xlsx";
const previewPath = "work/sheet-refresh/Moon-and-Pillow-audit-updated.png";
const temporaryWorkbookPath =
  "work/sheet-refresh/Moon-and-Pillow-audit-updated.xlsx";

const workbook = await SpreadsheetFile.importXlsx(
  await FileBlob.load(workbookPath),
);
const summary = workbook.worksheets.getItem("Synthèse");
const audit = workbook.worksheets.getItem("Audit DeepSeek");
const later = workbook.worksheets.getItem("À garder pour plus tard");

summary.getRange("A44:C44").values = [[
  "Domaine",
  "moonandpillow.com actif; www en configuration",
  "Le domaine est acheté. Cloudflare relie les deux hôtes au projet moon-and-pillow.pages.dev. Le sous-domaine www est encore en propagation.",
]];
summary.getRange("A45:C45").copyFrom(summary.getRange("A44:C44"), "all");
summary.getRange("A45:C45").values = [[
  "Version publique Cloudflare",
  "Ancienne maquette sur moon-and-pillow.pages.dev",
  "Le domaine raccordé sert encore une maquette à trois entrées de collection avec un Ensemble Cocon à 79,90 € et le bandeau « Livraison offerte · Retour sous 14 jours ». Ce n’est pas le catalogue local audité de 221 références.",
]];
summary.getRange("A44:C45").format.wrapText = true;
summary.getRange("A44:C45").format.verticalAlignment = "center";
summary.getRange("A44:C45").format.rowHeight = 52;

audit.getRange("B44:E44").values = [[
  "moonandpillow.com et www.moonandpillow.com",
  "Racine active; www en configuration",
  "Achat confirmé sur Cloudflare. La racine est active; www affiche « being set up » et peut prendre jusqu’à 48 h. Les deux noms sont associés au projet moon-and-pillow.pages.dev.",
  "Le domaine est raccordé, mais le projet sert encore l’ancienne maquette. Vérifier DNS et HTTPS après publication de la version auditée.",
]];
audit.getRange("B43:E43").values = [[
  "Lint ESLint",
  "Avertissements seulement",
  "npm run lint réussit : 0 erreur et 13 avertissements, principalement sur les images HTML non optimisées.",
  "Examiner les avertissements d’images avant une ouverture publique; aucune erreur bloquante de lint ne subsiste.",
]];

later.getRange("A11:D11").values = [[
  "Domaine et SEO public",
  "Domaine acheté; publication et indexation à finaliser",
  "Contrôler DNS/HTTPS, publier uniquement la version validée, puis activer l’indexation après recette et validation des informations commerciales.",
  "moonandpillow.com enregistré; racine active, www en configuration. Le projet sert encore l’ancienne maquette et reste à vérifier avant indexation.",
]];
later.getRange("A11:D11").format.wrapText = true;
later.getRange("A11:D11").format.verticalAlignment = "center";
later.getRange("A11:D11").format.rowHeight = 60;

const additionalAuditRows = [
  [
    "Production Cloudflare",
    "Version réellement servie par moon-and-pillow.pages.dev",
    "Non conforme à la version auditée",
    "Le contrôle du 28/10/2026 montre la page « Doux comme une nuit de lune », les entrées Housses/Plaid/Ensemble, un Ensemble Cocon à 79,90 € et le bandeau « Livraison offerte · Retour sous 14 jours ». Cette version n’est pas le catalogue local de 221 références.",
    "Ne pas confondre le domaine rattaché au projet Cloudflare avec la préversion locale auditée. Remplacer la publication après recette et accord de mise en ligne.",
  ],
  [
    "Automatisation",
    "Architecture du prompt : Shopify, Make et Supabase",
    "Non raccordée; pile différente",
    "Le site public est un projet Cloudflare Pages. Le code de préparation utilise Cloudflare/Vinext. Aucune connexion Shopify, Make ou Supabase n’est confirmée dans le site.",
    "Décider de conserver Cloudflare et adapter les intégrations, ou de migrer vers Shopify. Ne créer aucun abonnement ni dépense sans accord.",
  ],
  [
    "Base et sécurité",
    "Tables Supabase, RLS, idempotence et accès service_role",
    "Non déployés",
    "Le SQL du prompt reste une spécification. Aucune base Supabase, politique RLS ou écriture idempotente de production n’est confirmée.",
    "Après choix d’architecture, vérifier les accès anon/service_role, les sauvegardes et les clés avant de connecter des données clients.",
  ],
  [
    "Gestion des erreurs",
    "Reprises 1/4/16 secondes et alerte Telegram",
    "Non raccordée",
    "Aucun scénario Make ni bot Telegram n’est branché; les reprises et limites de débit du prompt ne sont pas testées sur des services réels.",
    "Créer ce mécanisme avant les scénarios, puis vérifier les retries, les alertes et les cas de panne.",
  ],
  [
    "SEO produit",
    "Webhooks Shopify, brouillon SEO et publication humaine",
    "Non raccordé",
    "Aucun webhook Shopify ni synchronisation d’API ne met à jour des fiches. Le site n’a pas de flux de génération SEO relié aux produits.",
    "Si cette automatisation est retenue, générer uniquement des brouillons, sans inventer matière, tailles ou caractéristiques; publication humaine obligatoire.",
  ],
  [
    "Google Merchant Center",
    "Flux quotidien et contrôle prix/stock",
    "Non raccordé",
    "Aucun flux Merchant Center, API Google Shopping ou rapprochement planifié n’est confirmé. Les prix du catalogue sont proposés, pas approuvés.",
    "Attendre la validation du SKU, des variantes, du stock, du coût livré et du prix avant d’exposer des produits dans Google.",
  ],
  [
    "Réseaux sociaux",
    "Création de brouillons et programmation TikTok, Pinterest et Reels",
    "Non raccordé",
    "Buffer est cité par le fondateur, mais aucune connexion ni programmation automatique n’est vérifiée. Aucun contenu n’est publié automatiquement.",
    "Rester en brouillon jusqu’à validation des visuels, droits, texte et compte de publication.",
  ],
  [
    "E-mails automatisés",
    "Panier abandonné, bienvenue et fidélisation",
    "Non raccordé; délais contradictoires",
    "Le prompt maître prévoit une relance à 30 min puis 24 h; l’autre note propose 2 h, puis 3/7 jours et 3 mois. Les aperçus locaux n’envoient rien; consentement persistant, désinscription et service d’envoi manquent.",
    "Fixer les délais, puis vérifier consentement, désinscription, déduplication et état de commande avant tout envoi réel.",
  ],
  [
    "Traitement fournisseur",
    "Commande après paiement client, contrôle risque et suivi colis",
    "Non raccordé",
    "Aucune intégration Shopify/DSers/fournisseur ne transmet les commandes. Zéro coût fournisseur livré est approuvé et aucun stock/variante n’est synchronisé.",
    "L’achat automatique reste limité aux références, variantes et coûts livrés approuvés, après paiement client confirmé; aucune référence ne remplit encore ces critères.",
  ],
  [
    "Service client",
    "FAQ, chatbot et escalade remboursement/litige/UFC",
    "Partiel; escalade non raccordée",
    "Une FAQ existe. Aucun chatbot ni workflow Telegram d’escalade n’est actif. La règle d’escalade immédiate du prompt n’est donc pas exécutée par un système.",
    "Garder une prise en charge humaine des demandes de remboursement, litiges et réclamations jusqu’à une intégration testée.",
  ],
  [
    "Reporting et tendances",
    "Rapport quotidien et alertes de tendance",
    "Non raccordé",
    "Aucun flux de données Shopify, Google Ads, Klaviyo ou social n’alimente un rapport. SerpApi et les alertes de tendance ne sont pas configurés.",
    "N’activer le reporting qu’après connexion et vérification des sources; le prompt ne constitue pas une mesure de performance réelle.",
  ],
  [
    "Limites financières",
    "Prix et publicité validés par l’humain; remboursement plafonné; fournisseur payé après commande",
    "Règles documentées, non appliquées en production",
    "Le plafond autorisé est de 50 % du montant réellement payé, cumulé par commande. Stripe n’est pas connecté au site de préparation; réserve et plafond quotidien restent à définir. Budget publicitaire actif : 0 €.",
    "Ne pas automatiser avant d’avoir un registre durable, une réserve, un plafond quotidien et des essais en mode test. Un plafond technique ne réduit jamais le montant réellement dû au client.",
  ],
  [
    "Déploiement des workflows",
    "Checklist de mise en service et handover par workflow",
    "Non exécuté sur les services réels",
    "Les tests du prototype local ne prouvent pas une connexion Shopify, Supabase, Make, Merchant Center, Klaviyo, Stripe ou fournisseur.",
    "La checklist doit être rejouée sur l’architecture retenue, avec critères de succès vérifiables et sans mouvement d’argent réel.",
  ],
];

const parachuteAuditRows = [
  ["Navigation", "Méga-menu Lit, Bain, Déco", "Implémenté dans la préversion locale", "Le menu présente les familles et filtre directement la collection; un menu repliable équivalent est disponible sur mobile.", "Revoir l’ordre des catégories après validation du catalogue commercial."],
  ["Découverte couleur", "Shop by Color interactif avec scènes par nuance", "Implémenté sur les nuances documentées", "Les choix Sable, Terracotta, Romarin et Camel correspondent à des libellés et photos de mise en scène liés aux fiches; la sélection met à jour l’image et filtre la collection.", "Les scènes et les droits fournisseur restent à vérifier avant diffusion commerciale."],
  ["Filtres collection", "Pastilles de catégorie et de couleur; vues de matière", "Partiel", "Les catégories et quatre nuances se filtrent visuellement. Aucun filtre de matière n’est activé : les champs matière ne sont pas assez uniformes ou confirmés dans les 221 références.", "Ajouter des filtres de texture seulement après normalisation et vérification des matières par référence."],
  ["Confiance", "Barre repliable sous le titre de collection", "Implémenté pour la préouverture", "La barre explique que les avis suivent des commandes réelles, que les détails sont documentés par fiche et que les frais/conditions seront affichés avant paiement. Elle n’affiche ni note, ni certification, ni promesse non vérifiée.", "Remplacer les repères de préouverture par les éléments réels une fois prouvés."],
  ["Coffrets", "Bundle optionnel et remise de 15 %", "Composer prêt; remise non activée", "La section Coffret Cocon laisse chaque pièce choisie séparément. Aucun prix groupé ni réduction n’est calculé, car les coûts livrés et les prix de vente ne sont pas approuvés.", "Étudier une remise seulement après validation de la marge et du stock de chaque composant."],
  ["Preuve sociale", "Avis clients et citations de presse", "Conservé pour plus tard", "Aucune note, citation ou avis fictif n’est affiché. Les avis attendent des commandes réelles; une citation presse exige une source et une autorisation.", "Activer l’espace après collecte de preuves authentiques et consentements."],
  ["Fiche produit", "Galerie scène puis macro, vidéo, confiance et achat fixe", "Partiel; achat fixe déjà présent", "La galerie place les vues de mise en situation avant les macros et garde un emplacement vidéo; le bouton collant et les détails matière/format sont présents. Les informations non confirmées restent explicitement en attente.", "Produire les vidéos après validation des produits; préserver les notes d’ouverture tant que le checkout est fermé."],
  ["Variantes", "Mettre en premier les tailles les plus vendues", "Non justifiable avec les données actuelles", "Les formats documentés peuvent être sélectionnés, mais aucune donnée de ventes ou de demande ne permet d’identifier une taille la plus populaire.", "Ne pas étiqueter une taille « plus vendue » avant d’avoir des ventes mesurées."],
  ["Panier", "Upsell complémentaire dans le tiroir latéral", "Implémenté; correspondance de nuance prudente", "Le panier suggère une catégorie complémentaire (ex. taie avec housse de couette), privilégie un même nom de couleur et indique que la teinte réelle reste à vérifier. L’article reste ajouté séparément.", "Valider la compatibilité et les photos de chaque paire avant de proposer un assortiment exact."],
  ["Paiement", "Shop Pay, Apple Pay, Google Pay en express", "Non raccordé", "La boutique locale n’est pas connectée à Stripe et n’utilise pas Shopify. Aucun de ces moyens n’est présenté comme disponible; les moyens réels dépendront du choix d’architecture et du compte marchand.", "Vérifier l’éligibilité, le domaine, les frais et les moyens effectivement activés avant de les afficher."],
  ["Frais de livraison", "Frais et taxes visibles avant validation du paiement", "Préparé; montants non validés", "Le panier indique que la livraison est à confirmer avant l’ouverture. Aucun tarif fournisseur livré ni règle de taxe par destination n’est approuvé.", "Calculer le montant par destination et l’afficher avant tout paiement réel."],
  ["Photos et publication", "Zéro fond blanc, coloris exacts et inspiration Parachute", "Partiel; publication non effectuée", "La collection privilégie des scènes et les galeries associent scènes puis macros exactes quand elles existent. La règle zéro fond blanc n’est pas remplie dans toutes les galeries; aucun droit photo fournisseur n’est approuvé. La préversion locale n’est pas sur le domaine public.", "Vérifier les associations, remplacer les visuels non conformes par des images autorisées et valider la version avant déploiement."],
];

for (let row = 45; row <= 57; row += 1) {
  const sourceRow = row % 2 === 1 ? 43 : 44;
  audit
    .getRange(`A${row}:E${row}`)
    .copyFrom(audit.getRange(`A${sourceRow}:E${sourceRow}`), "all");
}
audit.getRange("A45:E57").values = additionalAuditRows;
for (let row = 58; row <= 69; row += 1) {
  const sourceRow = row % 2 === 1 ? 43 : 44;
  audit
    .getRange(`A${row}:E${row}`)
    .copyFrom(audit.getRange(`A${sourceRow}:E${sourceRow}`), "all");
}
audit.getRange("A58:E69").values = parachuteAuditRows;
audit.getRange("A44:E69").format.wrapText = true;
audit.getRange("A44:E69").format.verticalAlignment = "center";
audit.getRange("A44:E69").format.rowHeight = 60;

await workbook.recalculate();
const auditPreview = await workbook.render({
  sheetName: "Audit DeepSeek",
  autoCrop: "all",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  previewPath,
  new Uint8Array(await auditPreview.arrayBuffer()),
);
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(temporaryWorkbookPath);
const check = await workbook.inspect({
  kind: "region",
  sheetId: "Audit DeepSeek",
  range: "A43:E69",
  maxChars: 12000,
});
console.log(check.ndjson);
console.log(`Saved ${temporaryWorkbookPath}`);
