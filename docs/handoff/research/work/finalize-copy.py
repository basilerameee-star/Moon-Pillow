from pathlib import Path
p=Path('work/sites/moon-and-pillow/app/page.tsx')
s=p.read_text(encoding='utf8')
for key in ['housses','plaids','ensembles']:
 s=s.replace("onClick={()=>setFilter('"+key+"')}","onClick={()=>chooseCategory('"+key+"')}")
s=s.replace("setSearchOpen(false);document.getElementById('collection')", "setSearchOpen(false);setRoom('tout');setFilter('tout');document.getElementById('collection')")
s=s.replace('ChevronDown, Heart, Menu','ChevronDown, Menu').replace('ShoppingBag, Sparkles, X','ShoppingBag, X')
s=s.replace('<h3>La collection</h3><a', '<h3>La collection</h3><a href="#collection" onClick={()=>chooseCategory(\'housses-couette\')}>Housses de couette</a><a href="#collection" onClick={()=>chooseCategory(\'taies\')}>Taies d’oreiller</a><a')
s=s.replace('Coussins intérieurs non inclus. Nuances à confirmer avant ouverture.','Prix indicatif. Coussins intérieurs non inclus. Nuances à confirmer avant ouverture.')
p.write_text(s,encoding='utf8')
print('Footer categories and global search updated.')
