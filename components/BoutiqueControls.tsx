'use client';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { Check, ChevronDown, Pin, ShoppingBag } from 'lucide-react';

export function SelectMenu({label,value,options,onChange}:{label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void}){
 const id=useId(),box=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(!open)return;const close=(event:PointerEvent)=>{if(!box.current?.contains(event.target as Node))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[open]);
 useEffect(()=>{if(open)box.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();},[open]);
 return <div className="select-menu" ref={box} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}if(open&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const nodes=[...box.current!.querySelectorAll<HTMLButtonElement>('[role="option"]')];let index=nodes.indexOf(document.activeElement as HTMLButtonElement);index=e.key==='Home'?0:e.key==='End'?nodes.length-1:(index+(e.key==='ArrowDown'?1:-1)+nodes.length)%nodes.length;nodes[index]?.focus();}}}>
  <button ref={trigger} className="select-trigger" aria-label={`${label} : ${options.find(o=>o.value===value)?.label??''}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);}}}><span>{options.find(o=>o.value===value)?.label}</span><ChevronDown size={15}/></button>
  {open&&<div id={id} className="select-options" role="listbox" aria-label={label}>{options.map(option=><button key={option.value} role="option" aria-selected={value===option.value} onClick={()=>{onChange(option.value);setOpen(false);trigger.current?.focus();}}>{option.label}{value===option.value&&<Check size={14}/>}</button>)}</div>}
 </div>;
}

export function StickyProductAction({target,name,selection,price,disabled,onAdd}:{target:RefObject<HTMLDivElement|null>;name:string;selection:string;price:string;disabled:boolean;onAdd:()=>void}){
 const [passed,setPassed]=useState(false);
 useEffect(()=>{const node=target.current;if(!node)return;const root=node.closest('.sheet');const observer=new IntersectionObserver(([entry])=>setPassed(!entry.isIntersecting&&entry.boundingClientRect.top<(entry.rootBounds?.top??0)),{root,threshold:0});observer.observe(node);return()=>observer.disconnect();},[target,name]);
 return passed?<div className="sticky-product-action"><div><strong>{name}</strong><span>{selection} · {price}</span></div><button className="button primary" disabled={disabled} onClick={onAdd}>Ajouter au panier <ShoppingBag size={17}/></button></div>:null;
}

// The Site is private. Keep sharing local until public publication is approved.
export function PinterestButton(){
 const [message,setMessage]=useState(false);
 return <span className="pinterest-control"><button className="pin-button" type="button" aria-label="Épingler sur Pinterest — disponible à l’ouverture publique" onClick={()=>setMessage(!message)}><Pin size={14}/> Épingler</button>{message&&<small role="status">Le partage Pinterest sera disponible avec la boutique publique.</small>}</span>;
}

const answers=[
 {title:'Trouver le bon format',text:'Mesurez l’objet que vous avez déjà, en centimètres. Pour une housse de couette, mesurez la couette ; pour une housse de coussin, mesurez le coussin intérieur. Choisissez le format qui reprend ces dimensions. Si elles ne correspondent pas, ne devinez pas : demandez-nous.'},
 {title:'Comprendre ce qui est inclus',text:'Le format choisi indique ce que vous achetez. « 1 housse seule » signifie une housse sans coussin intérieur. Les coussins ou accessoires qui décorent la photo ne sont pas inclus, sauf mention explicite.'},
 {title:'Comparer les couleurs',text:'Les nuances sont propres à chaque produit. Deux teintes portant le même nom peuvent différer selon la matière, la lumière et l’écran. Nous n’affichons un choix de couleur que lorsqu’une photo est rattachée à cette référence.'},
 {title:'Livraison et retours',text:'Les commandes ne sont pas encore ouvertes. Les frais et délais de livraison, ainsi que les conditions de retour, seront affichés avant tout paiement.'}
];
export function BoutiqueAssistance(){
 const [open,setOpen]=useState(false);
 return <aside className="boutique-assistance" aria-label="Aide pour votre sélection"><button className="assistance-trigger" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Fermer l’aide':'Un doute sur une taille ?'} <ChevronDown size={15}/></button>{open&&<div className="assistance-panel"><p className="eyebrow">UN PEU D’AIDE</p><h3>Pour bien choisir.</h3>{answers.map(answer=><details key={answer.title}><summary>{answer.title}</summary><p>{answer.text}</p></details>)}<a href="mailto:contact@raime.fr">Poser une question par e-mail ↗</a></div>}</aside>;
}
