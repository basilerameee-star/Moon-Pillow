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

/* Produits publiables : prix validé et fiche complète (les brouillons ne sont jamais déclarés). */
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

/* Product : l'offre (prix, disponibilité) n'est déclarée que pour un prix validé.
   Aucun avis ni note n'est déclaré : il n'y a pas encore d'avis client réel. */
export function productLd(product: Product) {
  const image = productImage(product);
  const approved = product.priceStatus === 'approved' && !product.draftOnly;
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
      ? { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: (low / 100).toFixed(2), highPrice: (high / 100).toFixed(2), offerCount: prices.length, availability: 'https://schema.org/InStock' }
      : { '@type': 'Offer', priceCurrency: 'EUR', price: (startingPrice(product) / 100).toFixed(2), availability: 'https://schema.org/InStock', url: absolute(`/produits/${product.id}`) };
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

/* Meta description d'une fiche : la description réelle du produit, coupée proprement à 160 caractères. */
export function productDescription(product: Product) {
  const text = `${product.subtitle} ${product.description}`.replace(/\s+/g, ' ').trim();
  return text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}
