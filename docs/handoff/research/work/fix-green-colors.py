from pathlib import Path
base = Path(r'C:\Users\Lenovo\Documents\Codex\2026-10-23\https-www-youtube-com-watch-v\work\sites\moon-and-pillow')
def edit(path, changes):
    file = base / path
    text = file.read_text(encoding='utf-8')
    for old, new in changes:
        if old not in text:
            raise ValueError(f'Missing expected text in {path}: {old[:80]}')
        text = text.replace(old, new)
    file.write_text(text, encoding='utf-8')

edit('lib/catalog.ts', [
 ("category: Category; name:", "category: Category; availableColors: Color[]; name:"),
 ("category: 'housses',", "category: 'housses', availableColors: ['blanc', 'rose', 'vert'],"),
 ("category: 'plaids',", "category: 'plaids', availableColors: ['blanc', 'rose', 'vert'],"),
 ("category: 'ensembles',", "category: 'ensembles', availableColors: ['blanc', 'rose'],"),
 ("name: 'Vert sauge'", "name: 'Vert'"),
 ('Choisissez votre lot de housses et retrouvez les mêmes couleurs dans la collection de plaids.', 'Choisissez votre lot de housses. Sur les photos, le vert clair des housses diffère du vert olive du plaid.'),
 ('Le plaid de la collection se décline dans les mêmes trois teintes que les housses, avec deux formats à choisir.', 'Le plaid se décline en blanc, rose ou vert olive, avec deux formats à choisir. Son vert est différent de celui des housses sur les photos.'),
 ('Tout s’accorde. Vous n’avez plus qu’à vous poser.', 'Un plaid et deux housses pour votre coin douillet.'),
 ('Un plaid et deux housses dans la même couleur pour composer un coin douillet. Un ensemble pensé pour le lit, le canapé et les moments tranquilles.', 'Un plaid et deux housses pour composer un coin douillet. Les nuances exactes restent à confirmer avant l’ouverture. L’ensemble vert est retiré de la sélection en attendant la confirmation du fournisseur.'),
 ("export const colorName = (id: Color) => colors.find(c => c.id === id)!.name;", "export const colorName = (id: Color, product?: Product) => id === 'vert' ? (product?.category === 'housses' ? 'Vert clair' : product?.category === 'plaids' ? 'Vert olive' : 'Vert') : colors.find(c => c.id === id)!.name;\nexport const productColors = (product: Product) => colors.filter(c => product.availableColors.includes(c.id)).map(c => ({...c, name: colorName(c.id, product), hex: c.id === 'vert' ? (product.category === 'housses' ? '#b5cbb5' : '#83985b') : c.hex}));"),
 ("!colors.some(c => c.id === item.color)", "!product.availableColors.includes(item.color)"),
])
edit('app/page.tsx', [
 ('colors, colorName,', 'colors, productColors, colorName,'),
 ('colors.flatMap(color => products.map(product => ({ product, color: color.id })))', 'products.flatMap(product => productColors(product).map(color => ({ product, color: color.id })))'),
 ('const initialProduct=products.find(p=>p.id===initialProductId);', "const initialProduct=products.find(p=>p.id===initialProductId);\n const initialAllowedColor=initialProduct&&initialProduct.availableColors.includes(initialColor)?initialColor:'blanc';"),
 ('{product:initialProduct,color:initialColor}', '{product:initialProduct,color:initialAllowedColor}'),
 ('colorName(color)', 'colorName(color,product)'),
 ('colorName(view.color)', 'colorName(view.color,view.product)'),
 ('colorName(item.color)', 'colorName(item.color,product)'),
 ('function openProduct(product:Product,color:Color){setView', 'function openProduct(product:Product,color:Color){if(!product.availableColors.includes(color))return;setView'),
 ('Trois teintes, une même envie de douceur.', 'Des nuances à choisir pour votre intérieur.'),
 ('Blanc nuage, rose poudré, vert sauge.', 'Blanc nuage, rose poudré et deux nuances de vert.'),
 ('À explorer : blanc nuage, rose poudré, vert sauge.', 'À explorer : blanc, rose, vert clair, vert olive.'),
 ('{colors.map(c=>', '{productColors(product).map(c=>'),
 ('{colors.map(color=>', '{productColors(view.product).map(color=>'),
 ('LE DUO ASSORTI', 'LE DUO COCON'),
 ('Un plaid, deux housses, une même teinte.', 'Un plaid, deux housses, votre coin douillet.'),
 ('quelques pièces assorties pour rendre', 'quelques pièces à choisir pour rendre'),
 ('<small>Coussins intérieurs non inclus.</small>', '<small>Coussins intérieurs non inclus. Nuances à confirmer avant ouverture.</small>'),
 ('<p className="catalog-note">', '<p className="catalog-note">Les verts des housses et du plaid sont différents sur les photos. L’ensemble vert est retiré de la sélection en attendant la confirmation du fournisseur.</p><p className="catalog-note">'),
])
edit('app/produits/[id]/page.tsx', [
 ('products, colors,', 'products, productColors,'),
 ('colors.some(c=>c.id===search.couleur)', 'productColors(product).some(c=>c.id===search.couleur)'),
])
edit('app/layout.tsx', [('Housses de coussin, plaids et ensembles assortis en blanc nuage, rose poudré et vert sauge.', 'Housses de coussin, plaids et ensembles Cocon. Découvrez les couleurs et les formats de notre sélection.')])
edit('lib/commerce.ts', [
 ('import { colors, products,', 'import { colorName, products,'),
 ('const color = colors.find(candidate => candidate.id === item.color)!;', 'const color = { name: colorName(item.color, product) };'),
])
print('Colour names and available variants corrected; original images preserved.')
