from pathlib import Path
root=Path('work/sites/moon-and-pillow')
p=root/'app/page.tsx'
s=p.read_text(encoding='utf8')
s=s.replace('const catalog = products.filter(product=>Boolean(productImage(product)));', '''const featuredIds=['plaid-cotele','aw-cicc-17','alibaba-1601080870169','housse-cotelee','aw-bohot-06','aw-cicc-18','alibaba-1601710942064','aw-bohot-01','ensemble-cocon','aw-cicc-16','alibaba-1601451040881','aw-bohot-04'];
const catalog = products.filter(product=>Boolean(productImage(product))).sort((a,b)=>(featuredIds.includes(a.id)?featuredIds.indexOf(a.id):100)-(featuredIds.includes(b.id)?featuredIds.indexOf(b.id):100));
const preparationCount=products.filter(product=>product.draftOnly).length;''')
s=s.replace("const [room,setRoom]=", "const [shownCount,setShownCount]=useState(12);\n const [room,setRoom]=")
s=s.replace("const selectedOption=view?.product.options.find(o=>o.id===optionId);", "useEffect(()=>setShownCount(12),[room,filter,search,sort]);\n const selectedOption=view?.product.options.find(o=>o.id===optionId);")
s=s.replace('visible.map(product=>','visible.slice(0,shownCount).map(product=>')
s=s.replace('{visible.length===0&&', '''{shownCount<visible.length&&<div style={{textAlign:'center',marginTop:48}}><button className="button secondary" onClick={()=>setShownCount(count=>count+12)}>Découvrir {Math.min(12,visible.length-shownCount)} modèles de plus <Plus size={16}/></button></div>}
 {visible.length===0&&''')
s=s.replace('Voir les 25 références du catalogue de préparation','Voir les {preparationCount} références du catalogue de préparation')
s=s.replace('view.product.photoNote&&<p','view.product.photoNote&&productImage(view.product,view.color)&&<p')
p.write_text(s,encoding='utf8')
t=root/'tests/commerce.test.mjs'
s=t.read_text(encoding='utf8').replace('all 25 supplier drafts','all 48 supplier drafts').replace('assert.equal(drafts.length,25);','assert.equal(drafts.length,48);').replace('assert.equal(new Set(drafts.map(p=>p.id)).size,25);','assert.equal(new Set(drafts.map(p=>p.id)).size,48);')
t.write_text(s,encoding='utf8')
print('Expanded collection: pagination and draft count updated.')
