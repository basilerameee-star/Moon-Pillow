import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('work/catalog-expanded.json','utf8'));
const encode=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const rows=[['Identifiant','Modèle','Catégorie','Fournisseur','URL','MOQ relevé','Unité','Conflit MOQ','Formats relevés','Couleurs relevées','Prix achat min relevé','Prix achat max relevé','Devise','Port indicatif','Indice prix public non approuvé','Statut','Questions à vérifier']];
for(const p of data.products)rows.push([p.id,p.nameFR,p.category,p.supplier,p.url,p.moq.quantity,p.moq.unit,p.moq.conflict,p.sizes.filter(v=>v.verified).map(v=>v.label).join(' | '),p.colors.filter(v=>v.verified).map(v=>v.label).join(' | '),p.cost.min,p.cost.max,p.cost.currency,p.shipping?.amount,p.publicPriceHint,'Brouillon — vente bloquée',p.openQuestionsFR.join(' | ')]);
fs.writeFileSync('outputs/founder/catalogue-fournisseurs-48.csv','\ufeff'+rows.map(row=>row.map(encode).join(';')).join('\r\n'));
console.log(JSON.stringify({rows:rows.length-1}));
