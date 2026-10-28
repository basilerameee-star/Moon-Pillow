/** Frais de port au prix coûtant (décision du fondateur, 28/10/2026) : le client paie ce que coûte
 * l'envoi chez chaque fournisseur concerné, sans marge, et rien dès {FREE_SHIPPING_FROM} de sous-total.
 * Un fournisseur dont la grille n'est pas vérifiée rend le port inconnu : le paiement reste alors fermé. */
export const FREE_SHIPPING_FROM = 10000;

export type Supplier = 'aw';
type ShippingItem = { productId: string; quantity: number };

/** Poids relevés sur les fiches AW Dropship Europe, compte connecté, le 28/10/2026. */
export const productShipping: Record<string, { supplier: Supplier; grams: number }> = {
  'aw-bohot-01': { supplier: 'aw', grams: 660 },
  'aw-bohot-02': { supplier: 'aw', grams: 660 },
  'aw-bohot-03': { supplier: 'aw', grams: 660 },
  'aw-bohot-04': { supplier: 'aw', grams: 660 },
  'aw-bohot-06': { supplier: 'aw', grams: 660 },
  'aw-bwcb-01': { supplier: 'aw', grams: 680 },
  'aw-bwcb-03': { supplier: 'aw', grams: 680 },
  'aw-bwcb-07': { supplier: 'aw', grams: 680 },
  'aw-cicc-01': { supplier: 'aw', grams: 110 },
  'aw-cicc-02': { supplier: 'aw', grams: 110 },
  'aw-cicc-03': { supplier: 'aw', grams: 110 },
  'aw-cicc-04': { supplier: 'aw', grams: 110 },
  'aw-cicc-05': { supplier: 'aw', grams: 110 },
  'aw-cicc-06': { supplier: 'aw', grams: 110 },
  'aw-cicc-07': { supplier: 'aw', grams: 110 },
  'aw-cicc-08': { supplier: 'aw', grams: 110 },
  'aw-cicc-09': { supplier: 'aw', grams: 110 },
  'aw-cicc-10': { supplier: 'aw', grams: 110 },
  'aw-cicc-11': { supplier: 'aw', grams: 200 },
  'aw-cicc-12': { supplier: 'aw', grams: 200 },
  'aw-cicc-13': { supplier: 'aw', grams: 200 },
  'aw-cicc-14': { supplier: 'aw', grams: 300 },
  'aw-cicc-15': { supplier: 'aw', grams: 300 },
  'aw-cicc-16': { supplier: 'aw', grams: 300 },
  'aw-cicc-17': { supplier: 'aw', grams: 300 },
  'aw-cicc-18': { supplier: 'aw', grams: 200 },
  'aw-cicc-19': { supplier: 'aw', grams: 300 },
  'aw-cicc-20': { supplier: 'aw', grams: 200 },
  'aw-cmc-hamsa': { supplier: 'aw', grams: 275 },
  'aw-cmc-lotus': { supplier: 'aw', grams: 285 },
  'aw-cmc-traditional': { supplier: 'aw', grams: 250 },
  'aw-hit-01': { supplier: 'aw', grams: 733 },
  'aw-hit-02': { supplier: 'aw', grams: 733 },
  'aw-hit-03': { supplier: 'aw', grams: 733 },
  'aw-hit-04': { supplier: 'aw', grams: 733 },
  'aw-hit-05': { supplier: 'aw', grams: 733 },
  'aw-hit-06': { supplier: 'aw', grams: 733 },
  'aw-inner': { supplier: 'aw', grams: 390 },
  'aw-kcush-02ds': { supplier: 'aw', grams: 225 },
  'aw-linc-palm': { supplier: 'aw', grams: 170 },
  'aw-linc-plain': { supplier: 'aw', grams: 202 },
  'aw-vcush': { supplier: 'aw', grams: 300 },
};

/** Grille AW France (zone 7), en centimes TTC : tarif HT × 1,2 (TVA facturée à une micro-entreprise sans numéro de TVA). */
const AW_TIERS: [number, number][] = [[250, 900], [2000, 936], [5000, 1548], [30000, 1584]];

const supplierCost: Record<Supplier, (grams: number) => number | null> = {
  aw: grams => AW_TIERS.find(([max]) => grams <= max)?.[1] ?? null,
};

/** Coût d'envoi réel du panier, en centimes : un colis par fournisseur, poids cumulés. */
export function shippingCostCents(items: ShippingItem[]): number | null {
  const grams = new Map<Supplier, number>();
  for (const item of items) {
    const info = productShipping[item.productId];
    if (!info) return null;
    grams.set(info.supplier, (grams.get(info.supplier) ?? 0) + info.grams * item.quantity);
  }
  let total = 0;
  for (const [supplier, weight] of grams) {
    const cost = supplierCost[supplier](weight);
    if (cost === null) return null;
    total += cost;
  }
  return total;
}

/** Port facturé au client : offert dès le seuil, sinon le prix coûtant ; null tant qu'il n'est pas vérifiable. */
export function shippingForCart(subtotalCents: number, items: ShippingItem[]): number | null {
  return subtotalCents >= FREE_SHIPPING_FROM ? 0 : shippingCostCents(items);
}
