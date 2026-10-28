from pathlib import Path
root=Path('work/sites/moon-and-pillow')
(root/'app/informations/[page]/page.tsx').write_text('''import {notFound} from 'next/navigation';
import {ArrowUpRight} from 'lucide-react';
import {legalContent} from '@/lib/legal-content';
export async function generateMetadata({params}:{params:Promise<{page:string}>}){const{page}=await params;return{title:`${legalContent[page]?.title??'Informations'} — Moon & Pillow`,robots:{index:false,follow:false}};}
export default async function Information({params}:{params:Promise<{page:string}>}){
 const{page}=await params,entry=legalContent[page];if(!entry)notFound();
 return <main className="legal-page"><a className="wordmark" href="/">Moon <i>&</i> Pillow</a><h1>{entry.title}</h1><p className="preopen">Version de préparation privée · commandes fermées. Les informations ci-dessous attendent les coordonnées et conditions réelles de la boutique.</p>{entry.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}{page==='retours'&&<a className="button secondary legal-action" href="/retractation">Prévisualiser le parcours de rétractation <ArrowUpRight size={16}/></a>}{page==='confidentialite'&&<section><h2>Les outils de prévisualisation</h2><p>Les scénarios d’e-mails utilisent un client fictif. Les champs du parcours de rétractation restent dans la mémoire de la page jusqu’à sa fermeture ou son actualisation. Aucun message, dossier client ou demande réelle n’est envoyé ou enregistré par ces outils.</p></section>}{entry.missing?.length&&<details className="legal-pending"><summary>Informations à compléter avant la vente</summary><ul>{entry.missing.map(item=><li key={item}>{item}</li>)}</ul></details>}{entry.sources?.length&&<section className="legal-sources"><h2>Sources officielles consultées</h2>{entry.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ArrowUpRight size={13}/></a>)}</section>}<a className="back" href="/">← Retour à la collection</a></main>;
}
''',encoding='utf-8')
p=root/'app/catalogue-preparation/page.tsx'
s=p.read_text(encoding='utf-8').replace('<h1>Le catalogue <em>prend forme.</em></h1>','<h1>Le catalogue <em>prend forme.</em></h1><a href="/preparation-experience" className="underlined" style={{marginBottom:35}}>Préparer les e-mails, le colis et les retours <ArrowUpRight size={15}/></a>')
p.write_text(s,encoding='utf-8')
p=root/'components/ProductGuides.tsx'
s=p.read_text(encoding='utf-8').replace('export function PrintGuideButton() {',"export function PrintGuideButton({label='Imprimer le guide'}:{label?:string}) {")
s=s.replace('onClick={() => window.print()}>Imprimer le guide</button>','onClick={() => window.print()}>{label}</button>')
p.write_text(s,encoding='utf-8')
p=root/'app/carte-merci/page.tsx'
s=p.read_text(encoding='utf-8').replace('<PrintGuideButton/>','<PrintGuideButton label="Imprimer la carte"/>')
p.write_text(s,encoding='utf-8')
