═══════════════════════════════════════════════════════════════════
PROMPT MAÎTRE UNIFIÉ — AUTOMATISATION COMPLÈTE MOON AND PILLOW
Spécification (niveau 1) + Manuel de construction (niveau 2)
═══════════════════════════════════════════════════════════════════

RÔLE
Tu es architecte d'automatisation e-commerce senior. Tu produis une
spécification EXÉCUTABLE et un MANUEL DE CONSTRUCTION nœud par nœud
pour automatiser Moon and Pillow (Shopify, linge de lit, fondateur
solo, budget outils 0 € en phase 1).

RÈGLES DE SORTIE
- Pour chaque workflow : (A) SPEC puis (B) CONSTRUCTION.
- (A) SPEC = déclencheur, seuils chiffrés, logique, sortie.
- (B) CONSTRUCTION = nœuds numérotés, méthode HTTP, URL exacte,
headers, payload JSON, conditions de filtre, gestion d'erreur.
- Les appels API sont donnés en brut (durables) ; les libellés
d'interface Make.com sont indicatifs (ils changent).
- Aucune publication automatique. Les workflows créent des DRAFTS.

IMPÉRATIFS NON NÉGOCIABLES
1. Contenu IA → statut `draft` dans Shopify. Publication = humaine.
2. Budget pub / prix : le système ALERTE, l'humain VALIDE.
3. Délai livraison + politique retour visibles sur chaque fiche.
4. Chaque workflow a un error handler (Bloc 1.4).
5. Messages contenant "remboursement|litige|avocat|UFC" → escalade
humaine immédiate, zéro réponse auto.

CONTEXTE TECHNIQUE
Shopify Admin API version 2024-10. Auth : header
`X-Shopify-Access-Token: {token}`. Base : https://{shop}.myshopify.com
Supabase REST : https://{project}.supabase.co/rest/v1/{table}
headers : apikey + Authorization: Bearer {service_role_key}
OpenAI : POST https://api.openai.com/v1/chat/completions
Klaviyo : POST https://a.klaviyo.com/api/events/ (revision 2024-10-15)
Google Ads / Merchant Center : via OAuth2 service account.

═══════════════════════════════════════════════════════════════════
BLOC 1 — ARCHITECTURE
═══════════════════════════════════════════════════════════════════

1.1 ORCHESTRATEUR
Make.com (plan gratuit 1000 ops/mois) pour : SEO produit, social,
panier abandonné, reporting, fulfilment.
n8n (self-host) uniquement si analyse d'image GPT-4o Vision requise
sur volume. Les deux coexistent.

1.2 SCHÉMA SUPABASE (SQL à exécuter tel quel)

CREATE TABLE produits (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
sku text UNIQUE NOT NULL,
shopify_product_id bigint UNIQUE,
titre_shopify text,
titre_seo_genere text,
description_generee text,
meta_description_generee text,
statut text CHECK (statut IN ('draft','publie','rejete','seo_a_corriger')),
image_url text,
categorie text,
prix_achat numeric(10,2),
prix_vente numeric(10,2),
marge_brute numeric(10,2) GENERATED ALWAYS AS (prix_vente - prix_achat) STORED,
date_creation timestamptz DEFAULT now(),
date_publication timestamptz
);

CREATE TABLE clients (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
email text UNIQUE NOT NULL,
segment text CHECK (segment IN ('nouveau','fidele','vip')),
ltv numeric(10,2) DEFAULT 0,
date_premier_achat timestamptz,
date_dernier_achat timestamptz,
source_acquisition text
);

CREATE TABLE commandes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
shopify_order_id bigint UNIQUE NOT NULL,
client_id uuid REFERENCES clients(id),
montant_total numeric(10,2),
statut_paiement text,
statut_livraison text,
tracking_number text,
risque_score int DEFAULT 0,
date_commande timestamptz DEFAULT now(),
date_expedition timestamptz
);

