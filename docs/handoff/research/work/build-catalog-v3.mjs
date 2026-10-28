import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Source evidence stays outside the browser's product catalogue.
const root=path.resolve('work/sites/moon-and-pillow');
const original=JSON.parse(fs.readFileSync('work/catalog-expanded.json','utf8'));
const read=(name)=>fs.existsSync(name)?JSON.parse(fs.readFileSync(name,'utf8')):null;
const manifest=read('work/alibaba-assets/manifest.json');
const categoryNames={housses:'Housses de coussin',plaids:'Plaids',ensembles:'Lots fournisseurs','housses-couette':'Housses de couette',couettes:'Couettes',oreillers:'Oreillers',taies:'Taies d’oreiller',draps:'Draps',coussins:'Coussins',serviettes:'Linge de bain','couvre-lits':'Couvre-lits'};
const categories=new Set(Object.keys(categoryNames));
const targets={housses:1290,plaids:3990,ensembles:7990,'housses-couette':5990,couettes:7990,oreillers:2990,taies:1490,draps:2990,coussins:2490,serviettes:1990,'couvre-lits':6990};
const clean=value=>String(value??'').replaceAll('*',' × ').replace(/\s+/g,' ').trim();
const fold=value=>clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const slug=value=>fold(value).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,16);
function sourceKey(value){
 try{const u=new URL(value);const cj=u.pathname.match(/-p-(.+)\.html$/);if(u.hostname.includes('cjdropshipping')&&cj)return 'cj:'+cj[1].toLowerCase();return u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/$/,'');}catch{return value;}
}
function sourceName(value){return /alibaba/i.test(value)?'Alibaba':/\baw\b/i.test(value)?'AW Europe':/cj/i.test(value)?'CJdropshipping':value;}
function tint(name){
 const text=fold(name);
 const rules=[[/beige|sand|sable|milk tea|naturel|^lin$/,'#d8c5a8'],[/cream|creme|ecru|ivory|ivoire/,'#eee4cf'],[/white|blanc|neige/,'#f7f4ed'],[/champagne|stone|pierre/,'#d7cbb7'],[/grey|gray|gris|silver|argent|galet|brume/,'#a7a6a3'],[/rose|pink|powder/,'#d7aaa8'],[/green|vert|sage|sauge|thym|kaki|celadon|eucalyptus|romarin/,'#93a28d'],[/blue|bleu|navy|marine|nuit/,'#7c96aa'],[/black|noir|charcoal/,'#45423f'],[/brown|marron|coffee|camel|caramel|taupe|havane/,'#a58869'],[/yellow|jaune|mustard|moutarde|gold|dore/,'#c5aa65'],[/red|rouge|ruby|bordeaux|wine/,'#914c50'],[/purple|violet|lilas|lavender/,'#ad9caf'],[/orange|terracotta|rust|rouille|terre de sienne|tomette/,'#bc8062']];
 return rules.find(([pattern])=>pattern.test(text))?.[1];
}
const neutral=name=>/beige|cream|creme|ecru|ivory|ivoire|sand|sable|milk tea/.test(fold(name))?0:/white|blanc|champagne|stone|pierre|naturel/.test(fold(name))?1:3;
const records=new Map(original.products.map(p=>[sourceKey(p.url),structuredClone(p)]));
for(const p of records.values()){
 p.variantGalleries={};p.modelGallery=[];
 const photo=p.previewPhoto??manifest?.images.find(i=>i.id.split('-').at(-1)===p.supplierProductId&&i.visualVerified&&i.privatePreviewRecommended);
 if(photo)p.modelGallery.push({localpath:photo.localpath,url:p.imageUrl});
 for(const a of p.verifiedColorAssets??[])p.variantGalleries[fold(a.name)]=[{localpath:a.localpath,url:p.imageUrl}];
}
const datasets=['work/alibaba-expanded-2026-10-25.json',fs.existsSync('work/cj-corrected-2026-10-25.json')?'work/cj-corrected-2026-10-25.json':'work/cj-expanded-2026-10-25.json',fs.existsSync('work/specialist-corrected-2026-10-25.json')?'work/specialist-corrected-2026-10-25.json':'work/specialist-expanded-2026-10-25.json'];
const frenchNames=new Map((read('work/cj-names-fr-2026-10-25.json')??[]).map(p=>[p.id,p]));
const sourceNotes=[];
for(const file of datasets){
 const data=read(file);if(!data)continue;
 sourceNotes.push(...(data.sourceNotes??[]));
 for(const input of data.products??[]){
  const url=input.sourceUrl??input.url;if(!url||!/^https:\/\//.test(url))continue;
  const key=sourceKey(url),previous=records.get(key);
  const translation=frenchNames.get(input.id);
  const rawCategory=translation?.category??input.category;
  const category=({'housses-coussins':'housses','housses de coussin':'housses','linge-bain':'serviettes','draps-housses':'draps'}[rawCategory]??rawCategory);
  if(!categories.has(category))continue;
  const colorRows=(input.colors??[]).map(c=>typeof c==='string'?{name:c,images:[]}:c).filter(c=>c.name||c.label);
  const sizeRows=(input.sizes??[]).map(s=>({label:clean(typeof s==='string'?s:s.label),verified:true,source:url})).filter(s=>s.label);
  const p=previous??{id:input.id??`${slug(input.source??'supplier')}-${hash(key)}`,supplierProductId:input.supplierProductId??input.id,status:'draft',readyForSale:false,sourceFiles:[]};
  Object.assign(p,{nameFR:clean(translation?.nameFR??input.nameFR??p.nameFR),category,supplier:input.supplier??input.source??p.supplier,url,sourceLabel:sourceName(input.source??input.supplier??p.sourceLabel),checkedAt:data.checkedAt??'2026-10-25',descriptionFrench:clean(input.descriptionFrench??p.descriptionFrench),imageRightsApproved:false,requiresSupplierBundle:Boolean(translation?.requiresSupplierBundle)});
  if(sizeRows.length)p.sizes=sizeRows;else p.sizes??=[];
  if(colorRows.length)p.colors=colorRows.map(c=>({label:clean(c.name??c.label).replace(/^#/,'').trim(),verified:true,source:c.evidence??url}));else p.colors??=[];
  p.variantGalleries??={};p.modelGallery??=[];
  // An unassigned model photo is never copied into every colour gallery.
  for(const color of colorRows){const name=clean(color.name??color.label).replace(/^#/,'').trim();const photos=(color.images??[]).map(i=>typeof i==='string'?{url:i}:i);if(photos.length)p.variantGalleries[fold(name)]=photos;}
  const general=(input.gallery??[]).map(i=>typeof i==='string'?{url:i}:i);if(general.length)p.modelGallery=general;
  if(input.coverImage||input.imageUrl)p.modelGallery.push({url:input.coverImage??input.imageUrl});
  const price=input.price??{};
  p.cost={currency:price.currency??p.cost?.currency??'EUR',min:Number.isFinite(price.min)?price.min:p.cost?.min??null,max:Number.isFinite(price.max)?price.max:p.cost?.max??null,approved:false,landedCostVerified:false};
  p.sourcePriceBasis=price.basis??null;
  p.publicPriceHint=typeof price.basis==='string'?price.basis:price.basis?'Prix publics par paliers ; tarif de la variante à confirmer.':typeof p.publicPriceHint==='string'?p.publicPriceHint:null;
  p.moq=typeof input.moq==='object'&&input.moq?{quantity:null,unit:'pièce',conflict:null,...input.moq}:input.moq===1?{quantity:1,unit:'pièce',conflict:null}:p.moq??{quantity:null,unit:'pièce',conflict:null};
  p.shipping=typeof input.shippingNote==='object'?input.shippingNote:p.shipping??null;
  p.detailsFrench=[...(input.materials??p.detailsFrench??[]).map(clean).filter(Boolean)];
  p.openQuestionsFR=[...new Set([...(input.uncertainties??p.openQuestionsFR??[]).map(clean),'Coût livré, stock et combinaisons taille/couleur à valider avant vente.','Droits de réutilisation commerciale des photographies à confirmer.'])];
  p.sourceFiles=[...new Set([...(p.sourceFiles??[]),file])];
  p.evidenceLevel=input.evidenceLevel??'Fiche publique fournisseur ; informations et variantes à revalider avant ouverture.';
  records.set(key,p);
 }
}

for(const verified of read('work/photo-verified-overrides.json')?.models??[]){
 const p=[...records.values()].find(p=>p.id===verified.id);if(!p)continue;
 p.visualReviews??={};
 for(const color of verified.colors){
  if(!p.colors.some(c=>fold(c.label)===fold(color.name)))throw new Error(`Verified color absent: ${p.id}/${color.name}`);
  p.variantGalleries[fold(color.name)]=color.images;
  p.visualReviews[fold(color.name)]=color.associationVerified===true;
 }
}

const dest=path.resolve(root,'public/img/catalogue');fs.mkdirSync(dest,{recursive:true});
const imageCache=read('work/catalog-image-web/url-map.json')??read('work/catalog-image-cache/url-map.json')??{};
const localWeb=read('work/catalog-local-web/path-map.json')??{};
const localSources=new Set();
for(const p of records.values()){
 for(const list of [...Object.values(p.variantGalleries??{}),p.modelGallery??[]]){
  const first=list.find(photo=>photo&&photo.commercialGalleryRecommended!==false&&photo.countsAsDistinctPhoto!==false&&!photo.rejected);
  if(first?.url)localSources.add(first.url);
 }
}
const localCachePaths=new Set([...localSources].map(url=>imageCache[url]).filter(Boolean));
const remoteByCache=new Map();
const assetHashes=new Map();
function asset(photo){
 if(!photo||photo.commercialGalleryRecommended===false||photo.countsAsDistinctPhoto===false||photo.rejected===true)return null;
 const url=photo.url??photo.src;
 const cachePath=imageCache[url];
 // Keep fast cover/colour previews in the Site; other real views load from their
 // supplier origin. Canonical cache identities still remove size-photo repeats.
 if(typeof url==='string'&&/^https:\/\//.test(url)&&!localSources.has(url)&&!localCachePaths.has(cachePath)){
  if(cachePath){if(remoteByCache.has(cachePath))return remoteByCache.get(cachePath);remoteByCache.set(cachePath,url);}
  return url;
 }
 const originalLocal=photo.localpath??photo.localPath??photo.path;
 const local=imageCache[photo.url??photo.src]??localWeb[originalLocal]??originalLocal;
 if(local&&fs.existsSync(local)){
  const bytes=fs.readFileSync(local),digest=hash(bytes);
  if(assetHashes.has(digest))return assetHashes.get(digest);
  const ext=path.extname(local).toLowerCase();if(!['.jpg','.jpeg','.png','.webp','.avif'].includes(ext))return null;
  const target=path.join(dest,`${digest}${ext}`);fs.copyFileSync(local,target);
  const src=`/img/catalogue/${digest}${ext}`;assetHashes.set(digest,src);return src;
 }
 if(typeof url==='string'&&/^https:\/\//.test(url))return url;
 return null;
}
const distinct=values=>[...new Set(values.filter(Boolean))];
const sourceProducts=[...records.values()].filter(p=>p.nameFR&&p.url);
const compiled=sourceProducts.map(p=>{
 const supplierBundle=Boolean(p.requiresSupplierBundle||/parure|ensemble|four.?piece|three.?piece/.test(fold(p.nameFR)));
 const colors=p.colors.filter(c=>c.verified).map((c,i)=>({id:`color-${i+1}`,name:clean(c.label).replace(/^#/,'').trim(),hex:tint(c.label)}));
 const colorGalleries={},images={};
 for(const c of colors){const photos=distinct((p.variantGalleries?.[fold(c.name)]??[]).map(asset));if(photos.length){colorGalleries[c.id]=photos;images[c.id]=photos[0];}}
 const assigned=new Set(Object.values(colorGalleries).flat());
 const sharedGallery=distinct((p.modelGallery??[]).map(asset)).filter(src=>!assigned.has(src));
 const ordered=[...colors].sort((a,b)=>Number(Boolean(images[b.id]))-Number(Boolean(images[a.id]))||neutral(a.name)-neutral(b.name));
 const coverImage=ordered.map(c=>images[c.id]).find(Boolean)??sharedGallery[0];
 let target=targets[p.category];
 // Provisional retail target, not a promise of margin. No invented FX conversion.
 if(p.cost.currency==='EUR'&&p.cost.min>0){const observedCost=p.cost.min+(p.shipping?.currency==='EUR'?p.shipping.amount??0:0);target=Math.max(target,Math.ceil((observedCost*2*100+10)/1000)*1000-10);}
 const options=p.sizes.filter(s=>s.verified).map((s,i)=>({id:`format-${i+1}`,label:clean(s.label),price:target}));
 const reviewed=colors.length>0&&colors.every(c=>p.visualReviews?.[fold(c.name)]===true);
 const product={id:p.id,category:p.category,availableColors:colors.map(c=>c.id),colorOptions:colors,name:p.nameFR,subtitle:categoryNames[p.category],description:p.descriptionFrench||`${p.nameFR}. Choisissez le format et le coloris qui conviennent à votre intérieur.`,options,details:[...p.detailsFrench,'Les options sont relevées séparément : associations taille/couleur, contenu et stock restent à confirmer.',...(supplierBundle?['Lot fournisseur indissociable à ce stade : conservé en recherche, sans proposition de vente séparée.']:[])],images,coverImage,gallery:[],colorGalleries,sharedGallery,draftOnly:true,priceStatus:'proposed',proposedPriceCents:target,requiresSupplierBundle:supplierBundle,photoAssociationsReviewed:reviewed,photoNote:reviewed?'Galeries de ces coloris contrôlées visuellement. Certains accessoires de mise en scène ne sont pas inclus.':'Photos reliées au coloris par la fiche fournisseur ; contrôle visuel complet en cours. Les vues sans association connue sont présentées à part.'};
 p.photoAudit={knownColors:colors.length,assignedPhotos:Object.values(colorGalleries).reduce((n,list)=>n+list.length,0),unassignedPhotos:sharedGallery.length,minimumPhotosPerColor:colors.length?Math.min(...colors.map(c=>colorGalleries[c.id]?.length??0)):0,hasEnoughSourceLinks:colors.length>=2&&colors.every(c=>(colorGalleries[c.id]?.length??0)>=3),meetsRequestedMinimum:reviewed&&colors.length>=2&&colors.every(c=>(colorGalleries[c.id]?.length??0)>=3)};
 p.requiresSupplierBundle=supplierBundle;
 p.proposedPrice={currency:'EUR',amount:target/100,approved:false,basis:'Prix de vente proposé pour l’aperçu, selon une grille par catégorie ; plancher relevé lorsque le coût public en EUR l’exige. Ne valide ni coût livré, ni taxes, ni marge.'};
 return product;
});
// Keep existing model identities; prioritise new records with richer, neutral galleries.
const originalIds=new Set(original.products.map(p=>p.id));
const score=p=>{const full=p.availableColors.length>=2&&p.availableColors.every(c=>(p.colorGalleries[c]?.length??0)>=3);return (full?10000:0)+(p.availableColors.length>=2?1000:0)+(p.coverImage?100:0)+Math.min(Object.values(p.colorGalleries).flat().length+p.sharedGallery.length,50)+(p.colorOptions.some(c=>neutral(c.name)===0)?20:0);};
const illustrated=[...compiled.filter(p=>originalIds.has(p.id)&&p.coverImage&&!p.requiresSupplierBundle),...compiled.filter(p=>!originalIds.has(p.id)&&p.coverImage&&!p.requiresSupplierBundle).sort((a,b)=>score(b)-score(a))].slice(0,200);
const illustratedIds=new Set(illustrated.map(p=>p.id));
const selected=[...illustrated,...compiled.filter(p=>originalIds.has(p.id)&&!illustratedIds.has(p.id))];
const selectedIds=new Set(selected.map(p=>p.id));
const selectedSources=sourceProducts.filter(p=>selectedIds.has(p.id));
const referenced=new Set(selected.flatMap(p=>[p.coverImage,...Object.values(p.colorGalleries).flat(),...p.sharedGallery]).filter(src=>src?.startsWith('/img/catalogue/')).map(src=>path.basename(src)));
// Remove only this generator's unreferenced hash-named files inside its own directory.
for(const entry of fs.readdirSync(dest)){
 if(!referenced.has(entry)&&/^[0-9a-f]{16}\.(jpg|jpeg|png|webp|avif)$/.test(entry)){
  const file=path.resolve(dest,entry);if(!file.startsWith(dest+path.sep))throw new Error('Unsafe generated image path');
  fs.unlinkSync(file);
 }
}
// Source-only photo evidence may include local paths and is never included in a browser import.
for(const p of selectedSources){delete p.variantGalleries;delete p.modelGallery;delete p.previewPhoto;delete p.verifiedColorAssets;}
fs.writeFileSync(path.join(root,'lib/imported-products.ts'),`import type { Product } from './catalog';\n// Modèles en préparation ; tous les prix de vente sont proposés, aucun encaissement autorisé.\nexport const importedProducts: Product[] = ${JSON.stringify(selected,null,2)};\n`);
fs.writeFileSync(path.join(root,'lib/sourcing-data.ts'),`import 'server-only';\n// Preuves et coûts fournisseurs conservés côté serveur.\nexport const sourcingCandidates = ${JSON.stringify(selectedSources,null,2)};\n`);
const report={checkedAt:'2026-10-25',target:200,uniqueModels:selected.length,allResearchedModels:compiled.length,withIllustration:selected.filter(p=>p.coverImage).length,collectionSupplierModels:selected.filter(p=>p.coverImage&&!p.requiresSupplierBundle).length,withTwoColors:selected.filter(p=>p.availableColors.length>=2).length,meetsTwoColorsThreePhotos:selectedSources.filter(p=>p.photoAudit.meetsRequestedMinimum).length,colorSpecificPhotos:selectedSources.reduce((n,p)=>n+p.photoAudit.assignedPhotos,0),unassignedModelPhotos:selectedSources.reduce((n,p)=>n+p.photoAudit.unassignedPhotos,0),knownColorLabels:selected.reduce((n,p)=>n+p.availableColors.length,0),knownSizeLabels:selected.reduce((n,p)=>n+p.options.length,0),proposedPrices:selected.filter(p=>p.proposedPriceCents>0).length,sources:Object.fromEntries([...new Set(selectedSources.map(p=>p.sourceLabel))].map(source=>[source,selectedSources.filter(p=>p.sourceLabel===source).length])),sourceNotes};
fs.writeFileSync('work/catalog-v3-report.json',JSON.stringify(report,null,2));
fs.writeFileSync('work/catalog-v3-sources.json',JSON.stringify({checkedAt:'2026-10-25',products:selectedSources},null,2));
const columns=['id','sourceLabel','nameFR','url','colors','sizes','proposedRetailEUR','supplierMin','supplierMax','supplierCurrency','knownColors','minimumPhotosPerColor','meetsPhotoBrief','status'];
const escape=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const csv=[columns.join(';'),...selectedSources.map(p=>[p.id,p.sourceLabel,p.nameFR,p.url,p.colors.map(c=>c.label).join(' | '),p.sizes.map(s=>s.label).join(' | '),p.proposedPrice.amount,p.cost.min,p.cost.max,p.cost.currency,p.photoAudit.knownColors,p.photoAudit.minimumPhotosPerColor,p.photoAudit.meetsRequestedMinimum?'oui':'non','brouillon non commandable'].map(escape).join(';'))].join('\r\n');
fs.writeFileSync('outputs/founder/catalogue-fournisseurs-v3.csv','\ufeff'+csv);
console.log(JSON.stringify(report,null,2));
// Keep the separately reviewed scene/macro selection when regenerating source data.
if(fs.existsSync('work/lifestyle-reviewed-first.json')&&fs.existsSync('work/lifestyle-reviewed-second.json'))await import('./apply-lifestyle-curation.mjs');
