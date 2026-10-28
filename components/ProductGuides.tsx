'use client';

import { ChevronDown, Ruler, Sparkles, Truck, WashingMachine, Wind } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/catalog';
import { careStatements, materialStatements, sizeGuideFor, type SizeGuide } from '@/lib/product-guides';

function SizeDrawing({ guide }: { guide: SizeGuide }) {
  const { measured, kind } = guide;
  const width = measured ? `${measured.width} cm` : 'Largeur';
  const length = measured ? `${measured.length} cm` : 'Longueur';
  return <svg className="guide-drawing" viewBox="0 0 360 260" role="img" aria-label={`Schéma indicatif ${kind === 'bed' ? 'du lit' : kind === 'pillow' ? 'du coussin ou de l’oreiller' : 'du linge'} : ${width} sur ${length}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'bed' ? <><rect x="91" y="47" width="178" height="164" rx="9" fill="var(--bg-card, #EAE4D9)"/><path d="M91 83h178M109 101h142M108 111v83m144-83v83"/><rect x="111" y="59" width="60" height="28" rx="5" fill="var(--bg-main, #F7F3EB)"/><rect x="188" y="59" width="60" height="28" rx="5" fill="var(--bg-main, #F7F3EB)"/></>
        : kind === 'pillow' ? <><path d="M85 76Q180 91 275 76Q261 130 275 184Q180 170 85 184Q99 130 85 76Z" fill="var(--bg-card, #EAE4D9)"/><path d="M99 89Q180 102 261 89Q250 130 261 171Q180 159 99 171Q109 130 99 89Z"/></>
        : <><rect x="91" y="65" width="178" height="139" rx="3" fill="var(--bg-card, #EAE4D9)"/><path d="M101 75h158v119H101Z"/><path d="M101 190v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21m10-21v21"/></>}
      <path d="M91 30h178M91 25v10m178-10v10M293 49v160m-5-160h10m-10 160h10"/>
    </g>
    <g fill="currentColor" fontFamily="Inter, Arial, sans-serif" fontSize="12" textAnchor="middle"><text x="180" y="18">{width}</text><text transform="translate(320 130) rotate(90)">{length}</text>{measured?.depth && <text x="180" y="241">Épaisseur indiquée : {measured.depth} cm</text>}</g>
  </svg>;
}

/** Practical information uses catalogue evidence; it never invents a label,
 * washing temperature, delivery promise or independent size-colour variant.
 */
export function ProductGuides({ product, optionLabel }: { product: Product; optionLabel?: string }) {
  const guide = sizeGuideFor(product, optionLabel);
  const materials = materialStatements(product);
  const care = careStatements(product);
  return <div className="guide-accordions">
    <details className="guide-panel">
      <summary><span><Ruler size={17} strokeWidth={1.3}/> Bien choisir sa taille</span><ChevronDown size={16}/></summary>
      <div className="guide-content">
        <figure className="guide-figure"><SizeDrawing guide={guide}/><figcaption>{guide.label || 'Dimensions à confirmer pour cet article'}</figcaption></figure>
        <p>{guide.instruction}</p><p className="guide-note">{guide.note}</p>
      </div>
    </details>
    <details className="guide-panel">
      <summary><span><Sparkles size={17} strokeWidth={1.3}/> Matière & entretien</span><ChevronDown size={16}/></summary>
      <div className="guide-content">
        {materials.length > 0 ? <><h3>Les indications du modèle</h3><ul>{materials.map(text => <li key={text}>{text}</li>)}</ul></> : <p>La composition précise et le grammage restent à confirmer pour ce modèle avant l’ouverture des commandes.</p>}
        <h3>Pour en prendre soin</h3>
        {care.map(text => <div className="guide-care" key={text}><WashingMachine size={21} strokeWidth={1.15} aria-hidden="true"/><p>{text}</p></div>)}
        <div className="guide-care"><Wind size={21} strokeWidth={1.15}/><p>Aérez votre linge et suivez toujours l’étiquette pour le lavage, le séchage et le repassage.</p></div>
        <p>Un aspect froissé dépend de la fibre et du tissage. Sans consigne vérifiée, nous ne pouvons pas garantir l’absence de rétrécissement ni recommander une température précise.</p>
        <p className="guide-note">Aucune certification n’est revendiquée sans justificatif vérifié pour la référence concernée.</p>
      </div>
    </details>
    <details className="guide-panel">
      <summary><span><Truck size={17} strokeWidth={1.3}/> Livraison & retours</span><ChevronDown size={16}/></summary>
        <div className="guide-content"><p>Livraison offerte en France dès 80 € d’achat. Retours gratuits sous 30 jours après réception, sans justification.</p><p>Les éléments du décor photographié ne sont pas inclus, sauf mention explicite dans le format sélectionné.</p><Link href="/informations/retours" className="guide-link">Consulter les informations de livraison et de retour</Link></div>
    </details>
  </div>;
}

export function PrintGuideButton({label='Imprimer le guide'}:{label?:string}) {
  return <button type="button" className="button secondary guide-print-button" onClick={() => window.print()}>{label}</button>;
}
