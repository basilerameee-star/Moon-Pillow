import Link from 'next/link';
import { privateMeta } from '@/lib/seo';
const meta=privateMeta({title:'Page introuvable — Moon & Pillow',description:'Cette page n’existe pas ou plus sur la boutique Moon & Pillow.',path:'/'});
/* Ni canonical ni og:url : la page 404 ne doit pas se présenter comme l'accueil. */
export const metadata={...meta,alternates:{},openGraph:{...meta.openGraph,url:undefined}};
export default function NotFound(){return <main className="legal-page"><Link className="wordmark" href="/">Moon <i>&</i> Pillow</Link><h1>Cette page reste introuvable.</h1><p>L’adresse a peut-être changé. La collection, elle, vous attend.</p><Link className="back" href="/">← Retour à la collection</Link></main>;}
