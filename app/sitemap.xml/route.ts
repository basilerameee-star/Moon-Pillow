import { publishedProducts, absolute } from '@/lib/seo';

/* Plan du site : accueil, pages de contenu, et toutes les fiches publiables. */
export function GET() {
  const pages = ['/', '/notre-univers', '/guide-du-linge'];
  const urls = [...pages, ...publishedProducts().map(p => `/produits/${p.id}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${absolute(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
