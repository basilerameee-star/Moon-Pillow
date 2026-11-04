import { INDEXATION_OUVERTE, absolute } from '@/lib/seo';

/* Préouverture : tout est fermé aux moteurs. À l'ouverture, INDEXATION_OUVERTE = true dans lib/seo.ts.
   Les pages privées ne sont pas bloquées ici : les moteurs doivent pouvoir lire leur noindex. */
export function GET() {
  const body = INDEXATION_OUVERTE
    ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${absolute('/sitemap.xml')}\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
