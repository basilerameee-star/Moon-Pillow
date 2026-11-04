import { products, categoryLabel, productImage, startingPrice, type Product } from './catalog';
import { faq } from './faq';

/* --- RÉFÉRENCEMENT ---
   Adresse définitive de la boutique. Tant que INDEXATION_OUVERTE est faux, toutes les pages
   restent en noindex et robots.txt ferme l'accès : à passer à true le jour de l'ouverture. */
export const SITE_URL = 'https://moonandpillow.com';
export const INDEXATION_OUVERTE = false;
export const NOM = 'Moon & Pillow';

/* Code de vérification Google Search Console (balise meta), à coller ici une fois le
   domaine ajouté dans Search Console. Vide = balise absente. */
export const GOOGLE_SITE_VERIFICATION = '';

export const robotsMeta = INDEXATION_OUVERTE ? { index: true, follow: true } : { index: false, follow: false };

export const absolute = (path: string) => new URL(path, SITE_URL).toString();

/* Image de partage par défaut (réseaux sociaux). */
const IMAGE_PARTAGE = '/img/hero-canape.webp';

/* Balises communes d'une page : titre, description, canonical, Open Graph et Twitter. */
export function pageMeta({ title, description, path, image }: { title: string; description: string; path: string; image?: string }) {
  const images = [image ?? IMAGE_PARTAGE];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { siteName: NOM, locale: 'fr_FR', type: 'website' as const, title, description, url: path, images },
    twitter: { card: 'summary_large_image' as const, title, description, images },
  };
}

/* Pages de travail ou légales : jamais indexées, même après l'ouverture. */
export const privateMeta = (page: Parameters<typeof pageMeta>[0]) => ({ ...pageMeta(page), robots: { index: false, follow: false } });

/* Fiches publiables (sitemap) : toutes les fiches hors brouillon, y compris celles dont le prix est
   encore proposé. Les brouillons ne sont jamais déclarés. Le prix validé ne conditionne que l'offre. */
export const publishedProducts = () => products.filter(p => !p.draftOnly);

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: NOM,
    url: SITE_URL,
    logo: absolute('/favicon.svg'),
    email: 'contact@raime.fr',
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: NOM,
    url: SITE_URL,
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?recherche={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

/* Product : à n'émettre que pour un prix validé (voir hasProductLd) : sans offre, ni avis, ni note,
   Google refuse un Product. L'offre n'est déclarée que pour un prix validé. Pas de disponibilité : le stock
   n'est pas confirmé (à ajouter à l'ouverture, depuis une donnée de stock réelle).
   Aucun avis ni note n'est déclaré : il n'y a pas encore d'avis client réel. */
export const hasProductLd = (product: Product) => product.priceStatus === 'approved' && !product.draftOnly;

export function productLd(product: Product) {
  const image = productImage(product);
  const approved = hasProductLd(product);
  const prices = product.options.map(o => o.price).filter(p => Number.isSafeInteger(p) && p > 0);
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.id,
    category: categoryLabel(product.category),
    brand: { '@type': 'Brand', name: NOM },
    url: absolute(`/produits/${product.id}`),
  };
  if (image) ld.image = [absolute(image)];
  if (approved && prices.length) {
    const low = Math.min(...prices), high = Math.max(...prices);
    ld.offers = prices.length > 1
      ? { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: (low / 100).toFixed(2), highPrice: (high / 100).toFixed(2), offerCount: prices.length }
      : { '@type': 'Offer', priceCurrency: 'EUR', price: (startingPrice(product) / 100).toFixed(2), url: absolute(`/produits/${product.id}`) };
  }
  return ld;
}

export function faqLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/* Plusieurs brouillons portent le même nom : la référence les distingue dans le titre et la description. */
const nameCounts = new Map<string, number>();
products.forEach(p => nameCounts.set(p.name, (nameCounts.get(p.name) ?? 0) + 1));
const uniqueName = (product: Product) => (nameCounts.get(product.name) ?? 0) > 1 ? `${product.name} (réf. ${product.id})` : product.name;

/* Titre d'une fiche : la catégorie seulement si le titre reste lisible dans les résultats de recherche. */
export function productTitle(product: Product) {
  const name = uniqueName(product);
  const full = `${name} — ${categoryLabel(product.category)} | ${NOM}`;
  return full.length <= 65 ? full : `${name} | ${NOM}`;
}

/* Meta description d'une fiche : la description réelle du produit, coupée proprement à 160 caractères.
   Les brouillons n'exposent pas leurs notes de travail sur le fournisseur. */
export function productDescription(product: Product) {
  const label = categoryLabel(product.category);
  if (product.draftOnly) return `${uniqueName(product)}, dans la catégorie ${label.toLowerCase()} : référence en préparation chez ${NOM}, pas encore ouverte à la vente.`;
  const subtitle = product.subtitle === label ? '' : product.subtitle;
  const text = `${subtitle} ${product.description}`.replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  const sentenceEnd = text.lastIndexOf('. ', 159);
  if (sentenceEnd >= 90) return text.slice(0, sentenceEnd + 1);
  return `${text.slice(0, 157).replace(/\s+\S*$/, '').replace(/[\s,;:.]+$/, '')}…`;
}
