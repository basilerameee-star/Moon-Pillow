export type Color = 'blanc' | 'rose' | 'vert';
export type Category = 'housses' | 'plaids' | 'ensembles';
export type Product = { id: string; category: Category; name: string; subtitle: string; description: string; options: { id: string; label: string; price: number }[]; details: string[]; images: Record<Color, string>; gallery: string[] };
export const colors: { id: Color; name: string; hex: string }[] = [
 { id: 'blanc', name: 'Blanc nuage', hex: '#eae4d9' }, { id: 'rose', name: 'Rose poudré', hex: '#d5aaa6' }, { id: 'vert', name: 'Vert sauge', hex: '#9ea895' },
];
export const products: Product[] = [
 { id: 'housse-cotelee', category: 'housses', name: 'Les housses côtelées', subtitle: 'La petite touche qui change le canapé.', description: 'Une texture à côtes et trois teintes à assortir à votre intérieur. Choisissez votre lot de housses et retrouvez les mêmes couleurs dans la collection de plaids.', options: [{ id: 'lot-2', label: 'Lot de 2 · 45 × 45 cm', price: 2490 }, { id: 'lot-4', label: 'Lot de 4 · 45 × 45 cm', price: 3990 }], details: ['Housses seules : coussins intérieurs non inclus.', 'Format indiqué dans la sélection initiale : 45 × 45 cm.', 'Composition exacte et consignes d’entretien à confirmer avant ouverture.'], images: { blanc: '/img/blanc.jpg', rose: '/img/rose.jpg', vert: '/img/vert.jpg' }, gallery: ['/img/matiere.jpg', '/img/dimensions.jpg'] },
 { id: 'plaid-cotele', category: 'plaids', name: 'Le plaid côtelé', subtitle: 'Votre prochain rendez-vous avec le canapé.', description: 'À poser au bout du lit ou sur l’accoudoir du canapé. Le plaid de la collection se décline dans les mêmes trois teintes que les housses, avec deux formats à choisir.', options: [{ id: '120-200', label: '120 × 200 cm', price: 4990 }, { id: '150-200', label: '150 × 200 cm', price: 5990 }], details: ['Deux formats proposés dans la sélection initiale.', 'Effet fausse fourrure à côtes.', 'Composition exacte et consignes d’entretien à confirmer avant ouverture.'], images: { blanc: '/img/plaid-blanc.jpg', rose: '/img/plaid-rose.jpg', vert: '/img/plaid-vert.jpg' }, gallery: ['/img/plaid-matiere.jpg', '/img/plaid-lit.jpg'] },
 { id: 'ensemble-cocon', category: 'ensembles', name: 'L’ensemble Cocon', subtitle: 'Tout s’accorde. Vous n’avez plus qu’à vous poser.', description: 'Un plaid et deux housses dans la même couleur pour composer un coin douillet. Un ensemble pensé pour le lit, le canapé et les moments tranquilles.', options: [{ id: 'cocon', label: '1 plaid 150 × 200 + 2 housses', price: 7990 }], details: ['Un plaid de 150 × 200 cm et deux housses de 45 × 45 cm.', 'Coussins intérieurs non inclus.', 'Les pièces pourront être expédiées séparément : modalités à confirmer.'], images: { blanc: '/img/plaid-lit.jpg', rose: '/img/plaid-rose.jpg', vert: '/img/plaid-vert.jpg' }, gallery: ['/img/canape-blanc.jpg', '/img/matiere.jpg'] },
];
export const money = (cents: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
export const colorName = (id: Color) => colors.find(c => c.id === id)!.name;
export type CartItem = { productId: string; color: Color; optionId: string; quantity: number };
export function resolveItem(item: CartItem) {
 const product = products.find(p => p.id === item.productId); const option = product?.options.find(o => o.id === item.optionId);
 if (!product || !option || !colors.some(c => c.id === item.color)) throw new Error('Article inconnu');
 return { product, option };
}
