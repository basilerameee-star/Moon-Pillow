import fs from 'node:fs';
const base=JSON.parse(fs.readFileSync('work/catalog-normalized.json','utf8'));
const extra=JSON.parse(fs.readFileSync('work/additional-supplier-candidates.json','utf8'));
const excluded=['cj-flannel-solid','cj-solid-four-piece-set'];
const additions=extra.filter(p=>!excluded.includes(p.id)).map(p=>{
 const sourceLabel=p.supplier==='AW Dropship Europe'?'AW Europe':'CJdropshipping';
 const isAW=p.id.startsWith('aw-');
 return {
  id:p.id,supplierProductId:p.id,nameFR:p.nameFR.replace('coton ',''),category:p.category==='housses-coussins'?'housses':p.category,status:'draft',readyForSale:false,
  sizes:p.sizes,colors:p.colors,supplier:p.supplier,url:p.url,sourceLabel,
  moq:{quantity:p.moqquantity,unit:'pièce',conflict:null},
  cost:{currency:p.currency??p.unitPriceEvidence?.currency??'EUR',min:null,max:null,tier:null,approved:false,landedCostVerified:false},shipping:null,
  publicPriceHint:p.unitPriceEvidence&&Number.isFinite(p.unitPriceEvidence.min)&&Number.isFinite(p.unitPriceEvidence.max)?`${p.unitPriceEvidence.min}–${p.unitPriceEvidence.max} ${p.unitPriceEvidence.currency}. ${p.unitPriceEvidence.basis} Port et taxes non validés.`:null,
  descriptionFrench:`${p.nameFR.replace('coton ','')}. Les formats et coloris de cette référence fournisseur sont présentés ci-dessous pour préparer la collection.`,
  detailsFrench:[p.sourceEvidenceFR,...(p.materialEvidence?[`Matière indiquée sur la fiche : ${p.materialEvidence}`]:[]),'Composition exacte, entretien et contenu du colis à confirmer avant ouverture.'],
  openQuestionsFR:p.openQuestionsFR,imageUrl:p.imageUrl,imageRightsApproved:false,checkedAt:p.checkedAt,evidenceLevel:p.sourceEvidenceFR,sourceFiles:['work/additional-supplier-candidates.json'],
  previewPhoto:isAW?{localpath:p.imageLocalPath,caveats:[]}:null,
  verifiedColorAssets:isAW?p.variants.filter(v=>v.imageLocalPath).map(v=>({name:v.sourceColorLabel,localpath:v.imageLocalPath,sku:v.supplierSku})):[],
 };
});
const expanded={...base,checkedAt:'2026-10-25',products:[...base.products.map(p=>({...p,sourceLabel:'Alibaba',publicPriceHint:null})),...additions]};
fs.writeFileSync('work/catalog-expanded.json',JSON.stringify(expanded,null,2));
fs.writeFileSync('outputs/founder/sourcing-exclusions-25-octobre.md','# Références complémentaires écartées de cet import\n\n- CJ plaid polaire : doublon visuel possible avec la sélection initiale, conservé dans la recherche brute.\n- CJ parure quatre pièces : matière et une dimension contradictoires, conservée dans la recherche brute.\n\nImport retenu : 48 modèles de recherche (25 Alibaba + 21 AW Europe + 2 CJ). Les trois modèles du site initial restent séparés. Aucun coût livré ni nouvelle vente approuvé.\n');
console.log(JSON.stringify({base:base.products.length,additional:additions.length,total:expanded.products.length,excluded}));
