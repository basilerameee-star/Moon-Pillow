import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('work/sites/moon-and-pillow');
const data=JSON.parse(fs.readFileSync(fs.existsSync('work/catalog-expanded.json')?'work/catalog-expanded.json':'work/catalog-normalized.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('work/alibaba-assets/manifest.json','utf8'));
fs.mkdirSync(path.join(root,'public/img/fournisseurs'),{recursive:true});
const labels={housses:'Housses de coussin',plaids:'Plaids',ensembles:'Ensembles', 'housses-couette':'Housses de couette',couettes:'Couettes',oreillers:'Oreillers',taies:'Taies d’oreiller',draps:'Draps',coussins:'Coussins',serviettes:'Linge de bain','couvre-lits':'Couvre-lits'};
function label(s){return s.replaceAll('*',' × ').replace(/\s+/g,' ').replaceAll('taie d\'oreiller','taie d’oreiller').trim();}
const products=data.products.map(p=>{
  const photo=p.previewPhoto??manifest.images.find(i=>i.id.split('-').at(-1)===p.supplierProductId && i.visualVerified && i.privatePreviewRecommended);
  let coverImage;
  if(photo){coverImage=`/img/fournisseurs/${p.supplierProductId}.jpg`;fs.copyFileSync(photo.localpath,path.join(root,'public',coverImage));}
  const colors=p.colors.filter(c=>c.verified).map((c,i)=>({id:`color-${i+1}`,name:label(c.label)}));
  const images={};
  for(const asset of p.verifiedColorAssets??[]){const color=colors.find(c=>c.name===label(asset.name));if(!color)continue;const filename=`${p.id}-${asset.sku}.jpg`;const folder=path.resolve(root,'public/img/fournisseurs');const target=path.resolve(folder,filename);if(!target.startsWith(folder+path.sep))throw new Error('Invalid asset target');if(asset.localpath===photo?.localpath){images[color.id]=coverImage;if(fs.existsSync(target))fs.unlinkSync(target);}else{fs.copyFileSync(asset.localpath,target);images[color.id]=`/img/fournisseurs/${filename}`;}}
  return {id:p.id,category:p.category,availableColors:colors.map(c=>c.id),colorOptions:colors,name:p.nameFR,subtitle:labels[p.category],description:p.descriptionFrench,options:p.sizes.filter(s=>s.verified).map((s,i)=>({id:`format-${i+1}`,label:label(s.label),price:0})),details:[...p.detailsFrench,`Choix relevés chez le fournisseur le ${p.checkedAt==='2026-10-25'?'25':'24'} octobre 2026. Associations taille/couleur, stock, composition et entretien à confirmer.`],images,coverImage,gallery:[],draftOnly:true,photoNote:photo?['Photo fournisseur de référence ; quantité du lot et droits de réutilisation commerciale à confirmer.',...(photo.caveats??[])].join(' '):'Photographie en cours de sélection.'};
});
fs.writeFileSync(path.join(root,'lib/imported-products.ts'),`import type { Product } from './catalog';\n// Références de préparation : aucune variante ni vente approuvée.\nexport const importedProducts: Product[] = ${JSON.stringify(products,null,2)};\n`);
fs.writeFileSync(path.join(root,'lib/sourcing-data.ts'),`import 'server-only';\n// Données publiques fournisseurs, conservées côté serveur dans cet aperçu privé.\nexport const sourcingCandidates = ${JSON.stringify(data.products,null,2)};\n`);
console.log(JSON.stringify({imported:products.length,withPreviewPhoto:products.filter(p=>p.coverImage).length,knownSizeLabels:products.reduce((n,p)=>n+p.options.length,0),knownColorLabels:products.reduce((n,p)=>n+p.availableColors.length,0)}));
