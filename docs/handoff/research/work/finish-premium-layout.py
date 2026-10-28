from pathlib import Path
root=Path('work/sites/moon-and-pillow')
p=root/'app/page.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace('<div className="cocon-image"><img src="/img/canape-blanc.jpg" alt="Un coin salon avec des housses blanches côtelées" loading="lazy"/></div>', '<div className="cocon-image"><img src="/img/canape-blanc.jpg" alt="Deux housses blanches côtelées sur un canapé beige, à choisir à l’unité" loading="lazy"/><button className="look-hotspot" aria-label="Découvrir la housse côtelée blanche, 1 housse seule, prix proposé 12,90 euros" onClick={()=>openProduct(products.find(p=>p.id===\'housse-cotelee\')!,\'blanc\')}><Plus size={13}/><span>La housse côtelée<strong>{priceLabel(products.find(p=>p.id===\'housse-cotelee\')!)}</strong><small>1 housse seule · prix proposé</small></span></button></div>')
s=s.replace('<a href="/informations/retours">Livraison & retours</a><a href="mailto:contact@raime.fr">Nous contacter</a>', '<a href="/informations/retours">Livraison & retours</a><a href="/guide-du-linge">Le guide du linge</a><a href="/notre-univers">Notre univers</a><a href="mailto:contact@raime.fr">Nous contacter</a>')
p.write_text(s,encoding='utf-8')
p=root/'app/catalogue-preparation/page.tsx'
s=p.read_text(encoding='utf-8').replace('categoryLabel, products, type Category','categoryLabel, products, collectionImage, type Category')
s=s.replace('products.filter(p=>p.draftOnly&&!p.requiresSupplierBundle&&p.coverImage).length','products.filter(p=>p.draftOnly&&!p.requiresSupplierBundle&&collectionImage(p)).length')
s=s.replace('modèles illustrés proposés séparément','modèles avec une scène sélectionnée dans la collection')
s=s.replace('Les modèles illustrés dans la collection sont sélectionnés pour la fidélité de leur photo de référence.', 'La collection privilégie les mises en situation contrôlées et les macros sans détourage. Les autres modèles restent accessibles dans cette liste de préparation.')
p.write_text(s,encoding='utf-8')
p=root/'app/informations/[page]/page.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace('Les photographies sont reprises du site fourni par le porteur du projet.', 'Les photographies proviennent de la sélection initiale fournie par le porteur du projet et des galeries publiques des fournisseurs recensés.')
s=s.replace("{heading:'Les ensembles',text:'La sélection initiale comprend des ensembles composés d’un plaid et de deux housses. Le fournisseur doit confirmer la possibilité d’une livraison groupée ou de plusieurs colis.'}","{heading:'Le contenu de chaque article',text:'Les housses et les plaids de la sélection initiale sont proposés séparément. Seul le contenu indiqué dans le format sélectionné est inclus. Les conditions d’expédition de chaque référence restent à confirmer.'}")
p.write_text(s,encoding='utf-8')
