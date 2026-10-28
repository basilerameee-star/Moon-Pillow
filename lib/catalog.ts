import { importedProducts } from './imported-products';
import { photoCuration } from './photo-curation';
export type Color = string;
export type Category = 'housses' | 'plaids' | 'ensembles' | 'housses-couette' | 'couettes' | 'oreillers' | 'taies' | 'draps' | 'coussins' | 'serviettes' | 'couvre-lits';
export type ProductColor = {id:Color;name:string;hex?:string;swatch?:string};
export type Product = { id: string; category: Category; availableColors: Color[]; colorOptions?: ProductColor[]; name: string; subtitle: string; description: string; options: { id: string; label: string; price: number }[]; details: string[]; images: Record<Color, string>; coverImage?:string; gallery: string[]; colorGalleries?:Record<Color,string[]>; sharedGallery?:string[]; lifestyleGalleries?:Record<Color,string[]>; macroGalleries?:Record<Color,string[]>; modelScenes?:string[]; photoNotes?:Record<string,string>; photoScalingNote?:string; video?:{src:string;poster?:string;caption:string}; draftOnly?:boolean; photoNote?:string; priceStatus?:'proposed'|'approved'; proposedPriceCents?:number; requiresSupplierBundle?:boolean; photoAssociationsReviewed?:boolean };
export const colors: { id: Color; name: string; hex: string }[] = [
 { id: 'blanc', name: 'Blanc nuage', hex: '#eae4d9' }, { id: 'rose', name: 'Rose poudré', hex: '#d5aaa6' }, { id: 'vert', name: 'Vert', hex: '#9ea895' },
];
const catalogueProducts: Product[] = [
 { id: 'housse-cotelee', category: 'housses', availableColors: ['blanc', 'rose', 'vert'], name: 'La housse côtelée', subtitle: 'La petite touche qui change le canapé.', description: 'Une housse à choisir à la pièce, dans la couleur qui vous plaît. Ajoutez ensuite les autres éléments de votre choix. Le coussin intérieur n’est pas inclus. Le vert clair de cette housse diffère du vert olive du plaid.', options: [{ id: 'unite-45-45', label: '1 housse seule · 45 × 45 cm', price: 1290 }], details: ['Vente proposée à l’unité : une housse, sans coussin intérieur.', 'Format indiqué dans la sélection initiale : 45 × 45 cm.', 'Conditionnement fournisseur, composition et entretien à confirmer avant ouverture.'], images: { blanc: '/img/blanc.jpg', rose: '/img/rose.jpg', vert: '/img/vert.jpg' }, gallery: [], colorGalleries:{blanc:['/img/blanc.jpg','/img/canape-blanc.jpg','/img/matiere.jpg'],rose:['/img/rose.jpg'],vert:['/img/vert.jpg']}, sharedGallery:['/img/dimensions.jpg'], priceStatus:'proposed' },
 { id: 'plaid-cotele', category: 'plaids', availableColors: ['blanc', 'rose', 'vert'], name: 'Le plaid côtelé', subtitle: 'Votre prochain rendez-vous avec le canapé.', description: 'À poser au bout du lit ou sur l’accoudoir du canapé. Le plaid se décline en blanc, rose ou vert olive, avec deux formats à choisir. Son vert est différent de celui des housses sur les photos.', options: [{ id: '120-200', label: '120 × 200 cm', price: 4990 }, { id: '150-200', label: '150 × 200 cm', price: 5990 }], details: ['Deux formats proposés dans la sélection initiale.', 'Effet fausse fourrure à côtes.', 'Composition exacte et consignes d’entretien à confirmer avant ouverture.'], images: { blanc: '/img/plaid-blanc.jpg', rose: '/img/plaid-rose.jpg', vert: '/img/plaid-vert.jpg' }, gallery: [], colorGalleries:{blanc:['/img/plaid-blanc.jpg','/img/plaid-matiere.jpg','/img/plaid-lit.jpg','/img/plaid-detente.jpg'],rose:['/img/plaid-rose.jpg'],vert:['/img/plaid-vert.jpg']}, priceStatus:'proposed' },
 ...importedProducts,
];
const imageOwners = new Map<string,Set<string>>();
for(const product of catalogueProducts){
 const colorIds=new Set([...Object.keys(product.colorGalleries??{}),...Object.keys(product.images??{})]);
 for(const color of colorIds){
  const owner=`${product.id}::${color}`;
  const sources=new Set([...(product.colorGalleries?.[color]??[]),...(product.images?.[color]?[product.images[color]]:[])]);
  for(const src of sources){const owners=imageOwners.get(src)??new Set<string>();owners.add(owner);imageOwners.set(src,owners);}
 }
}
const dimensionArea=(label:string):number|null=>{
 const match=label.trim().match(/^([\d.,]+)\s*(cm|mm|m)?\s*[x×*]\s*([\d.,]+)\s*(cm|mm|m)?$/i);
 if(!match)return null;
 const number=(value:string)=>Number(value.replace(',','.'));
 const width=number(match[1]),height=number(match[3]);
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return null;
 const unit=(match[2]??match[4]??'cm').toLowerCase(),factor=unit==='m'?100:unit==='mm'?.1:1;
 return width*height*factor*factor;
};
const preferredSizeArea:Partial<Record<Category,number>>={housses:2025,coussins:2025,taies:3500,oreillers:3500,'housses-couette':52800,couettes:52800,draps:26600,'couvre-lits':52800,plaids:24000,serviettes:4500};
const priceAtNinety=(cents:number)=>Math.max(90,Math.ceil(cents/100)*100-10);
function priceOptionsByArea(product:Product):Product{
 if(product.priceStatus==='approved'||product.options.length<2)return product;
 const areas=product.options.map(option=>dimensionArea(option.label));
 if(areas.some(area=>area===null))return product;
 const sizes=areas as number[],preferred=preferredSizeArea[product.category]??0,anchorIndex=preferred?sizes.indexOf(preferred):-1;
 const baseIndex=anchorIndex>=0?anchorIndex:sizes.indexOf(Math.min(...sizes)),baseArea=sizes[baseIndex],basePrice=product.options[baseIndex]?.price??0;
 if(basePrice<=0||baseArea<=0)return product;
 const options=product.options.map((option,index)=>({...option,price:priceAtNinety(basePrice*sizes[index]/baseArea)})).sort((a,b)=>(dimensionArea(a.label)??0)-(dimensionArea(b.label)??0));
 return {...product,options,photoScalingNote:`Prix provisoires calculés selon la surface du format, à partir de ${product.options[baseIndex].label}. Coût fournisseur livré et marge encore à valider.`};
}
export const products:Product[]=catalogueProducts.map(product=>priceOptionsByArea({...product,...photoCuration[product.id]}));
export const categories: {id:Category;label:string}[] = [{id:'housses-couette',label:'Housses de couette'},{id:'draps',label:'Draps'},{id:'taies',label:'Taies d’oreiller'},{id:'oreillers',label:'Oreillers'},{id:'couettes',label:'Couettes'},{id:'couvre-lits',label:'Couvre-lits'},{id:'housses',label:'Housses de coussin'},{id:'coussins',label:'Coussins'},{id:'plaids',label:'Plaids'},{id:'ensembles',label:'Ensembles'},{id:'serviettes',label:'Linge de bain'}];
export const categoryLabel = (category:Category) => categories.find(c=>c.id===category)?.label??category;
export const roomFor = (product:Product) => ['housses','coussins','plaids','ensembles'].includes(product.category)?'salon':product.category==='serviettes'?'bain':'chambre';
export const money = (cents: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
export const colorName = (id: Color, product?: Product) => product?.colorOptions?.find(c=>c.id===id)?.name ?? (id === 'vert' ? (product?.category === 'housses' ? 'Vert clair' : product?.category === 'plaids' ? 'Vert olive' : 'Vert') : colors.find(c => c.id === id)?.name ?? 'Coloris à confirmer');
const foldColor=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function colorSwatchBackground(color:Pick<ProductColor,'name'|'hex'>){
 const name=foldColor(color.name);
 if(/moutarde.*ecru|ecru.*moutarde/.test(name))return 'linear-gradient(135deg,#c39a3c 0 50%,#e9e3d6 50% 100%)';
 if(/moutarde.*rouille.*gris|mustard.*rust.*grey/.test(name))return 'linear-gradient(135deg,#c39a3c 0 34%,#b9775c 34% 67%,#aaa7a0 67% 100%)';
 if(/rayures roses.*orange|pink.*orange.*multicolor/.test(name))return 'linear-gradient(135deg,#d42d78 0 24%,#e87942 24% 45%,#2e9a92 45% 68%,#46547c 68% 84%,#f2e8d9 84% 100%)';
 if(/multicolore|multicolor|rainbow|arc.?en.?ciel|stripes|rayures/.test(name))return 'linear-gradient(135deg,#c79b42 0 25%,#c98577 25% 50%,#8d9a83 50% 75%,#6e8799 75% 100%)';
 if(/liberty|berber design|tribal design|spring|color mix|lux criss|picture color/.test(name))return 'linear-gradient(135deg,#c79b42 0 25%,#c98577 25% 50%,#8d9a83 50% 75%,#6e8799 75% 100%)';
 if(/opulence|crepuscule/.test(name))return '#6b3f72';
 if(/\bbay\b/.test(name))return '#c98282';
 if(/ebene/.test(name))return 'linear-gradient(135deg,#393a38 0 50%,#f1eee8 50% 100%)';
 if(/^uni$/.test(name))return '#f2f0eb';
 if(/ficelle|pampa|nougat|19 greige|greige|camel|caramel|taupe/.test(name))return '#cbbb9e';
 if(/chantilly|craie|nuage|ecume|bleach color|custard|silk white/.test(name))return '#eeeae1';
 if(/sapin|lichen|jade|kiwi|poire|romarin/.test(name))return '#58745a';
 if(/emeraude|emerald/.test(name))return '#2f7777';
 if(/granit|ardoise|orage|mineral|tourterelle|silhouette/.test(name))return '#888b8c';
 if(/abricot|argile|paprika|vermilion/.test(name))return '#c97f61';
 if(/safran|miel|mais|turmeric|curry|beurre|^or$|bronze|gold|cobalt?/.test(name))return /cobalt/.test(name)?'#416b9a':'#c39a3c';
 if(/guimauve|fuchsia|pourpre|poudre pour la peau|lavande|01 lavande/.test(name))return /fuchsia|pourpre|lavande/.test(name)?'#a678a8':'#d7a7aa';
 if(/canard|aqua|paon|pu ciel|sky|n[ée]nuphar/.test(name))return '#548e91';
 if(/lie de vin|bourgogne|jam|burgundy|wine/.test(name))return '#8d4e58';
 if(/mellow mattala/.test(name))return 'linear-gradient(135deg,#ece8df 0 40%,#b79b5e 40% 65%,#454846 65% 100%)';
 if(/minuit/.test(name))return '#253448';
 if(/terracotta|rouille|rust/.test(name))return '#b9775c';
 if(/moutarde|mustard|marigold|souci|jaune|gold|ocre/.test(name))return '#c39a3c';
 if(/bleu|blue|azur|navy|marine|indigo/.test(name))return '#7893a5';
 if(/vert|green|sauge|sage|olive|kaki|romarin|moss/.test(name))return '#87957e';
 if(/rose|pink|blush/.test(name))return '#c99091';
 if(/bordeaux|burgundy|wine|rouge|red|corail|coral/.test(name))return '#9f5f5a';
 if(/noir|black|charbon|charcoal|anthracite/.test(name))return '#454340';
 if(/gris|gray|grey|galet/.test(name))return '#aaa7a0';
 if(/beige|sable|sand|ecru|ivoire|ivory|cream|creme|lin|naturel|oat/.test(name))return '#d7c6a8';
 if(/blanc|white/.test(name))return '#f1eee8';
 return /^#[\da-f]{6}$/i.test(color.hex??'')?color.hex:undefined;
}
export const productColors = (product: Product):ProductColor[] => (product.colorOptions ?? colors.filter(c => product.availableColors.includes(c.id)).map(c => ({...c, name: colorName(c.id, product), hex: c.id === 'vert' ? (product.category === 'housses' ? '#b5cbb5' : '#83985b') : c.hex}))).map(color=>({...color,swatch:colorSwatchBackground(color)}));
export function photographedProductColors(product:Product){return productColors(product).filter(color=>presentationGalleryFor(product,color.id).length>0);}
export function neutralRank(name:string){
 const text=foldColor(name);
 if(/indigo|navy|marine|multicolor|moutarde|mustard|bordeaux|ruby|rouge|red|noir et|black and/.test(text))return 3;
 if(/beige|ecru|cream|creme|ivory|ivoire|sand|sable|milk tea|oatmeal|lin naturel/.test(text))return 0;
 if(/white|blanc|champagne|stone|pierre|naturel/.test(text))return 1;
 if(/camel|caramel|taupe|coffee|cafe|brown|marron/.test(text))return 2;
 return 3;
}
export function firstColor(product:Product){
 const choices=photographedProductColors(product);
 return [...choices].sort((a,b)=>{
  const sceneA=lifestyleGalleryFor(product,a.id).length>0,sceneB=lifestyleGalleryFor(product,b.id).length>0;
  const hasA=Boolean(product.colorGalleries?.[a.id]?.length||product.images[a.id]);
  const hasB=Boolean(product.colorGalleries?.[b.id]?.length||product.images[b.id]);
  return Number(sceneB)-Number(sceneA)||Number(hasB)-Number(hasA)||neutralRank(a.name)-neutralRank(b.name);
 })[0]?.id??'';
}
export function galleryFor(product:Product,color:Color){
 const exact=product.colorGalleries?.[color]??(product.images[color]?[product.images[color]]:[]);
 const owner=`${product.id}::${color}`,excluded=new Set(photoCuration[product.id]?.excludedPhotos??[]);
 return [...new Set(exact.filter(Boolean))].filter(src=>!excluded.has(src)&&imageOwners.get(src)?.size===1&&imageOwners.get(src)?.has(owner));
}
// Curated views must already belong to this exact colour's source gallery.
export function lifestyleGalleryFor(product:Product,color:Color){
 const exact=new Set(galleryFor(product,color));
 return [...new Set(product.lifestyleGalleries?.[color]??[])].filter(src=>exact.has(src));
}
export function macroGalleryFor(product:Product,color:Color){
 const exact=new Set(galleryFor(product,color));
 return [...new Set(product.macroGalleries?.[color]??[])].filter(src=>exact.has(src));
}
export const presentationGalleryFor=(product:Product,color:Color)=>{
 const lifestyle=lifestyleGalleryFor(product,color),macro=macroGalleryFor(product,color),curated=new Set([...lifestyle,...macro]);
 const localExact=galleryFor(product,color).filter(src=>src.startsWith('/img/')&&!curated.has(src));
 return [...new Set([...lifestyle,...localExact,...macro])];
};
export function modelSceneGalleryFor(product:Product){
 const general=new Set([...(product.sharedGallery??[]),...product.gallery,...(product.coverImage?[product.coverImage]:[])]);
 return [...new Set(product.modelScenes??[])].filter(src=>general.has(src));
}
export const productImage = (product:Product,color=firstColor(product)):string|undefined => presentationGalleryFor(product,color)[0];
export const collectionImage = (product:Product,color?:Color):string|undefined => color===undefined?(lifestyleGalleryFor(product,firstColor(product))[0]??modelSceneGalleryFor(product)[0]??presentationGalleryFor(product,firstColor(product))[0]):(lifestyleGalleryFor(product,color)[0]??presentationGalleryFor(product,color)[0]);
export const presentationColor=(product:Product)=>{const first=firstColor(product);return lifestyleGalleryFor(product,first).length||presentationGalleryFor(product,first).length?first:'';};
export const startingPrice = (product:Product) => {
 const prices=product.options.map(o=>o.price).filter(p=>Number.isSafeInteger(p)&&p>0);
 return prices.length?Math.min(...prices):product.proposedPriceCents??0;
};
export const priceLabel = (product:Product,optionId?:string) => {
 const price=product.options.find(o=>o.id===optionId)?.price||startingPrice(product);
 return price>0?money(price):'Prix en cours';
};
export const meetsPhotoBrief=(product:Product)=>product.photoAssociationsReviewed===true&&product.availableColors.length>=2&&product.availableColors.every(color=>galleryFor(product,color).length>=3);
export type CartItem = { productId: string; color: Color; optionId: string; quantity: number };
export function resolvePreviewItem(item:CartItem){
 const product=products.find(p=>p.id===item.productId);const option=product?.options.find(o=>o.id===item.optionId);
 if(!product||product.requiresSupplierBundle||!option||option.price<=0||!product.availableColors.includes(item.color))throw new Error('Article ou choix incomplet');
 return {product,option};
}
export function resolveItem(item: CartItem) {
 const product = products.find(p => p.id === item.productId); const option = product?.options.find(o => o.id === item.optionId);
 if (!product || product.draftOnly || product.priceStatus!=='approved' || !option || !product.availableColors.includes(item.color)) throw new Error('Article inconnu ou en préparation');
 return { product, option };
}
