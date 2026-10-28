from pathlib import Path
p=Path('work/sites/moon-and-pillow/app/page.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('presentationGalleryFor, modelSceneGalleryFor, neutralRank','presentationGalleryFor, modelSceneGalleryFor, presentationColor, neutralRank')
s=s.replace("const presentationColor=(product:Product)=>lifestyleGalleryFor(product,firstColor(product)).length?firstColor(product):'';",'')
s=s.replace("querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select')", "querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]:not([tabindex=\"-1\"])')")
s=s.replace("const initialAllowedColor=initialProduct&&initialProduct.availableColors.includes(initialColor)?initialColor:initialProduct?firstColor(initialProduct):'';", "const initialAllowedColor=initialProduct?(initialColor===''&&modelSceneGalleryFor(initialProduct).length?'':initialProduct.availableColors.includes(initialColor)?initialColor:presentationColor(initialProduct)):'';")
s=s.replace("setNotice('Ajouté à votre panier de préparation');setCheckoutError('');", "setNotice('Ajouté à votre panier de préparation');setCheckoutError('');setView(null);setCartOpen(true);")
p.write_text(s,encoding='utf-8')