CREATE TABLE contenus (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
type text CHECK (type IN ('tiktok','pinterest','reel','blog')),
titre text,
description text,
fichier_url text,
plateforme text,
statut text CHECK (statut IN ('a_publier','publie','rejete','a_recycler','archive')),
date_publication_prevue timestamptz,
date_publication_reelle timestamptz,
performance_vues int DEFAULT 0,
performance_engagement numeric(6,2) DEFAULT 0,
url_publication text
);

CREATE TABLE rapports (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
date date UNIQUE NOT NULL,
ca_jour numeric(10,2),
aov numeric(10,2),
taux_conversion numeric(6,3),
cpa_google numeric(10,2),
roas_google numeric(8,2),
depense_pub numeric(10,2),
paniers_abandonnes int,
paniers_recuperes int,
provision_retours numeric(10,2),
actions_recommandees text
);

CREATE INDEX idx_produits_sku ON produits(sku);
CREATE INDEX idx_commandes_order ON commandes(shopify_order_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_contenus_statut ON contenus(statut, date_publication_prevue);

RLS : activer sur toutes les tables. Policy : service_role only
(pas d'accès anon).

1.3 CONVENTIONS
- Idempotence : toute écriture utilise ON CONFLICT (clé) DO UPDATE.
- Chaque workflow traite 1 enregistrement par exécution (jamais de lot).
- Clé d'idempotence stockée dans une colonne `idempotency_key` quand
pertinent (évite les doublons sur retry).

1.4 ERROR_HANDLER (workflow global, à créer en PREMIER)
Déclencheur : Error handler de Make.com attaché à chaque scénario
(route "Error" sur chaque module externe).
Nœud 1 : Set variables → workflow_name, record_id, error_code,
error_reason (mappés depuis le bundle d'erreur Make).
Nœud 2 : Router
- Branche A (error_code = 429 ou timeout) → Sleep 1s → retry
(Make "Retry" handler, 3 tentatives : 1s / 4s / 16s).
- Branche B (autre) → Telegram.
Nœud 3 (Branche B) : Telegram Bot "Send Message"
POST https://api.telegram.org/bot{token}/sendMessage
payload : { chat_id, text: "⚠️ {workflow_name} | record {record_id}
| {error_code} | {error_reason}", parse_mode: "HTML" }
Rate limit Telegram : 20 messages/min/canal → bufferiser au-delà.

═══════════════════════════════════════════════════════════════════
BLOC 2 — WORKFLOW PRODUITS_SEO
═══════════════════════════════════════════════════════════════════

(A) SPEC
Déclencheur : webhook Shopify `products/create` + `products/update`.
Filtre : body_html vide OU tag "SEO_A_GENERER" présent.
Traitement : 1 produit par exécution.
Sortie : produit mis à jour en `draft` dans Shopify + ligne `produits`
en statut `draft` + notification Telegram avec lien admin.
Ne publie JAMAIS.

(B) CONSTRUCTION

Nœud 1 — Webhook (custom webhook Make)
URL fournie par Make → à coller dans Shopify :
Paramètres → Notifications → Webhooks → créer 2 webhooks :
Event "Product creation" → URL Make
Event "Product update" → URL Make
Header attendu : X-Shopify-Topic

Nœud 2 — Filter
Condition : {{1.body_html}} = "" OR {{1.tags}} contains "SEO_A_GENERER"
Si faux → stop.

Nœud 3 — HTTP GET (données complètes + variantes)
GET https://{shop}.myshopify.com/admin/api/2024-10/products/{{1.id}}.json
Headers : X-Shopify-Access-Token: {token}
Sortie : produit complet (variants, images, options).

Nœud 4 — HTTP POST OpenAI (génération)
POST https://api.openai.com/v1/chat/completions
Headers : Authorization: Bearer {openai_key}
Content-Type: application/json
Payload :
{
"model": "gpt-4o",
"temperature": 0.7,
"response_format": { "type": "json_object" },
"messages": [
{ "role": "system", "content": "<SYSTEM_PROMPT ci-dessous>" },
{ "role": "user", "content": "Titre: {{3.title}} | Type: {{3.product_type}} | Tags: {{3.tags}} | Variantes: {{3.variants}} | Image: {{3.images[1].src}}" }
]
}

SYSTEM_PROMPT (à copier tel quel) :
"""
Tu es rédacteur SEO e-commerce pour Moon and Pillow, marque française
de linge de lit apaisant, lavable, durable.
Voix : chaleureuse, sensorielle, sans superlatif vide. On décrit la
sensation avant la technique. On répond aux objections (rétrécissement,
entretien, taille) DANS le texte.
Titre SEO : 55-60 car., matière + taille principale + usage.
Meta description : 145-155 car., bénéfice + réassurance.
Description HTML : 200-300 mots, <h2> pour Matière / Entretien /
Ce qui est inclus. 2-3 liens internes vers /collections/{slug}.
Tags : 5-8, minuscules, sans accent.
Sortie JSON strict : {titre_seo, meta_description, description_html, tags[]}
"""

Nœud 5 — Parse JSON (module Make "Parse JSON" sur {{4.choices[1].message.content}})

Nœud 6 — HTTP PUT Shopify (mise à jour DRAFT)
PUT https://{shop}.myshopify.com/admin/api/2024-10/products/{{1.id}}.json
Headers : X-Shopify-Access-Token: {token}
Content-Type: application/json
Payload :
{
"product": {
"id": {{1.id}},
"title": "{{5.titre_seo}}",
"body_html": "{{5.description_html}}",
"tags": "{{join(5.tags; \",\")}}",
"status": "draft",
"metafields_global_description_tag": "{{5.meta_description}}"
}
}

Nœud 7 — Supabase UPSERT `produits`
POST https://{project}.supabase.co/rest/v1/produits
Headers : apikey, Authorization, Prefer: resolution=merge-duplicates
Payload : { sku, shopify_product_id, titre_seo_genere,
description_generee, meta_description_generee, statut:"draft",
prix_achat, prix_vente }

Nœud 8 — Telegram notification validation
POST https://api.telegram.org/bot{token}/sendMessage
text : "📝 Draft prêt : {titre_seo}\nAdmin : https://{shop}.myshopify.com/admin/products/{id}\nRéponds OK pour publier."
(La publication = workflow séparé déclenché par ta réponse "OK",
JAMAIS automatique.)

ERROR : route Error sur nœuds 3,4,6,7 → ERROR_HANDLER.

═══════════════════════════════════════════════════════════════════
BLOC 3 — WORKFLOW MERCHANT_FEED
═══════════════════════════════════════════════════════════════════

(A) SPEC
Méthode principale : Scheduled Fetch quotidien 03:00 (Paris) depuis
l'URL de flux générée par l'app Google & YouTube de Shopify.
Méthode secours : Content API sur `products/update` si prix ou stock
changent (promo flash, rupture).
Contrôle cohérence : quotidien 23:00, compare flux vs page produit.

(B) CONSTRUCTION

Nœud 1 — Scheduler (Make, tous les jours 03:00 Europe/Paris)
Nœud 2 — Rien à faire côté Make (Google Merchant Center récupère
l'URL). Configuration côté GMC : Produits → Flux → Récupération
planifiée → URL {flux_shopify} → Fréquence quotidienne 03:00.

Nœud 3 — Contrôle cohérence (23:00)
HTTP GET https://{shop}.myshopify.com/admin/api/2024-10/products.json?limit=250
Headers : X-Shopify-Access-Token
Pour chaque produit : comparer {{variants[].price}} et
{{variants[].inventory_quantity}} avec la valeur du flux GMC
(HTTP GET sur l'URL de flux, parse XML).
Si écart → Telegram prioritaire :
"🚨 Écart flux : {sku} | Shopify {prix} vs GMC {prix}"

Nœud 4 — Mise à jour temps réel (webhook products/update)
Filter : prix OU inventory_quantity modifiés.
POST https://shoppingcontent.googleapis.com/content/v2.1/{merchantId}/products/{productId}
Auth : OAuth2 service account (scope content)
Payload : { price: { value, currency:"EUR" }, availability }

═══════════════════════════════════════════════════════════════════
BLOC 4 — WORKFLOW SOCIAL
═══════════════════════════════════════════════════════════════════

(A) SPEC
Source : vidéos brutes déposées dans Google Drive / Dropbox.
Découpe : OpusClip si >60s, sinon conversion 9:16.
Publication : TikTok 1/j à 18:00, Pinterest 5-10/sem (mar/jeu/sam),
Instagram Reels 1/j ou /2j.
Recyclage : dimanche 20:00, contenus > médiane → repost J+21 à J+28.

(B) CONSTRUCTION

Nœud 1 — Watch Google Drive folder `RAW_VIDEOS`
Make "Google Drive > Watch files in a folder", interval 15 min.
Nœud 2 — Router
- Branche A : {{duration}} > 60 → HTTP POST OpusClip API
(endpoint /api/clips, auth Bearer) → attend webhook retour.
- Branche B : {{duration}} <= 60 → module Make "Video > Resize"
(ou FFmpeg cloud) → 1080x1920.
Nœud 3 — Upload résultat → Google Drive `CONTENUS_TIKTOK`
Nœud 4 — Supabase INSERT `contenus`
{ type:"tiktok", fichier_url, statut:"a_publier",
date_publication_prevue: now + 1 jour à 18:00 }

Nœud 5 — Scheduler publication TikTok (quotidien 18:00)
Supabase SELECT `contenus` WHERE statut='a_publier' AND
plateforme='tiktok' ORDER BY date_publication_prevue LIMIT 1
HTTP POST WoopSocial / Onlypult API (endpoint /post)
Payload : { video_url, caption, scheduled_at, platform:"tiktok" }
→ Supabase UPDATE statut='publie', url_publication, date_publication_reelle

Nœud 6 — Scheduler Pinterest (mar/jeu/sam 10:00)
Même logique, plateforme='pinterest', image 1000x1500.
Caption = titre avec mots-clés (ex "Housse de couette lin lavé 160x200")

Nœud 7 — Recyclage (dimanche 20:00)
Supabase SELECT contenus publiés >7j
Calcul médiane engagement par plateforme
Si engagement > médiane → UPDATE statut='a_recycler',
date_publication_prevue = now + 21..28j
Sinon → statut='archive'
(Le repost réutilise le même fichier ; un prompt IA optionnel
régénère l'accroche.)

═══════════════════════════════════════════════════════════════════
BLOC 5 — WORKFLOW PANIER_ABANDONNE
═══════════════════════════════════════════════════════════════════

(A) SPEC
Déclencheur : checkouts/update, panier non converti depuis 30 min.
Segments : nouveau (<80€) / hésitant (>80€) / fidèle.
Relance 1 à 30 min, relance 2 à 24 h (angle différent).
Objectif : 12-18 % de paniers récupérés.

(B) CONSTRUCTION

Nœud 1 — Webhook Shopify `checkouts/update`
Filter : {{abandoned_checkout_url}} présent AND
{{completed_at}} = null
Nœud 2 — Sleep 30 minutes (module Make "Sleep")
Nœud 3 — HTTP GET Shopify
GET https://{shop}.myshopify.com/admin/api/2024-10/checkouts/{{id}}.json
→ vérifier que le checkout n'est toujours pas converti
(si converted_at non null → stop).
Nœud 4 — Supabase SELECT client par email
→ déterminer segment (historique commandes)
Logique : count(commandes)=0 → "nouveau"
count>=1 AND ltv<300 → "fidele"
ltv>=300 → "vip"
Nœud 5 — HTTP POST OpenAI (génération email)
Payload avec SYSTEM_PROMPT :
"""
Email de relance panier Moon and Pillow. Ton chaleureux, jamais
insistant. Objectif : lever l'objection.
Segment nouveau → réassurance (retour 30j, livraison suivie).
Segment hésitant → avis client 5★ avec photo OU code promo.
Segment fidèle → remerciement + produit complémentaire.
Objet 45-55 car. Corps 80-120 mots. CTA unique "Reprendre ma commande".
Sortie JSON : {objet, corps_html, cta}
"""
Nœud 6 — HTTP POST Klaviyo event
POST https://a.klaviyo.com/api/events/
Headers : Authorization: Klaviyo-API-Key {key},
revision: 2024-10-15, Content-Type: application/json
Payload :
{
"data": {
"type": "event",
"attributes": {
"properties": { "objet": "...", "corps_html": "...", "cta": "..." },
"metric": { "data": { "type": "metric", "attributes": { "name": "Abandoned Cart Recovery" } } },
"profile": { "data": { "type": "profile", "attributes": { "email": "{{email}}" } } }
}
}
}
Nœud 7 — Scheduler relance 2 (J+1, 24h après relance 1)
Même pipeline, prompt différent (urgence stock OU preuve sociale).
Ne s'exécute que si la commande n'a toujours pas été passée.

═══════════════════════════════════════════════════════════════════
BLOC 6 — WORKFLOW FULFILMENT
═══════════════════════════════════════════════════════════════════

(A) SPEC
Déclencheur : orders/paid.
Scoring risque : pays, montant>200€, premier achat, cohérence email.
Risque élevé → blocage + alerte. Risque faible → DSers/agent.
Provision retours : 5-10 % du CA dans `rapports`.

(B) CONSTRUCTION

Nœud 1 — Webhook Shopify `orders/paid`
Nœud 2 — Scoring (Set variables + calcul)
score = 0
+20 si montant > 200
+30 si adresse pays != pays de livraison déclaré
+25 si premier achat ET montant > 150
+25 si email jetable (domaine dans liste)
(liste jetables : yopmail, mailinator, guerrillamail, etc.)
Nœud 3 — Router
- score >= 50 → Supabase UPDATE commandes risque_score,
Telegram "🔴 Commande bloquée {order_id} score {score} —
vérifier manuellement". STOP.
- score < 50 → Nœud 4.
Nœud 4 — HTTP POST DSers / agent API
Payload : { order_id, sku_list, shipping_address }
→ attendre tracking_number (webhook retour ou polling 6h).
Nœud 5 — HTTP POST Shopify fulfillment
POST https://{shop}.myshopify.com/admin/api/2024-10/orders/{id}/fulfillments.json
Payload : { fulfillment: { location_id, tracking_number, notify_customer:true } }
Nœud 6 — Supabase UPDATE commandes (tracking, statut_livraison)
Nœud 7 — Supabase UPDATE rapports
provision_retours = ca_jour * 0.07

═══════════════════════════════════════════════════════════════════
BLOC 7 — WORKFLOW SUPPORT
═══════════════════════════════════════════════════════════════════

(A) SPEC
Chatbot formé sur FAQ, retours, délais, suivi commande.
Escalade humaine : mots-clés litige + cas complexes.

(B) CONSTRUCTION

Nœud 1 — Chatbot (Chat Squeeze / agent IA API)
System prompt : FAQ produit (tailles, matières, entretien),
politique retour 30j, délais 10-15j ouvrés, suivi via API Shopify.
Doit répondre de façon concise et proposer un lien de suivi.
Nœud 2 — Filter escalade
IF message contains "remboursement|litige|avocat|UFC|plainte"
OR intent = "refund" → escalade.
Nœud 3 — Telegram alerte escalade
"🆘 Support escalade : {email} | {message}"
Nœud 4 — Supabase INSERT conversation log (optionnel)

═══════════════════════════════════════════════════════════════════
BLOC 8 — WORKFLOW REPORTING
═══════════════════════════════════════════════════════════════════

(A) SPEC
Rapport quotidien 23:00, agrège Shopify + Google Ads + Klaviyo +
social. Section "Actions recommandées" générée par IA.
Tendances : SerpApi chaque matin 06:00, momentum +30% → alerte.

(B) CONSTRUCTION

Nœud 1 — Scheduler 23:00 Europe/Paris
Nœud 2 — HTTP GET Shopify
GET /admin/api/2024-10/orders.json?created_at_min={today}&status=any
Nœud 3 — HTTP GET Google Ads (API)
Métriques veille : impressions, clics, cost, conversions
Nœud 4 — HTTP GET Klaviyo (metrics API)
Abandons + récupérations du jour
Nœud 5 — Calcul KPIs (Set variables / outils Make "Math")
ca_jour, aov, taux_conversion, cpa, roas
Nœud 6 — HTTP POST OpenAI
System prompt :
"""
Analyste e-commerce. KPIs : {kpis}. Objectifs : {objectifs}.
Rédige 3 recommandations concrètes, 2 phrases chacune, priorisées
par impact CA.
"""
Nœud 7 — Supabase UPSERT `rapports` (date UNIQUE)
Nœud 8 — Telegram + Email
Rapport HTML avec section "Actions recommandées".

Nœud 9 — Scheduler tendances 06:00
HTTP GET SerpApi Google Trends pour chaque mot-clé cible
Calcul momentum = (vol_7j - vol_14j_avg) / vol_14j_avg
Si > 0.30 → Telegram "📈 Tendance {kw} +{x}% — pousser {sku}"

═══════════════════════════════════════════════════════════════════
BLOC 9 — BARRIÈRES HUMAINES (rappel)
═══════════════════════════════════════════════════════════════════
JAMAIS automatisé : publication de contenu produit (draft only),
augmentation budget pub, changement de prix, réponse aux litiges.
Le système alerte et recommande ; l'humain valide.

═══════════════════════════════════════════════════════════════════
BLOC 10 — CHECKLIST DE DÉPLOIEMENT (ordre strict)
═══════════════════════════════════════════════════════════════════
1. Créer comptes : Make (gratuit), Supabase (gratuit), OpenAI API
(clé + limite dépense 20€/mois), Klaviyo (gratuit 250 contacts),
Google Merchant Center, SerpApi (gratuit 100 req/mois).
2. Exécuter le SQL Supabase (Bloc 1.2). Activer RLS.
3. Générer Shopify Admin API token (scopes : read_products,
write_products, read_orders, write_orders, read_fulfillments,
read_checkouts).
4. Créer workflow ERROR_HANDLER (Bloc 1.4). Tester avec une erreur
volontaire (mauvais token) → vérifier alerte Telegram < 2s.
5. Créer PRODUITS_SEO. Tester "run once" sur 1 produit test avec
body_html vide → vérifier draft Shopify + ligne Supabase.
6. Créer MERCHANT_FEED. Valider flux GMC + contrôle cohérence.
7. Créer SOCIAL. Tester dépôt 1 vidéo → vérifier ligne `contenus`.
8. Créer PANIER_ABANDONNE. Tester checkout abandonné réel → vérifier
email Klaviyo reçu.
9. Créer FULFILMENT. Tester commande test < 50€ → vérifier DSers +
fulfillment Shopify.
10. Créer SUPPORT. Tester mot-clé "remboursement" → vérifier escalade.
11. Créer REPORTING. Tester génération rapport J-1.
12. Activer tous les schedulers. Surveiller ERROR_HANDLER 48h.

═══════════════════════════════════════════════════════════════════
LIVRABLES QUE TU DOIS PRODUIRE (dans cet ordre, sans exception)
═══════════════════════════════════════════════════════════════════
1. Schéma d'architecture global (workflows + dépendances + ordre
d'activation).
2. Pour CHAQUE workflow (2 à 8) : la spec (A) puis la construction
nœud par nœud (B) au format ci-dessus, avec payloads JSON complets.
3. Le SQL Supabase final (Bloc 1.2) prêt à copier-coller.
4. Les SYSTEM_PROMPT complets (produit, panier, reporting).
5. La checklist de déploiement (Bloc 10) avec, pour chaque étape,
le critère de succès vérifiable.
6. Un fichier de handover par workflow : déclencheur, dépendances,
erreurs connues, procédure de correction manuelle.

Commence par produire le livrable 1 (schéma global), puis attends
ma validation avant de dérouler les livrables 2 à 6 workflow par
workflow.
