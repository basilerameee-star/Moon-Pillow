import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {products,firstColor,galleryFor,lifestyleGalleryFor,macroGalleryFor,presentationGalleryFor,modelSceneGalleryFor,collectionImage,productImage,presentationColor} from '../lib/catalog.ts';
const base=()=>({id:'fixture',category:'draps',name:'Drap',subtitle:'',description:'',availableColors:['sand','rose'],colorOptions:[{id:'sand',name:'Sable'},{id:'rose',name:'Rose'}],images:{sand:'/sand-cutout.jpg',rose:'/rose-scene.jpg'},colorGalleries:{sand:['/sand-cutout.jpg'],rose:['/rose-scene.jpg','/rose-macro.jpg']},options:[],gallery:[],sharedGallery:['/general-scene.jpg'],coverImage:'/generic-cutout.jpg'});

test('a verified scene leads before a neutral colour with only a cutout',()=>{
 const p={...base(),lifestyleGalleries:{rose:['/rose-scene.jpg']}};
 assert.equal(firstColor(p),'rose');
 assert.equal(collectionImage(p),'/rose-scene.jpg');
 assert.equal(collectionImage(p,'sand'),undefined);
});
test('wrong-colour and shared views cannot enter an exact scene or macro gallery',()=>{
 const p={...base(),lifestyleGalleries:{sand:['/rose-scene.jpg','/general-scene.jpg']},macroGalleries:{sand:['/rose-macro.jpg']}};
 assert.deepEqual(presentationGalleryFor(p,'sand'),[]);
 assert.equal(productImage(p,'sand'),undefined);
});
test('the collection has no generic or white-cutout fallback and general scenes stay unassigned',()=>{
 const p=base();
 assert.equal(collectionImage(p),undefined);
 p.modelScenes=['/general-scene.jpg','/invented.jpg'];
 assert.deepEqual(modelSceneGalleryFor(p),['/general-scene.jpg']);
 assert.equal(collectionImage(p),'/general-scene.jpg');
 assert.equal(collectionImage(p,'rose'),undefined);
 assert.equal(presentationColor(p),'');
 assert.deepEqual(galleryFor(p,'rose'),['/rose-scene.jpg','/rose-macro.jpg']);
});
test('scene then macro order is stable, deduplicated and preserves source evidence separately',()=>{
 const p={...base(),lifestyleGalleries:{rose:['/rose-scene.jpg','/rose-scene.jpg']},macroGalleries:{rose:['/rose-macro.jpg','/rose-scene.jpg']}};
 assert.deepEqual(presentationGalleryFor(p,'rose'),['/rose-scene.jpg','/rose-macro.jpg']);
 assert.deepEqual(galleryFor(p,'sand'),['/sand-cutout.jpg']);
});
test('every shipped curated view belongs to its source gallery and local image files exist',()=>{
 for(const p of products){
  for(const color of p.availableColors){
   const source=new Set(galleryFor(p,color));
   for(const src of [...lifestyleGalleryFor(p,color),...macroGalleryFor(p,color)]){
    assert.ok(source.has(src),`${p.id}/${color}`);
    if(src.startsWith('/'))assert.ok(existsSync(new URL('../public'+src,import.meta.url)),src);
   }
  }
  for(const src of modelSceneGalleryFor(p))if(src.startsWith('/'))assert.ok(existsSync(new URL('../public'+src,import.meta.url)),src);
 }
});
test('the screenshot fitted-sheet model keeps evidence without presenting a hidden sheet as a scene',()=>{
 const p=products.find(p=>p.id==='pd-25600');
 assert.ok(p);
 assert.equal(collectionImage(p),undefined);
 assert.ok(Object.values(p.colorGalleries).some(images=>images.length>=2));
});
