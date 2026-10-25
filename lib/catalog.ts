import { importedProducts } from './imported-products';
export type Color = string;
export type Category = 'housses' | 'plaids' | 'ensembles' | 'housses-couette' | 'couettes' | 'oreillers' | 'taies' | 'draps' | 'coussins' | 'serviettes' | 'couvre-lits';
export type Product = { id: string; category: Category; availableColors: Color[]; colorOptions?: {id:Color;name:string;hex?:string}[]; name: string; subtitle: string; description: string; options: { id: string; label: string; price: number }[]; details: string[]; images: Record<Color, string>; coverImage?:string; gallery: string[]; colorGalleries?:Record<Color,string[]>; sharedGallery?:string[]; draftOnly?:boolean; photoNote?:string; priceStatus?:'proposed'|'approved'; proposedPriceCents?:number; requiresSupplierBundle?:boolean; photoAssociationsReviewed?:boolean };
export const colors: { id: Color; name: string; hex: string }[] = [
 { id: 'blanc', name: 'Blanc nuage', hex: '#eae4d9' }, { id: 'rose', name: 'Rose poudré', hex: '#d5aaa6' }, { id: 'vert', name: 'Vert', hex: '#9ea895' },
];
export const products: Product[] = [
 { id: 'housse-cotelee', category: 'housses', availableColors: ['blanc', 'rose', 'vert'], name: 'La housse côtelée', subtitle: 'La petite touche qui change le canapé.', description: 'Une housse à choisir à la pièce, dans la couleur qui vous plaît. Ajoutez ensuite les autres éléments de votre choix. Le coussin intérieur n’est pas inclus. Le vert clair de cette housse diffère du vert olive du plaid.', options: [{ id: 'unite-45-45', label: '1 housse seule · 45 × 45 cm', price: 1290 }], details: ['Vente proposée à l’unité : une housse, sans coussin intérieur.', 'Format indiqué dans la sélection initiale : 45 × 45 cm.', 'Conditionnement fournisseur, composition et entretien à confirmer avant ouverture.'], images: { blanc: '/img/blanc.jpg', rose: '/img/rose.jpg', vert: '/img/vert.jpg' }, gallery: [], colorGalleries:{blanc:['/img/blanc.jpg','/img/canape-blanc.jpg','/img/matiere.jpg'],rose:['/img/rose.jpg'],vert:['/img/vert.jpg']}, sharedGallery:['/img/dimensions.jpg'], priceStatus:'proposed' },
 { id: 'plaid-cotele', category: 'plaids', availableColors: ['blanc', 'rose', 'vert'], name: 'Le plaid côtelé', subtitle: 'Votre prochain rendez-vous avec le canapé.', description: 'À poser au bout du lit ou sur l’accoudoir du canapé. Le plaid se décline en blanc, rose ou vert olive, avec deux formats à choisir. Son vert est différent de celui des housses sur les photos.', options: [{ id: '120-200', label: '120 × 200 cm', price: 4990 }, { id: '150-200', label: '150 × 200 cm', price: 5990 }], details: ['Deux formats proposés dans la sélection initiale.', 'Effet fausse fourrure à côtes.', 'Composition exacte et consignes d’entretien à confirmer avant ouverture.'], images: { blanc: '/img/plaid-blanc.jpg', rose: '/img/plaid-rose.jpg', vert: '/img/plaid-vert.jpg' }, gallery: [], colorGalleries:{blanc:['/img/plaid-blanc.jpg','/img/plaid-matiere.jpg','/img/plaid-lit.jpg','/img/plaid-detente.jpg'],rose:['/img/plaid-rose.jpg'],vert:['/img/plaid-vert.jpg']}, priceStatus:'proposed' },
 ...importedProducts,
];
export const categories: {id:Category;label:string}[] = [{id:'housses-couette',label:'Housses de couette'},{id:'draps',label:'Draps'},{id:'taies',label:'Taies d’oreiller'},{id:'oreillers',label:'Oreillers'},{id:'couettes',label:'Couettes'},{id:'couvre-lits',label:'Couvre-lits'},{id:'housses',label:'Housses de coussin'},{id:'coussins',label:'Coussins'},{id:'plaids',label:'Plaids'},{id:'ensembles',label:'Ensembles'},{id:'serviettes',label:'Linge de bain'}];
export const categoryLabel = (category:Category) => categories.find(c=>c.id===category)?.label??category;
export const roomFor = (product:Product) => ['housses','coussins','plaids','ensembles'].includes(product.category)?'salon':product.category==='serviettes'?'bain':'chambre';
export const money = (cents: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
export const colorName = (id: Color, product?: Product) => product?.colorOptions?.find(c=>c.id===id)?.name ?? (id === 'vert' ? (product?.category === 'housses' ? 'Vert clair' : product?.category === 'plaids' ? 'Vert olive' : 'Vert') : colors.find(c => c.id === id)?.name ?? 'Coloris à confirmer');
export const productColors = (product: Product):{id:Color;name:string;hex?:string}[] => product.colorOptions ?? colors.filter(c => product.availableColors.includes(c.id)).map(c => ({...c, name: colorName(c.id, product), hex: c.id === 'vert' ? (product.category === 'housses' ? '#b5cbb5' : '#83985b') : c.hex}));
const foldColor=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function neutralRank(name:string){
 const text=foldColor(name);
 if(/indigo|navy|marine|multicolor|moutarde|mustard|bordeaux|ruby|rouge|red|noir et|black and/.test(text))return 3;
 if(/beige|ecru|cream|creme|ivory|ivoire|sand|sable|milk tea|oatmeal|lin naturel/.test(text))return 0;
 if(/white|blanc|champagne|stone|pierre|naturel/.test(text))return 1;
 if(/camel|caramel|taupe|coffee|cafe|brown|marron/.test(text))return 2;
 return 3;
}
export function firstColor(product:Product){
 const choices=productColors(product);
 return [...choices].sort((a,b)=>{
  const hasA=Boolean(product.colorGalleries?.[a.id]?.length||product.images[a.id]);
  const hasB=Boolean(product.colorGalleries?.[b.id]?.length||product.images[b.id]);
  return Number(hasB)-Number(hasA)||neutralRank(a.name)-neutralRank(b.name);
 })[0]?.id??'';
}
export function galleryFor(product:Product,color:Color){
 const exact=product.colorGalleries?.[color]??(product.images[color]?[product.images[color]]:[]);
 return [...new Set(exact.filter(Boolean))];
}
export const productImage = (product:Product,color=firstColor(product)):string|undefined => galleryFor(product,color)[0]??(!color?product.coverImage:undefined);
export const collectionImage = (product:Product,color=firstColor(product)) => productImage(product,color)??product.coverImage;
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
