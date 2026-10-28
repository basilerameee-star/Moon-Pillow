/** Pure email planning. This module neither stores events nor sends messages.
 * A production sender must re-evaluate current consent and order state, reserve
 * the dedupe key in durable storage, and supply a real unsubscribe mechanism.
 */
export const FLOW_DEFINITIONS = [
  {kind:'cart-abandoned',label:'Panier abandonné',delayLabel:'2 heures après la dernière activité'},
  {kind:'welcome-now',label:'Bienvenue',delayLabel:'À l’inscription confirmée'},
  {kind:'welcome-day3',label:'Le bon format, le bon geste',delayLabel:'3 jours après l’inscription'},
  {kind:'welcome-day7',label:'Un coin à composer',delayLabel:'7 jours après l’inscription'},
  {kind:'retention-month3',label:'Une nouvelle touche',delayLabel:'3 mois calendaires après la livraison'},
] as const;
export type EmailFlowKind = typeof FLOW_DEFINITIONS[number]['kind'];
export type EmailFlowSnapshot = {
  subjectId:string;
  eventId:string;
  consent:boolean;
  unsubscribed:boolean;
  triggeredAt:string;
  sentKeys?:readonly string[];
  cart?:{updatedAt:string;empty:boolean;hasApprovedItems:boolean;paid:boolean};
  order?:{paid:boolean;delivered:boolean;deliveredAt?:string;cancelled:boolean;refunded:boolean;disputed:boolean;deliveryIncident:boolean};
};
export type EmailFlowEvaluation = {
  status:'ready'|'waiting'|'suppressed';
  reason:string;
  dueAt?:string;
  dedupeKey:string|null;
};
export type FlowEmail = {
  subject:string;
  preheader:string;
  paragraphs:string[];
  ctaLabel:string;
  ctaPath:string;
  unsubscribeText:string;
  previewOnly:true;
};

const HOUR=60*60*1000,DAY=24*HOUR;
function validId(value:unknown):value is string {
  if(typeof value!=='string'||value.length===0||value.length>200||value.trim()!==value||/[\u0000-\u001f\u007f]/.test(value))return false;
  try{encodeURIComponent(value);return true;}catch{return false;}
}
function time(value:unknown):number|null {
  if(value instanceof Date){const n=value.getTime();return Number.isFinite(n)?n:null;}
  if(typeof value==='number')return Number.isSafeInteger(value)&&Number.isFinite(new Date(value).getTime())?value:null;
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value))return null;
  const n=Date.parse(value);
  // Date.parse can silently normalise a non-existent date, such as 30 February.
  return Number.isFinite(n)&&new Date(n).toISOString().slice(0,19)===value.slice(0,19)?n:null;
}
function threeCalendarMonthsAfter(instant:number):number {
  const source=new Date(instant),target=new Date(instant),day=source.getUTCDate();
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth()+3);
  const end=new Date(target);end.setUTCMonth(end.getUTCMonth()+1,0);
  const last=end.getUTCDate();
  target.setUTCDate(Math.min(day,last));
  return target.getTime();
}

