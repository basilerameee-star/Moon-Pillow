import type { Product } from './catalog';

export type MeasuredSize = { width: number; length: number; depth?: number };
export type SizeGuide = {
  kind: 'bed' | 'pillow' | 'linen';
  label: string;
  measured?: MeasuredSize;
  instruction: string;
  note: string;
};

/** Only centimetres explicitly present in the selected supplier label are read.
 * Multiple measurements (for example, a duvet with two pillowcases) are kept as
 * the original label instead of guessing which measurements describe the item.
 */
export function measuredSize(label: string): MeasuredSize | undefined {
  const pairs = [...label.matchAll(/\b(\d{2,3}(?:[.,]\d+)?)\s*[x×*]\s*(\d{2,3}(?:[.,]\d+)?)(?:\s*[+x×*]\s*(\d{1,2}(?:[.,]\d+)?))?\s*cm\b/gi)];
  if (pairs.length !== 1) return undefined;
  const [, width, length, depth] = pairs[0];
  return { width: Number(width.replace(',', '.')), length: Number(length.replace(',', '.')), ...(depth ? { depth: Number(depth.replace(',', '.')) } : {}) };
}

export function sizeGuideFor(product: Product, optionLabel?: string): SizeGuide {
  const label = optionLabel ?? product.options[0]?.label ?? '';
  const measured = measuredSize(label);
  const fitted = product.category === 'draps' && /drap[\s-]*housse/i.test(product.name);
  const kind = ['taies', 'oreillers', 'housses', 'coussins'].includes(product.category) ? 'pillow' : ['housses-couette', 'couettes', 'draps', 'couvre-lits'].includes(product.category) ? 'bed' : 'linen';
  const instruction = fitted
    ? 'Mesurez la largeur, la longueur et l’épaisseur de votre matelas. Le bonnet du drap-housse doit correspondre à cette épaisseur.'
    : product.category === 'housses-couette'
    ? 'Mesurez votre couette, puis choisissez une housse aux mêmes dimensions. La taille du matelas ne suffit pas à choisir une housse.'
    : ['taies', 'housses'].includes(product.category)
    ? 'Mesurez le garnissage de votre oreiller ou de votre coussin. Choisissez une housse de même format, carrée ou rectangulaire.'
    : product.category === 'oreillers' || product.category === 'coussins'
    ? 'Vérifiez les dimensions du garnissage et celles de la taie ou de la housse que vous souhaitez utiliser.'
    : product.category === 'couettes'
    ? 'Comparez le format proposé à votre housse de couette et à la retombée que vous souhaitez de chaque côté du lit.'
    : product.category === 'couvre-lits' || product.category === 'draps'
    ? 'Mesurez votre lit et prévoyez la retombée souhaitée. Comparez ces mesures au format exact proposé.'
    : 'Comparez le format proposé à l’espace que vous souhaitez couvrir. Les dimensions sont indiquées en centimètres lorsqu’elles sont documentées.';
  return {
    kind,
    label,
    measured,
    instruction,
    note: product.draftOnly
      ? 'Formats relevés chez le fournisseur. Leur disponibilité dans le coloris choisi reste à confirmer avant ouverture.'
      : 'Schéma indicatif : seul le format sélectionné fait foi. Vérifiez le contenu de l’article avant de composer votre panier.',
  };
}

export function careStatements(product: Product): string[] {
  return product.details.filter(detail => /^Entretien indiqué par le fabricant/.test(detail));
}

export function materialStatements(product: Product): string[] {
  return product.details.filter(detail => /coton|polyester|microfibre|viscose|\blin\b|laine|soie|velours|fourrure|grammage|g\/m|composition/i.test(detail) && !/certifi|oeko.?tex|gots|label/i.test(detail));
}
