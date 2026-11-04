import {WithdrawalPreview} from '@/components/WithdrawalPreview';
import Link from 'next/link';
import {privateMeta} from '@/lib/seo';
export const metadata=privateMeta({title:'Préparer une demande de rétractation — Moon & Pillow',description:'Prévisualisation du parcours de rétractation de la boutique Moon & Pillow.',path:'/retractation'});
export default function WithdrawalPage(){return <main className="legal-page"><Link className="wordmark" href="/">Moon <i>&</i> Pillow</Link><p className="eyebrow" style={{marginTop:55}}>LIVRAISON & RETOURS</p><h1>Se rétracter,<br/>simplement.</h1><WithdrawalPreview/><Link className="back" href="/">← Retour à la collection</Link></main>;}
