import {WithdrawalPreview} from '@/components/WithdrawalPreview';
import Link from 'next/link';
export const metadata={title:'Préparer une demande de rétractation — Moon & Pillow',robots:{index:false,follow:false}};
export default function WithdrawalPage(){return <main className="legal-page"><Link className="wordmark" href="/">Moon <i>&</i> Pillow</Link><p className="eyebrow" style={{marginTop:55}}>LIVRAISON & RETOURS</p><h1>Se rétracter,<br/>simplement.</h1><WithdrawalPreview/><Link className="back" href="/">← Retour à la collection</Link></main>;}
