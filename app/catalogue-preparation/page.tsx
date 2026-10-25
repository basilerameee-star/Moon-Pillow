import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { sourcingCandidates } from '@/lib/sourcing-data';
import { categoryLabel, products, type Category } from '@/lib/catalog';

export const metadata:Metadata={title:'Catalogue de préparation — Moon & Pillow',robots:{index:false,follow:false}};
const cost=(value:number,currency:string)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency}).format(value);

export default function Preparation(){
 const unitCandidates=sourcingCandidates.filter(p=>p.moq.quantity===1&&!p.moq.conflict).length;
 return <main className="sourcing-page">
  <a className="wordmark" href="/">Moon <i>&</i> Pillow</a>
  <p className="eyebrow" style={{marginTop:60}}>APERÇU PRIVÉ · RECHERCHE FOURNISSEURS</p>
  <h1>Le catalogue <em>prend forme.</em></h1>
  <p className="category-intro">Les références ci-dessous sont des pistes de travail. Les prix relevés sont des prix fournisseurs, distincts du prix de vente. Aucun de ces nouveaux modèles n’est ouvert aux commandes.</p>
  <div className="progress-summary">
   <div><strong>{sourcingCandidates.length}</strong><span>modèles repérés</span></div>
   <div><strong>{products.filter(p=>p.draftOnly&&!p.requiresSupplierBundle&&p.coverImage).length}</strong><span>modèles illustrés proposés séparément</span></div>
   <div><strong>0</strong><span>nouvelle référence approuvée à la vente</span></div>
   <div><strong>{sourcingCandidates.filter(p=>p.photoAudit.meetsRequestedMinimum).length}</strong><span>galeries contrôlées : 2 coloris minimum, 3 vues distinctes par coloris</span></div>
  </div>
  <p className="source-note">Objectif : au moins 200 modèles avec deux coloris et trois vraies vues par coloris. Les données proviennent d’Alibaba, AW Europe, CJdropshipping et Planete Discount. {unitCandidates} pistes affichent une quantité minimale de 1 sans contradiction relevée. Le contrôle de toutes les photos, le stock, les variantes commandables et les droits de réutilisation restent à compléter. Les prix proposés dans la boutique sont des prix de vente provisoires ; les coûts fournisseurs ci-dessous ne valident pas la marge.</p>
  <div style={{overflowX:'auto'}}><table className="sourcing-table"><caption className="sr-only">{sourcingCandidates.length} références fournisseurs en préparation</caption><thead><tr><th scope="col">Modèle</th><th scope="col">Choix relevés</th><th scope="col">Minimum fournisseur</th><th scope="col">Coût relevé</th><th scope="col">À confirmer</th></tr></thead><tbody>
   {sourcingCandidates.map(p=>{
    const knownSizes=p.sizes.filter(s=>s.verified),knownColors=p.colors.filter(c=>c.verified);
    return <tr key={p.id}><td><a href={`/produits/${p.id}`}><strong>{p.nameFR}</strong></a><p>{categoryLabel(p.category as Category)}</p><p>{p.supplier}</p><a href={p.url} target="_blank" rel="noopener noreferrer">Fiche {p.sourceLabel} <ArrowUpRight size={13}/></a></td>
    <td><p>{knownSizes.length?knownSizes.map(s=>s.label.replaceAll('*',' × ')).join(' · '):'Dimensions commandables non confirmées'}</p><p>{knownColors.length?knownColors.map(c=>c.label).join(' · '):'Nuancier commandable non confirmé'}</p><p>{p.photoAudit.assignedPhotos} vues reliées aux coloris · {p.photoAudit.unassignedPhotos} vues générales</p><p>{p.photoAudit.meetsRequestedMinimum?'Minimum photographique contrôlé visuellement':'Minimum photographique pas encore validé pour tous les coloris'}</p>{p.requiresSupplierBundle&&<p>Lot fournisseur conservé en recherche ; retiré de la collection à composer.</p>}<a href={`/produits/${p.id}`}>Examiner la fiche</a></td>
    <td>{p.moq.quantity??'?'} {p.moq.unit}{p.moq.conflict&&<p className="error">Quantité ou unité contradictoire</p>}</td>
    <td>{p.cost.min!==null&&p.cost.max!==null?<>{cost(p.cost.min,p.cost.currency)}{p.cost.max!==p.cost.min&&<> à {cost(p.cost.max,p.cost.currency)}</>}</>:'Prix de compte non confirmé'}{p.publicPriceHint&&<p><small>Indice public : {p.publicPriceHint}</small></p>}<p>{p.shipping?`Port indicatif : ${cost(p.shipping.amount,p.shipping.currency)}`:'Port France non confirmé'}</p><small>Coût livré complet non validé</small></td>
    <td><ul>{p.openQuestionsFR.slice(0,3).map(q=><li key={q}>{q}</li>)}</ul></td></tr>;
   })}
  </tbody></table></div>
  <p className="source-note" style={{marginTop:32}}>Les modèles illustrés dans la collection sont sélectionnés pour la fidélité de leur photo de référence. Les photos dont la couleur ou une certification n’est pas vérifiée ne servent pas de visuel de variante. {products.filter(p=>p.draftOnly&&p.coverImage).length} nouveaux modèles disposent d’un visuel pour cet aperçu privé.</p>
  <a className="underlined" href="/#collection" style={{marginTop:35}}><ArrowLeft size={16}/> Retour à la collection</a>
 </main>;
}
