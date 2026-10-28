# Moon-Pillow
Website to furbish your home

## Moon & Pillow

French-language home linen storefront project. The current site is a pre-launch catalogue and experience prototype; supplier, legal, payment, fulfilment, and advertising integrations still require verification and approval before accepting real orders.

## Project handoff

- [Current project state and decisions](docs/handoff/PROJECT_STATE.md)
- [Remaining work, in priority order](docs/handoff/NEXT_STEPS.md)
- [Archived source prompts and briefs](docs/prompts/README.md)

Current catalogue source: `lib/imported-products.ts`, `lib/sourcing-data.ts`, and `lib/photo-curation.ts`. Product photos used by the storefront are in `public/img/catalogue/`.

Local preview is not a public deployment. Start with the commands documented below after installing dependencies. Never add real `.env`/`.dev.vars` credentials to Git.

---

# vinext-starter

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git and `tar` (including Windows `tar.exe`) are required for publishing; portable publication does not require Bash

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

Publish archives outside the source checkout or under its ignored `outputs/` directory. Local `.env*`, `.dev.vars*`, TypeScript build state, and tool runtime directories are ignored; keep the hosting manifest, migrations, and authored scripts in source control.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `worker/index.ts` is the production Worker entrypoint and preserves request-scoped connector bindings
- `scripts/vite/` contains the maintained Vite integrations and the vendored Sites plugin license
- `scripts/connector-preview/` contains the local connector preview Worker and session helpers
- the remaining `scripts/` files select execution profiles and run installation, development, and builds; the plugin's helpers orchestrate the Sites lifecycle
- `dist/` contains generated deployment output; `.vinext/`, `.wrangler/`, and `.sites-runtime/` contain ignored local tool state
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

## Référencement (SEO)

- Adresse, ouverture à l'indexation et code Search Console : `lib/seo.ts` (`SITE_URL`, `INDEXATION_OUVERTE`, `GOOGLE_SITE_VERIFICATION`). En préouverture, toutes les pages sont en `noindex` et `robots.txt` ferme l'accès.
- Données structurées (JSON-LD, rendues dans le HTML) : `Organization` et `WebSite` + `SearchAction` (`/?recherche=…`) sur toutes les pages, `FAQPage` sur l'accueil, `Product` + `BreadcrumbList` sur chaque fiche. L'offre (`Offer` / `AggregateOffer`) n'est déclarée que pour un prix validé (`priceStatus: 'approved'`). Aucune note ni avis n'est déclaré tant qu'il n'existe pas d'avis client réel.
- `sitemap.xml` (accueil, Notre univers, guide du linge, fiches non brouillon) et `robots.txt` sont générés par `app/sitemap.xml/route.ts` et `app/robots.txt/route.ts`.
- Canonical sur l'accueil, Notre univers, le guide et chaque fiche (`metadataBase` = `SITE_URL`).

### Le jour de l'ouverture

1. Passer `INDEXATION_OUVERTE` à `true` dans `lib/seo.ts`, redéployer.
2. Ajouter le domaine dans Google Search Console, coller le code dans `GOOGLE_SITE_VERIFICATION`, redéployer, valider.
3. Soumettre `https://moonandpillow.com/sitemap.xml` dans Search Console.
4. Contrôler 3 fiches avec le test des résultats enrichis de Google et mesurer les Core Web Vitals avec Lighthouse (mobile).

## À implémenter en production (hors code)

Ces éléments ne peuvent pas être codés dans les pages ; ils demandent une décision, un outil ou une opération :

- Emballage (papier de soie, boîte, étiquette, mot de remerciement) et livret d'accueil : opérationnel, dépend du fournisseur.
- E-mails automatiques (panier abandonné, bienvenue, rétention) : outil d'e-mailing à choisir (Brevo, Klaviyo…). Brouillons dans `lib/email-flows.ts`.
- Apple Pay / Google Pay / paiement en 3-4 fois : à activer dans Stripe (et un prestataire de paiement fractionné), après validation.
- Seuil de livraison offerte et frais de port réels : décision commerciale du propriétaire, puis calcul côté serveur.
- Bulle d'aide / WhatsApp : visuelle tant qu'aucun service n'est branché.
- Avis clients : uniquement des avis réels, collectés après livraison.
- Certification (OEKO-TEX…), grammage, consignes de lavage : publiés seulement avec une preuve du fournisseur pour la référence exacte.

## Checklist (prompt DeepSeek v2, §17)

Statuts : ✅ codé | 📄 documenté (hors code) | 🚧 opérationnel | ⏳ à décider ou à prouver

1. Guide des tailles visuel ........................................ ✅ (`components/ProductGuides.tsx`, guide du linge)
2. Page « Notre univers » .......................................... ✅
3. Emballage premium ............................................... 🚧
4. E-mails automatisés ............................................. 📄
5. Apple Pay / Google Pay / paiement fractionné .................... 📄
6. Boutons « Épingler sur Pinterest » .............................. ✅ (`PinterestButton`)
7. CGV, mentions légales, retours, confidentialité ................. ✅ (contenu à compléter avec les informations réelles de l'entreprise)
8. Livret d'accueil ................................................ 🚧
9. Frais de port affichés dès le panier ............................ ✅ (règle affichée ; montant réel à décider)
10. Guide d'entretien avec icônes ................................. ⏳ (consignes publiées seulement d'après l'étiquette réelle)
11. OEKO-TEX + grammage ........................................... ⏳ (aucune preuve fournisseur vérifiée à ce jour)
12. Accessibilité AA (contraste, clavier, ARIA) ................... ⏳ (focus piégé, Échap, `aria-modal`, menus au clavier présents ; contraste non mesuré)
13. Core Web Vitals : optimisations ............................... ⏳ (à mesurer après compilation)
14. Core Web Vitals : mesure réelle ............................... 📄
