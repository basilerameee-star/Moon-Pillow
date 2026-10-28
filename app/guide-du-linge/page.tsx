import { ArrowLeft, Moon } from 'lucide-react';
import Link from 'next/link';
import { PrintGuideButton } from '@/components/ProductGuides';
import { robotsMeta } from '@/lib/seo';

export const metadata={title:'Guide du linge de maison : tailles, matières et entretien',description:'Choisir la bonne taille de housse, de taie ou de plaid, comprendre les matières et entretenir son linge : le guide pratique de Moon & Pillow.',alternates:{canonical:'/guide-du-linge'},robots:robotsMeta};

export default function LinenGuidePage() {
  return <main className="linen-guide">
    <style>{`
      .linen-guide{max-width:920px;margin:auto;padding:44px 32px 90px}
      .linen-guide-nav{display:flex;align-items:center;justify-content:space-between;gap:22px;margin-bottom:70px}
      .linen-guide-back{display:inline-flex;align-items:center;gap:9px;font-size:13px}
      .linen-guide header{text-align:center;border-bottom:1px solid var(--line);padding-bottom:45px}
      .linen-guide header>svg{margin:0 auto 26px;stroke-width:1}
      .linen-guide .eyebrow{justify-content:center;margin-bottom:17px}
      .linen-guide h1{font-size:clamp(40px,6vw,62px)}
      .linen-guide header>p:last-child{max-width:560px;color:var(--muted);margin:24px auto 0;font-size:16px;line-height:1.85}
      .linen-guide-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px 48px;padding:45px 0}
      .linen-guide article>span{font-size:11px;letter-spacing:2px;color:var(--muted)}
      .linen-guide article h2{font-size:29px;letter-spacing:-.5px;margin:13px 0 18px}
      .linen-guide article p{font-size:14px;line-height:1.9;color:var(--muted)}
      .linen-guide article p+p{margin-top:13px}
      .linen-guide-end{border-top:1px solid var(--line);padding-top:26px;font-size:12px;color:var(--muted);line-height:1.85}
      .linen-guide-end strong{color:var(--ink);font-weight:500}
      @media(max-width:600px){.linen-guide{padding:25px 22px 60px}.linen-guide-nav{align-items:flex-start;margin-bottom:45px}.linen-guide-nav .wordmark{font-size:25px}.linen-guide-grid{grid-template-columns:1fr;gap:33px}.linen-guide-nav .button{font-size:12px;padding:10px 14px}}
      @media print{@page{size:A4;margin:16mm}.linen-guide{max-width:none;padding:0}.linen-guide-nav{margin-bottom:30px}.linen-guide-nav>a:not(.wordmark),.guide-print-button{display:none!important}.linen-guide header{padding-bottom:24px}.linen-guide h1{font-size:38px}.linen-guide header>svg{display:none}.linen-guide header>p:last-child{font-size:12px;max-width:145mm}.linen-guide-grid{gap:22px 30px;padding:28px 0;grid-template-columns:1fr 1fr}.linen-guide article{break-inside:avoid}.linen-guide article h2{font-size:23px;margin:9px 0 11px}.linen-guide article p{font-size:10px;line-height:1.75}.linen-guide-end{font-size:9px;padding-top:15px}body{background:#fff!important;color:#2C2621!important}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    `}</style>
    <nav className="linen-guide-nav" aria-label="Navigation du guide"><Link className="wordmark" href="/">Moon <i>&</i> Pillow</Link><Link className="linen-guide-back" href="/"><ArrowLeft size={15}/> Revenir à la collection</Link><PrintGuideButton/></nav>
    <header><Moon size={30}/><p className="eyebrow">LE PETIT GUIDE DE LA MAISON</p><h1>Prendre soin<br/>des moments doux.</h1><p>Quelques gestes simples pour choisir, aérer et ranger votre linge. À garder près de vous, au fil des saisons.</p></header>
    <div className="linen-guide-grid">
      <article><span>01 · BIEN CHOISIR</span><h2>La mesure avant tout.</h2><p>Pour une housse de couette, mesurez la couette. Pour une taie, mesurez l’oreiller. Pour une housse de coussin, mesurez le garnissage.</p><p>Un drap-housse se choisit avec la largeur, la longueur et l’épaisseur du matelas. Vérifiez aussi le bonnet proposé. Une mention « Queen » ou « King » ne remplace pas les centimètres.</p></article>
      <article><span>02 · LIRE L’ÉTIQUETTE</span><h2>À chaque matière, son soin.</h2><p>La composition et l’étiquette d’entretien de votre article sont vos premiers repères. Consultez-les avant le premier lavage, puis respectez leurs indications de lavage, de séchage et de repassage.</p><p>Ne déduisez pas une température de lavage ou une autorisation de sèche-linge de la seule apparence du tissu.</p></article>
      <article><span>03 · FAIRE RESPIRER</span><h2>Un peu d’air, chaque jour.</h2><p>Aérez la pièce et laissez votre linge respirer avant de refaire le lit. Avant de le ranger, vérifiez qu’il est parfaitement sec.</p><p>Si l’étiquette autorise un séchage à l’air libre, dépliez le linge pour limiter les plis. L’aspect froissé et le toucher dépendent de la fibre et du tissage.</p></article>
      <article><span>04 · RANGER SIMPLEMENT</span><h2>Garder ses repères.</h2><p>Réunissez les pièces d’un même ensemble dans un endroit propre et sec. Une petite étiquette de dimensions vous évite de chercher le bon format au moment de changer le lit.</p><p>Pour un drap-housse, rapprochez les coins deux par deux, rentrez-les l’un dans l’autre, puis repliez le rectangle obtenu.</p></article>
    </div>
    <footer className="linen-guide-end"><strong>Un dernier détail.</strong> Ce guide donne des conseils généraux. L’étiquette et les consignes du fabricant de votre article restent prioritaires. Aucun résultat de lavage, traitement particulier ni certification n’est garanti par ce document.<br/>Moon & Pillow · Du doux. Du simple. Du chez-vous.</footer>
  </main>;
}
