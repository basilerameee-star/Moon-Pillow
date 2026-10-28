import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('work/sites/moon-and-pillow');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const candidates=read('work/lifestyle-review/candidates.json');
const reviews=[...read('work/lifestyle-reviewed-first.json'),...read('work/lifestyle-reviewed-second.json')];
const corrections=fs.existsSync('work/lifestyle-review-corrections.json')?read('work/lifestyle-review-corrections.json'):[];
const classified=new Map(reviews.map(r=>[r.reviewId,r]));
for(const r of corrections)classified.set(r.reviewId,r);
const rows=candidates.map(c=>({...c,...classified.get(c.reviewId)}));
if(fs.existsSync('work/lifestyle-extra-first.json'))rows.push(...read('work/lifestyle-extra-first.json'));
if(fs.existsSync('work/lifestyle-extra-verified-views.json'))rows.push(...read('work/lifestyle-extra-verified-views.json').map(row=>({...row,src:row.src??row.url})));
for(const file of ['work/lifestyle-extra-colours.json','work/lifestyle-extra-colours-second.json'])if(fs.existsSync(file))rows.push(...read(file));
const resolvedRows=[...new Map(rows.map(row=>[`${row.productId}:${row.colorId??'general'}:${row.src}`,row])).values()];
const filename=path.join(root,'lib/imported-products.ts');
const source=fs.readFileSync(filename,'utf8');
const products=JSON.parse(source.slice(source.indexOf('= [')+2,source.lastIndexOf(';')));
const byId=new Map(products.map(p=>[p.id,p]));
const web=read('work/catalog-image-web/url-map.json');
const localWeb=read('work/catalog-local-web/path-map.json');
const translations=fs.existsSync('work/lifestyle-asset-map.json')?read('work/lifestyle-asset-map.json'):{};
const curation={
 'housse-cotelee':{lifestyleGalleries:{blanc:['/img/canape-blanc.jpg'],rose:['/img/rose.jpg'],vert:['/img/vert.jpg']},macroGalleries:{blanc:['/img/matiere.jpg']}},
 'plaid-cotele':{lifestyleGalleries:{blanc:['/img/plaid-detente.jpg','/img/plaid-lit.jpg'],rose:['/img/plaid-rose.jpg'],vert:['/img/plaid-vert.jpg']},macroGalleries:{blanc:['/img/plaid-matiere.jpg']}}
};
function localize(row){
 if(row.src.startsWith('/'))return row.src;
 if(translations[row.src]&&fs.existsSync(path.join(root,'public',translations[row.src]))){
  const existing=fs.readFileSync(path.join(root,'public',translations[row.src]));
  if(!translations[row.src].endsWith('.webp')||existing.toString('ascii',0,4)==='RIFF')return translations[row.src];
 }
 const local=web[row.url??row.src]??localWeb[row.localPath]??row.localPath;
 if(!local||!fs.existsSync(local))return row.src;
 const bytes=fs.readFileSync(local),hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16);
 const dest='/img/catalogue/'+hash+path.extname(local).toLowerCase();
 fs.copyFileSync(local,path.join(root,'public',dest));
 translations[row.src]=dest;
 return dest;
}
const accepted=[];
for(const row of resolvedRows){
 if(!['scene','macro'].includes(row.classification))continue;
 const p=byId.get(row.productId);if(!p)continue;
 const sourceSrc=row.src,knownSrc=translations[sourceSrc]??sourceSrc;
 const exact=row.colorId?p.colorGalleries?.[row.colorId]??[]:[...(p.sharedGallery??[]),...p.gallery,...(p.coverImage?[p.coverImage]:[])];
 if(!exact.includes(sourceSrc)&&!exact.includes(knownSrc))continue;
 if(!row.colorId&&row.classification!=='scene')continue;
 const dest=localize(row);
 for(const [color,list] of Object.entries(p.colorGalleries??{}))p.colorGalleries[color]=list.map(src=>src===sourceSrc||src===knownSrc?dest:src);
 for(const color of Object.keys(p.images))if(p.images[color]===sourceSrc||p.images[color]===knownSrc)p.images[color]=dest;
 p.sharedGallery=(p.sharedGallery??[]).map(src=>src===sourceSrc||src===knownSrc?dest:src);
 p.gallery=p.gallery.map(src=>src===sourceSrc||src===knownSrc?dest:src);
 if(p.coverImage===sourceSrc||p.coverImage===knownSrc)p.coverImage=dest;
 const item=curation[p.id]??={};
 if(row.colorId){const field=row.classification==='scene'?'lifestyleGalleries':'macroGalleries';item[field]??={};item[field][row.colorId]??=[];if(!item[field][row.colorId].includes(dest))item[field][row.colorId].push(dest);}
 else{item.modelScenes??=[];if(!item.modelScenes.includes(dest))item.modelScenes.push(dest);}
 accepted.push({productId:p.id,colorId:row.colorId,src:sourceSrc,displaySrc:dest,classification:row.classification,reason:row.reason});
}
fs.writeFileSync(filename,"import type { Product } from './catalog';\n// Modèles en préparation ; tous les prix sont proposés, aucun encaissement autorisé.\nexport const importedProducts: Product[] = "+JSON.stringify(products,null,2)+';\n');
fs.writeFileSync(path.join(root,'lib/photo-curation.ts'),'// Supplier images visually reviewed for this private collection; never infer a colour from a general view.\nexport const photoCuration:Record<string,{lifestyleGalleries?:Record<string,string[]>;macroGalleries?:Record<string,string[]>;modelScenes?:string[]}>= '+JSON.stringify(curation,null,2)+';\n');
fs.writeFileSync('work/lifestyle-asset-map.json',JSON.stringify(translations,null,2));
const sceneProducts=Object.values(curation).filter(c=>Object.values(c.lifestyleGalleries??{}).some(g=>g.length)||c.modelScenes?.length).length;
const report={reviewedPlacements:rows.length,reviewedUniqueAssociations:resolvedRows.length,accepted:accepted.length,sceneModelsIncludingInitial:sceneProducts,sourceModels:products.length,exactSceneModels:Object.values(curation).filter(c=>Object.keys(c.lifestyleGalleries??{}).length).length,unassignedSceneModels:Object.values(curation).filter(c=>c.modelScenes?.length).length,acceptedViews:accepted};
fs.writeFileSync('work/lifestyle-curation-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,acceptedViews:undefined}));