export function evaluateFlow(kind:EmailFlowKind,snapshot:EmailFlowSnapshot,now:string|number|Date):EmailFlowEvaluation {
  const known=FLOW_DEFINITIONS.some(flow=>flow.kind===kind);
  const dedupeKey=known&&validId(snapshot?.subjectId)&&validId(snapshot?.eventId)
    ?`${kind}:${encodeURIComponent(snapshot.subjectId)}:${encodeURIComponent(snapshot.eventId)}`:null;
  const suppressed=(reason:string):EmailFlowEvaluation=>({status:'suppressed',reason,dedupeKey});
  if(!known||!dedupeKey)return suppressed('Le scénario ou les identifiants de l’événement sont incomplets.');
  const current=time(now),trigger=time(snapshot.triggeredAt);
  if(current===null||trigger===null)return suppressed('La date de contrôle ou la date de l’événement est invalide.');
  if(snapshot.consent!==true)return suppressed('L’accord pour recevoir ce message n’est pas confirmé.');
  if(snapshot.unsubscribed!==false)return suppressed('Le contact est désinscrit ou son choix actuel reste à vérifier.');
  if(snapshot.sentKeys!==undefined&&(!Array.isArray(snapshot.sentKeys)||snapshot.sentKeys.some(key=>typeof key!=='string')))return suppressed('Le journal des envois est invalide.');
  if(snapshot.sentKeys?.includes(dedupeKey))return suppressed('Ce message a déjà été envoyé pour cet événement.');

  let due:number;
  if(kind==='cart-abandoned'){
    const cart=snapshot.cart;
    if(!cart||cart.paid!==false)return suppressed('Le panier a été payé ou son paiement reste à vérifier.');
    if(cart.empty!==false)return suppressed('Le panier est vide ou son contenu reste à vérifier.');
    if(cart.hasApprovedItems!==true)return suppressed('Le panier ne contient pas de sélection approuvée et disponible.');
    const updated=time(cart.updatedAt);
    if(updated===null||updated<trigger)return suppressed('La dernière activité du panier est incohérente.');
    due=updated+2*HOUR;
  }else if(kind==='retention-month3'){
    const order=snapshot.order;
    if(!order||order.paid!==true||order.delivered!==true)return suppressed('La commande doit être payée et livrée.');
    if(order.cancelled!==false||order.refunded!==false||order.disputed!==false||order.deliveryIncident!==false)return suppressed('La commande est annulée, remboursée, en litige ou son suivi reste à vérifier.');
    const delivered=time(order.deliveredAt);
    if(delivered===null||delivered<trigger)return suppressed('La date de livraison est manquante ou incohérente.');
    due=threeCalendarMonthsAfter(delivered);
  }else{
    due=trigger+(kind==='welcome-day3'?3*DAY:kind==='welcome-day7'?7*DAY:0);
  }
  if(!Number.isFinite(due)||!Number.isFinite(new Date(due).getTime()))return suppressed('La date prévue du message est invalide.');
  const dueAt=new Date(due).toISOString();
  return current<due
    ?{status:'waiting',reason:'Le délai prévu n’est pas encore atteint.',dueAt,dedupeKey}
    :{status:'ready',reason:'Les règles du scénario sont satisfaites. Le service d’envoi reste à raccorder.',dueAt,dedupeKey};
}

const clean=(value:unknown,maximum:number)=>typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,maximum):'';
export function renderFlowEmail(kind:EmailFlowKind,selection:{productName?:string;colorName?:string}={}):FlowEmail {
  if(!FLOW_DEFINITIONS.some(flow=>flow.kind===kind))throw new Error('Scénario d’e-mail inconnu.');
  const product=clean(selection.productName,140),color=clean(selection.colorName,80);
  const selected=product?`${product}${color?` — ${color}`:''}`:'';
  const common={unsubscribeText:'Lien de désinscription à raccorder avant tout envoi. Ceci est un aperçu : aucun message n’a été envoyé.',previewOnly:true as const};
  if(kind==='cart-abandoned')return {...common,subject:'Votre coin cocon vous attend',preheader:'Retrouvez votre sélection, à votre rythme.',paragraphs:['Vous aviez commencé une sélection pour la maison.',...(selected?[`La pièce choisie : ${selected}.`]:[]),'Une question sur une dimension ? Nous vous aiderons à choisir.'],ctaLabel:'Retrouver ma sélection',ctaPath:'/?panier=1'};
  if(kind==='welcome-now')return {...common,subject:'Bienvenue chez Moon & Pillow',preheader:'Des petits bonheurs pour la maison.',paragraphs:['Une lumière de fin de journée. Une texture sous la main. Un endroit où l’on prend le temps.','Moon & Pillow se construit autour de ces moments simples, avec des pièces à choisir une par une pour composer votre intérieur.'],ctaLabel:'Découvrir notre univers',ctaPath:'/notre-univers'};
  if(kind==='welcome-day3')return {...common,subject:'La bonne taille, le bon geste',preheader:'Quelques repères pour choisir votre linge.',paragraphs:['Pour une housse de couette, commencez par mesurer la couette. Pour un drap-housse, relevez aussi l’épaisseur du matelas.','Notre guide réunit les gestes simples pour choisir et prendre soin de votre linge, en suivant toujours l’étiquette de chaque article.'],ctaLabel:'Lire le guide du linge',ctaPath:'/guide-du-linge'};
  if(kind==='welcome-day7')return {...common,subject:'Un coin à composer, à votre façon',preheader:'Choisissez chaque pièce selon vos envies.',paragraphs:['Une housse pour commencer, un plaid pour prolonger la soirée.','Découvrez les formats et les teintes proposés et choisissez chaque pièce séparément. Les couleurs de modèles différents ne sont pas nécessairement identiques.'],ctaLabel:'Explorer la collection',ctaPath:'/#collection'};
  return {...common,subject:'Une nouvelle touche pour la maison ?',preheader:'Des pièces à découvrir, si vous en avez envie.',paragraphs:['Vous aviez choisi une pièce pour la maison.',...(selected?[`Votre sélection : ${selected}.`]:[]),'Si vous souhaitez compléter votre intérieur, prenez le temps de découvrir les formats et les teintes actuellement proposés.'],ctaLabel:'Explorer les pièces',ctaPath:'/#collection'};
}
