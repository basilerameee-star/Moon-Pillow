import test from 'node:test';
import assert from 'node:assert/strict';
import { measuredSize, sizeGuideFor, materialStatements } from '../lib/product-guides.ts';

test('guide measurements require explicit centimetres and do not guess a bundled item', () => {
  assert.deepEqual(measuredSize('1 housse seule · 45 × 45 cm'), {width:45, length:45});
  assert.deepEqual(measuredSize('180x200+30 cm'), {width:180, length:200, depth:30});
  assert.deepEqual(measuredSize('20" × 26" (50 × 66cm)-1pcs'), {width:50, length:66});
  assert.equal(measuredSize('Queen 20 × 26'), undefined);
  assert.equal(measuredSize('240 × 220 cm + 2 taies 50 × 70 cm'), undefined);
});

test('the selected format is used and a fitted sheet calls for mattress thickness', () => {
  const product={category:'draps',name:'Drap Housse Percale',options:[{label:'90x190 cm'}],details:[],draftOnly:true};
  const guide=sizeGuideFor(product,'160x200+30 cm');
  assert.deepEqual(guide.measured,{width:160,length:200,depth:30});
  assert.match(guide.instruction,/épaisseur/);
  assert.match(guide.note,/reste à confirmer/);
  assert.equal(sizeGuideFor({...product,category:'housses-couette'}).kind,'bed');
  assert.equal(sizeGuideFor({...product,category:'taies'}).kind,'pillow');
});

test('a supplier certification is not promoted as verified composition', () => {
  const details=['Composition déclarée : 100 % coton.','Certifié OEKO-TEX coton premium.','Tarif provisoire.'];
  assert.deepEqual(materialStatements({details}),['Composition déclarée : 100 % coton.']);
});
