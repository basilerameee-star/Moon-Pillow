'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, useCallback, type ReactNode, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Minus, Moon, Plus, Search, ShoppingBag, Ruler, Layers, X } from 'lucide-react';
import { FREE_SHIPPING_FROM, shippingForCart } from '@/lib/shipping';
import { categories, categoryLabel, roomFor, roomForCategory, firstColor, productImage, collectionImage, lifestyleGalleryFor, macroGalleryFor, presentationGalleryFor, modelSceneGalleryFor, presentationColor, neutralRank, startingPrice, priceLabel, productColors, photographedProductColors, colorSwatchBackground, colorName, money, products, resolvePreviewItem as resolveItem, type CartItem, type Category, type Color, type Product } from '@/lib/catalog';
import { ProductGuides } from '@/components/ProductGuides';
import { faq } from '@/lib/faq';
import { JsonLd } from '@/components/JsonLd';
import { faqLd } from '@/lib/seo';
import { SelectMenu, StickyProductAction, PinterestButton, ProductHelp } from '@/components/BoutiqueControls';
type View = { product: Product; color: Color };
const featuredIds=['plaid-cotele','aw-cicc-17','alibaba-1601080870169','housse-cotelee','aw-bohot-06','aw-cicc-18','alibaba-1601710942064','aw-bohot-01','aw-cicc-16','alibaba-1601451040881','aw-bohot-04'];
const catalog = products.filter(product=>!product.requiresSupplierBundle&&Boolean(collectionImage(product))).sort((a,b)=>{
 const rank=(product:Product)=>lifestyleGalleryFor(product,firstColor(product)).length?neutralRank(colorName(firstColor(product),product)):4;
 return rank(a)-rank(b)||Number(b.availableColors.length>=2)-Number(a.availableColors.length>=2)||(featuredIds.includes(a.id)?featuredIds.indexOf(a.id):100)-(featuredIds.includes(b.id)?featuredIds.indexOf(b.id):100);
});
const preparationCount=products.filter(product=>product.draftOnly).length;

const fold = (value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
const prefersReducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollToCollection=()=>document.getElementById('collection')?.scrollIntoView({behavior:prefersReducedMotion()?'auto':'smooth'});
// After a filter change, bring the top of the results back into view if the visitor had scrolled past it.
const revealResults=()=>requestAnimationFrame(()=>{const layout=document.querySelector<HTMLElement>('.collection-layout');if(layout&&layout.getBoundingClientRect().top<0)layout.scrollIntoView({behavior:prefersReducedMotion()?'auto':'smooth',block:'start'});});
const focusCollectionTitle=()=>document.getElementById('collection-title')?.focus({preventScroll:true});
const MENU_FALLBACK_PHOTO='/img/canape-blanc.jpg';
const failedImageKey=(product:Product,color:Color,src:string)=>`${product.id}::${color}::${src}`;
const lifestyleColorFor=(product:Product,name:string)=>photographedProductColors(product).find(color=>fold(color.name)===fold(name)&&lifestyleGalleryFor(product,color.id).length>0);
const featuredColorStories=['Sable','Terracotta','Romarin','Camel'].map(name=>{
 const items=catalog.flatMap(product=>{const color=lifestyleColorFor(product,name);return color?[{product,color,image:lifestyleGalleryFor(product,color.id)[0]}]:[];});
 const representative=items.find(item=>colorSwatchBackground(item.color));
 return {name,swatch:representative?colorSwatchBackground(representative.color):undefined,items};
}).filter(story=>story.items.length>0);
type Room='chambre'|'salon'|'bain';
type RoomChoice='tout'|Room;
type MenuPhoto='defaut'|Room|'univers';
type Panel='menu'|'search'|'cart'|'filters';
const roomLabels:Record<Room,string>={chambre:'La chambre',salon:'Le salon',bain:'Le bain'};
const menuRooms=(['chambre','salon','bain'] as const).filter(room=>catalog.some(product=>roomFor(product)===room));
const categoriesFor=(room:Room)=>categories.filter(category=>catalog.some(product=>product.category===category.id&&roomFor(product)===room));
const countFor=(room:Room)=>catalog.filter(product=>roomFor(product)===room).length;
const countIn=(room:Room,category:Category)=>catalog.filter(product=>roomFor(product)===room&&product.category===category).length;
const models=(count:number)=>`${count} modèle${count>1?'s':''}`;
const bathProduct=catalog.find(product=>roomFor(product)==='bain');
const menuPhotos:Record<MenuPhoto,string|undefined>={defaut:'/img/hero-canape.webp',chambre:'/img/plaid-lit.jpg',salon:'/img/hero-canape.webp',univers:'/img/canape-blanc.jpg',bain:bathProduct?collectionImage(bathProduct):undefined};
const menuCaption=(key:MenuPhoto)=>key==='univers'?'Notre univers':key==='defaut'?`Toute la collection · ${models(catalog.length)}`:`${roomLabels[key]} · ${models(countFor(key))}`;
const hasProposedPrice=catalog.some(product=>product.priceStatus!=='approved');
const complementaryCategory:Partial<Record<Category,Category>>={
 'housses-couette':'taies','taies':'housses-couette','draps':'taies','oreillers':'taies','couettes':'housses-couette','couvre-lits':'taies',
 'housses':'coussins','coussins':'housses','plaids':'housses','serviettes':'serviettes',
};
function Sheet({ title, onClose, children, wide = false, plainTitle = false, side = 'right', className = '', id, restoreFocus }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; plainTitle?: boolean; side?: 'left'|'right'; className?: string; id?: string; restoreFocus?: () => boolean }) {
 const box = useRef<HTMLDivElement>(null), closeTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
 const [closing, setClosing] = useState(false);
 const restoreRef = useRef(restoreFocus);
 useEffect(() => { restoreRef.current = restoreFocus; });
 const close = useCallback(() => { if(closeTimer.current) return; if(prefersReducedMotion()){ onClose(); return; } setClosing(true); closeTimer.current = setTimeout(onClose, 280); }, [onClose]);
 useEffect(() => {
  const previous = document.activeElement as HTMLElement, overflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden'; (box.current?.querySelector<HTMLElement>('[data-autofocus]')??box.current)?.focus();
  const listener = (e: KeyboardEvent) => { if(e.key==='Escape') close(); if(e.key==='Tab'&&box.current){const elements=[...box.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null); const first=elements[0],last=elements.at(-1); if(!box.current.contains(document.activeElement)){e.preventDefault();(e.shiftKey?last:first)?.focus();}else if(e.shiftKey&&(document.activeElement===first||document.activeElement===box.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===box.current)){e.preventDefault();first?.focus();}} };
  document.addEventListener('keydown',listener); return()=>{if(closeTimer.current)clearTimeout(closeTimer.current);document.body.style.overflow=overflow;document.removeEventListener('keydown',listener);if(restoreRef.current?.()??true)previous?.focus();};
 }, [close]);
 return <div className={`modal-layer ${side==='left'?'from-left':''} ${closing?'closing':''}`} onClick={close}><div id={id} className={`sheet ${wide?'wide':''} ${className}`} ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><header className="sheet-header">{plainTitle?<p className="sheet-title">{title}</p>:<h2>{title}</h2>}<button className="icon-button" aria-label="Fermer" onClick={close}><X/></button></header>{children}</div></div>;
}
function SiteHeader({menuOpen,searchOpen,cartOpen,count,onMenu,onSearch,onCart}:{menuOpen:boolean;searchOpen:boolean;cartOpen:boolean;count:number;onMenu:()=>void;onSearch:()=>void;onCart:()=>void}){
 return <header className="site-header"><div className="header-inner">
  <button type="button" className="menu-trigger" aria-haspopup="dialog" aria-controls={menuOpen?'site-menu':undefined} aria-expanded={menuOpen} onClick={onMenu}><span className="menu-lines" aria-hidden="true"><i/><i/></span><span className="menu-trigger-label">Menu</span></button>
  <Link href="/" className="wordmark" aria-label="Moon and Pillow, accueil">Moon <i>&amp;</i> Pillow<span>LES PETITS BONHEURS DE LA MAISON</span></Link>
  <div className="header-actions">
   <button type="button" className="icon-button" aria-label="Rechercher dans la collection" aria-haspopup="dialog" aria-expanded={searchOpen} onClick={onSearch}><Search size={18} strokeWidth={1.25} aria-hidden/></button>
   <button type="button" className="icon-button bag-button" aria-haspopup="dialog" aria-expanded={cartOpen} aria-label={`Ouvrir le panier, ${count} article${count>1?'s':''}`} onClick={onCart}><ShoppingBag size={18} strokeWidth={1.25} aria-hidden/>{count>0&&<span className="bag-count">{count}</span>}</button>
  </div>
 </div></header>;
}
function MenuPanel({room,filter,photo,onPhoto,pickRoom,pickCategory,closeMenu,failedImages}:{room:RoomChoice;filter:Category|'tout';photo:MenuPhoto;onPhoto:(photo:MenuPhoto)=>void;pickRoom:(room:RoomChoice)=>void;pickCategory:(category:Category)=>void;closeMenu:()=>void;failedImages:string[]}){
 const usable=(key:MenuPhoto)=>{const src=menuPhotos[key];return Boolean(src&&!failedImages.some(failed=>failed.endsWith(`::${src}`)));};
 const show=(key:MenuPhoto)=>{if(usable(key))onPhoto(key);};
 const shown:MenuPhoto=usable(photo)?photo:'defaut';
 const photoSrc=menuPhotos[shown];
 return <div className="menu-body">
  <nav className="menu-nav" aria-label="Navigation principale">
   <ul className="menu-rooms" role="list">
    {menuRooms.map(item=><li key={item} className="menu-room-item">
     <button type="button" className="menu-room" aria-current={room===item?'true':undefined} onMouseEnter={()=>show(item)} onFocus={()=>show(item)} onClick={()=>pickRoom(item)}>{roomLabels[item]}</button>
     <ul className="menu-cats" role="list">{categoriesFor(item).map(category=><li key={category.id}><button type="button" className="menu-cat" aria-current={filter===category.id?'true':undefined} onMouseEnter={()=>show(item)} onFocus={()=>show(item)} onClick={()=>pickCategory(category.id)}>{category.label}</button></li>)}</ul>
    </li>)}
    <li className="menu-room-item"><Link className="menu-room" href="/notre-univers" onMouseEnter={()=>show('univers')} onFocus={()=>show('univers')} onClick={closeMenu}>Notre univers</Link></li>
   </ul>
   <button type="button" className="menu-all" onClick={()=>pickRoom('tout')}>Toute la collection</button>
   <div className="menu-spacer" aria-hidden="true"/>
   <ul className="menu-secondary" role="list">
    <li><Link href="/guide-du-linge">Le guide du linge</Link></li>
    <li><a href="#questions" onClick={event=>{event.preventDefault();closeMenu();requestAnimationFrame(()=>document.getElementById('questions')?.scrollIntoView({behavior:prefersReducedMotion()?'auto':'smooth'}));}}>Questions fréquentes</a></li>
    <li><Link href="/informations/retours">Livraison et retours</Link></li>
    <li><a href="mailto:contact@raime.fr">Nous écrire</a></li>
   </ul>
  </nav>
  <figure className="menu-visual" aria-hidden="true">
   {photoSrc&&<img key={photoSrc} className="menu-photo" src={photoSrc} alt="" width={800} height={1000} loading="eager" decoding="async" onError={event=>{const img=event.currentTarget;if(!img.src.endsWith(MENU_FALLBACK_PHOTO))img.src=MENU_FALLBACK_PHOTO;}}/>}
   <figcaption>{menuCaption(shown)}</figcaption>
  </figure>
 </div>;
}
function CollectionFilters({room,filter,colorFilter,selectRoom,clearFilters,setFilter,setColorFilter,setActiveColorName}:{room:RoomChoice;filter:Category|'tout';colorFilter:string;selectRoom:(room:RoomChoice)=>void;clearFilters:()=>void;setFilter:(filter:Category|'tout')=>void;setColorFilter:(name:string)=>void;setActiveColorName:(name:string)=>void}){
 const uid=useId(),allButton=useRef<HTMLButtonElement>(null);
 const active=room!=='tout'||filter!=='tout'||Boolean(colorFilter);
 return <div className="filters-block">
  <p className="filter-label" id={`${uid}-p`}>Pièces</p>
  <ul role="list" aria-labelledby={`${uid}-p`} className="filter-rooms">
   <li><button type="button" ref={allButton} className="filter-room" aria-pressed={room==='tout'} onClick={()=>selectRoom('tout')}>Toute la collection</button></li>
   {menuRooms.map(item=><li key={item}>
    <button type="button" className="filter-room" aria-pressed={room===item} onClick={()=>selectRoom(item)}>{roomLabels[item]}</button>
    {room===item&&<ul role="list" className="filter-cats">{categoriesFor(item).map(category=><li key={category.id}><button type="button" className="filter-cat" aria-pressed={filter===category.id} onClick={()=>setFilter(filter===category.id?'tout':category.id)}><span>{category.label}</span><span className="filter-n">{countIn(item,category.id)}</span></button></li>)}</ul>}
   </li>)}
  </ul>
  <hr className="filter-sep"/>
  <p className="filter-label" id={`${uid}-n`}>Nuances</p>
  <ul role="list" aria-labelledby={`${uid}-n`} className="filter-colors">
   <li><button type="button" className="filter-color no-dot" aria-pressed={!colorFilter} onClick={()=>setColorFilter('')}>Toutes les nuances</button></li>
   {featuredColorStories.map(story=><li key={story.name}><button type="button" className="filter-color" style={{'--swatch':story.swatch??'var(--bg-card)'} as CSSProperties} aria-pressed={colorFilter===story.name} onClick={()=>{const next=colorFilter===story.name?'':story.name;setColorFilter(next);if(next)setActiveColorName(next);}}><span className="dot" aria-hidden="true"/>{story.name}</button></li>)}
  </ul>
  {active&&<button type="button" className="filter-clear" onClick={()=>{clearFilters();allButton.current?.focus({preventScroll:true});}}>Effacer les filtres</button>}
 </div>;
}
export default function Home({initialProductId,initialColor='blanc',initialOptionId}:{initialProductId?:string;initialColor?:Color;initialOptionId?:string}={}){
 const initialProduct=products.find(p=>p.id===initialProductId);
 const initialAllowedColor=initialProduct?(initialColor===''&&modelSceneGalleryFor(initialProduct).length?'':initialProduct.availableColors.includes(initialColor)?initialColor:presentationColor(initialProduct)):'';
 const [shownCount,setShownCount]=useState(12);
 const [room,setRoom]=useState<RoomChoice>('tout');
 const [filter,setFilter]=useState<Category|'tout'>('tout'),[colorFilter,setColorFilter]=useState(''),[activeColorName,setActiveColorName]=useState(featuredColorStories[0]?.name??''),[sort,setSort]=useState('selection'),[search,setSearch]=useState(''),[searchOpen,setSearchOpen]=useState(false),[menuOpen,setMenuOpen]=useState(false),[filtersOpen,setFiltersOpen]=useState(false),[menuPhoto,setMenuPhoto]=useState<MenuPhoto>('defaut');
 const [view,setView]=useState<View|null>(initialProduct?{product:initialProduct,color:initialAllowedColor}:null),[optionId,setOptionId]=useState(initialOptionId??initialProduct?.options[0]?.id??''),[detailImageIndex,setDetailImageIndex]=useState(0),[quantity,setQuantity]=useState(1);
 const [cardColors,setCardColors]=useState<Record<string,Color>>({}),[failedImages,setFailedImages]=useState<string[]>([]);
 const addArea=useRef<HTMLDivElement>(null),menuNavigated=useRef(false);
 const [cart,setCart]=useState<CartItem[]>([]),[hydrated,setHydrated]=useState(false),[cartOpen,setCartOpen]=useState(false),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[checkoutError,setCheckoutError]=useState('');
 const [shop,setShop]=useState({checkoutEnabled:false,testMode:false,minDays:null as number|null,maxDays:null as number|null});
 const closeView=useCallback(()=>setView(null),[]),closeCart=useCallback(()=>setCartOpen(false),[]),closeSearch=useCallback(()=>setSearchOpen(false),[]),closeMenu=useCallback(()=>setMenuOpen(false),[]),closeFilters=useCallback(()=>{setFiltersOpen(false);revealResults();},[]);
  useEffect(()=>{
   const frame=window.requestAnimationFrame(()=>{
    try{const saved=JSON.parse(localStorage.getItem('mp-cart-v1')??'[]');if(Array.isArray(saved))setCart(saved.filter(i=>{try{resolveItem(i);return Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=10;}catch{return false;}}).slice(0,15));}catch{}
    setHydrated(true);
    if(new URLSearchParams(window.location.search).get('panier')==='1')setCartOpen(true);
    const recherche=new URLSearchParams(window.location.search).get('recherche');if(recherche){setSearch(recherche.slice(0,80));document.getElementById('collection')?.scrollIntoView();}
   });
   const controller=new AbortController();
   fetch('/api/shop-status',{signal:controller.signal}).then(async r=>r.ok?await r.json() as {checkoutEnabled:boolean;testMode:boolean;minDays:number|null;maxDays:number|null}:null).then(data=>data&&setShop(data)).catch(()=>{});
   return()=>{window.cancelAnimationFrame(frame);controller.abort();};
  },[]);
 useEffect(()=>{if(hydrated)try{localStorage.setItem('mp-cart-v1',JSON.stringify(cart));}catch{}},[cart,hydrated]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(timer);},[notice]);
 const count=cart.reduce((n,i)=>n+i.quantity,0),total=cart.reduce((n,i)=>n+resolveItem(i).option.price*i.quantity,0);
 const cartHasUnapproved=cart.some(item=>{const {product}=resolveItem(item);return product.draftOnly||product.priceStatus!=='approved';});
 const checkoutAllowed=shop.checkoutEnabled&&cart.length>0&&!cartHasUnapproved;
 const visible=catalog.filter(product=>(room==='tout'||roomFor(product)===room)&&(filter==='tout'||product.category===filter)&&(!colorFilter||Boolean(lifestyleColorFor(product,colorFilter)))&&fold(`${product.name} ${product.subtitle} ${productColors(product).map(c=>c.name).join(' ')}`).includes(fold(search))).sort((a,b)=>{
  const x=startingPrice(a),y=startingPrice(b); if(sort==='selection')return 0;if(!x&&!y)return 0;if(!x)return 1;if(!y)return -1;return sort==='prix-asc'?x-y:y-x;
 });
 const currentColorStory=featuredColorStories.find(story=>story.name===activeColorName)??featuredColorStories[0];
 const currentColorFeature=currentColorStory?.items[0];
 function openProduct(product:Product,color:Color=cardColors[product.id]??presentationColor(product)){if(color&&!product.availableColors.includes(color))return;setView({product,color});setOptionId(product.options[0]?.id??'');setQuantity(1);setDetailImageIndex(0);}
 function addItem(product:Product,color:Color,option:string,amount=1){try{resolveItem({productId:product.id,color,optionId:option,quantity:amount});}catch{setNotice('Choisissez une couleur et un format confirmés pour préparer votre panier.');return;}const existing=cart.find(i=>i.productId===product.id&&i.color===color&&i.optionId===option);if((existing?.quantity??0)+amount>10){setNotice('Maximum de 10 exemplaires par variante.');return;}if(!existing&&cart.length>=15){setNotice('Votre panier peut contenir jusqu’à 15 variantes différentes.');return;}setCart(items=>existing?items.map(i=>i===existing?{...i,quantity:i.quantity+amount}:i):[...items,{productId:product.id,color,optionId:option,quantity:amount}]);setNotice('Ajouté à votre panier de préparation');setCheckoutError('');setView(null);setCartOpen(true);}
 function chooseCategory(category:Category|'tout'){setRoom(category==='tout'?'tout':roomForCategory(category));setFilter(category);setColorFilter('');setMenuOpen(false);scrollToCollection();}
 function chooseColor(name:string){setActiveColorName(name);setColorFilter(name);}
 async function checkout(){if(!checkoutAllowed||busy)return;setBusy(true);setCheckoutError('');try{const snapshot=JSON.stringify(cart);if(sessionStorage.getItem('mp-attempt-cart')!==snapshot){sessionStorage.removeItem('mp-checkout-attempt');sessionStorage.setItem('mp-attempt-cart',snapshot);}let attemptId=sessionStorage.getItem('mp-checkout-attempt');if(!attemptId){attemptId=crypto.randomUUID();sessionStorage.setItem('mp-checkout-attempt',attemptId);}const response=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:cart,attemptId})});const data=await response.json() as {url?:string;error?:string};if(!response.ok||!data.url)throw new Error(data.error??'Paiement temporairement indisponible.');const url=new URL(data.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')throw new Error('Adresse de paiement invalide.');window.location.assign(url.href);}catch(error){setCheckoutError(error instanceof Error?error.message:'Impossible d’ouvrir le paiement.');setBusy(false);}}
 const selectedOption=view?.product.options.find(o=>o.id===optionId);
 const allDetailGallery=view?(view.color?presentationGalleryFor(view.product,view.color):modelSceneGalleryFor(view.product)):[];
 const detailGallery=view?allDetailGallery.filter(src=>!failedImages.includes(failedImageKey(view.product,view.color,src))):[];
 const shownViewColors=view?photographedProductColors(view.product).filter(color=>Boolean(color.swatch)):[];
 const unshownViewColors=view?productColors(view.product).filter(color=>!shownViewColors.some(shown=>shown.id===color.id)):[];
 const activePhotoIndex=Math.min(detailImageIndex,Math.max(detailGallery.length-1,0));
 const detailPhoto=detailGallery[activePhotoIndex];
 const sharedPhotos=view?modelSceneGalleryFor(view.product).filter(src=>!detailGallery.includes(src)):[];
 const firstCartLine=cart[0];
 const firstCartProduct=firstCartLine?resolveItem(firstCartLine).product:undefined;
 const firstCartColor=firstCartLine&&firstCartProduct?colorName(firstCartLine.color,firstCartProduct):'';
 const suggestionCandidates=firstCartProduct?catalog.filter(product=>product.category===complementaryCategory[firstCartProduct.category]&&!cart.some(item=>item.productId===product.id)&&product.options.length>0&&Boolean(collectionImage(product))):[];
 const suggestion=suggestionCandidates.find(product=>Boolean(lifestyleColorFor(product,firstCartColor)))??suggestionCandidates[0];
 const suggestionMatchesCartColor=Boolean(suggestion&&lifestyleColorFor(suggestion,firstCartColor));
 const suggestionColor=suggestion?lifestyleColorFor(suggestion,firstCartColor)?.id??presentationColor(suggestion):'';
 const canPrepareItem=Boolean(view&&!view.product.requiresSupplierBundle&&selectedOption&&selectedOption.price>0&&photographedProductColors(view.product).some(color=>color.id===view.color));
 const chooseRoom=(value:RoomChoice)=>{setRoom(value);setFilter('tout');setColorFilter('');};
 // Only one drawer at a time: each Sheet listens to Escape on the document.
 const openPanel=(panel:Panel)=>{setMenuOpen(panel==='menu');setSearchOpen(panel==='search');setCartOpen(panel==='cart');setFiltersOpen(panel==='filters');if(panel==='menu')setMenuPhoto(room==='tout'?'defaut':room);};
 // Choosing from the menu moves the visitor to the collection: focus follows instead of returning to the Menu button.
 const leaveMenuForCollection=()=>{menuNavigated.current=true;setShownCount(12);setMenuOpen(false);requestAnimationFrame(()=>{menuNavigated.current=false;scrollToCollection();focusCollectionTitle();});};
 const pickRoom=(value:RoomChoice)=>{chooseRoom(value);leaveMenuForCollection();};
 const pickCategory=(category:Category)=>{setRoom(roomForCategory(category));setFilter(category);setColorFilter('');leaveMenuForCollection();};
 const submitSearch=()=>{setSearchOpen(false);setRoom('tout');setFilter('tout');requestAnimationFrame(scrollToCollection);};
 const activeLabels=[room!=='tout'?roomLabels[room]:'',filter!=='tout'?categoryLabel(filter):'',colorFilter].filter(Boolean);
 const afterFilterChange=()=>{setShownCount(12);if(!filtersOpen)revealResults();};
 const filterProps={room,filter,colorFilter,setActiveColorName,
  selectRoom:(value:RoomChoice)=>{setRoom(value);setFilter('tout');afterFilterChange();},
  clearFilters:()=>{chooseRoom('tout');afterFilterChange();},
  setFilter:(value:Category|'tout')=>{setFilter(value);afterFilterChange();},
  setColorFilter:(name:string)=>{setColorFilter(name);afterFilterChange();}};
 const isProductPage=Boolean(initialProduct&&view?.product.id===initialProduct.id);
 const HeroTitle=isProductPage?'p':'h1';
 const detailSheet=view&&<Sheet title="Dans le détail" wide plainTitle={isProductPage} onClose={closeView}>
  <div className="product-detail">
   <div className="detail-gallery">
    <div className="detail-photo-frame">
     {detailPhoto?<img className="detail-main" key={detailPhoto} src={detailPhoto} width={1000} height={1000} fetchPriority={isProductPage?'high':undefined} alt={`${view.product.name} — ${view.color?colorName(view.color,view.product):'vue du modèle, coloris à confirmer'}, vue ${activePhotoIndex+1} sur ${detailGallery.length}`} onError={()=>setFailedImages(previous=>previous.includes(failedImageKey(view.product,view.color,detailPhoto))?previous:[...previous,failedImageKey(view.product,view.color,detailPhoto)])}/>:<div className="detail-placeholder">La photo confirmée de ce coloris<br/>reste à sélectionner.<span>Nous ne la remplaçons pas par l’image d’un autre modèle.</span></div>}
     {detailGallery.length>1&&<div className="gallery-arrows"><button className="gallery-arrow" aria-label={`Photo précédente de ${colorName(view.color,view.product)}`} onClick={()=>setDetailImageIndex(index=>(index-1+detailGallery.length)%detailGallery.length)}><ChevronLeft size={20}/></button><button className="gallery-arrow" aria-label={`Photo suivante de ${colorName(view.color,view.product)}`} onClick={()=>setDetailImageIndex(index=>(index+1)%detailGallery.length)}><ChevronRight size={20}/></button></div>}
    </div>
    <div className="gallery-caption"><p className="gallery-count" aria-live="polite">{detailGallery.length>0?`${view.color?colorName(view.color,view.product):'Vue du modèle · nuance à confirmer'} · Photo ${activePhotoIndex+1} sur ${detailGallery.length}`:`${colorName(view.color,view.product)} · Mise en situation à compléter`}</p><PinterestButton/></div>
    {detailPhoto&&view.product.photoNotes?.[detailPhoto]&&<p className="source-note">{view.product.photoNotes[detailPhoto]}</p>}
    {detailGallery.length>1&&<div className="thumbnails" role="group" aria-label={`Photographies en ${colorName(view.color,view.product)}`}>{detailGallery.map((src,index)=><button key={src} onClick={()=>setDetailImageIndex(index)} aria-label={`Voir ${view.product.name} en ${colorName(view.color,view.product)}, photo ${index+1}`} aria-pressed={activePhotoIndex===index}><img src={src} alt="" width={68} height={68} loading="lazy" onError={()=>setFailedImages(previous=>previous.includes(failedImageKey(view.product,view.color,src))?previous:[...previous,failedImageKey(view.product,view.color,src)])}/></button>)}</div>}
    {sharedPhotos.length>0&&<details className="shared-gallery"><summary>Autres vues du modèle · coloris à identifier <ChevronDown size={16}/></summary><p>Ces images décrivent le modèle. Elles ne sont pas attribuées au coloris sélectionné.</p><div className="shared-photos">{sharedPhotos.map((src,index)=><a key={src} href={src} target="_blank" rel="noopener noreferrer" aria-label={`Agrandir la vue générale ${index+1} du modèle, coloris à identifier`}><img src={src} alt={`Vue générale ${index+1} de ${view.product.name} — coloris à identifier`} width={400} height={400} loading="lazy"/></a>)}</div></details>}
    {(detailGallery.length>0||sharedPhotos.length>0)&&<p className="source-note">Les teintes peuvent varier avec la lumière et votre écran. Le décor n’est pas inclus dans l’article choisi.</p>}
    {view.product.video?<figure className="product-video"><video controls preload="none" playsInline poster={view.product.video.poster}><source src={view.product.video.src}/></video><figcaption>{view.product.video.caption}</figcaption></figure>:null}
   </div>
   <div className="detail-copy">
      {isProductPage&&<nav className="detail-breadcrumb" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link><span aria-hidden="true"> / </span><span aria-current="page">{view.product.name}</span></nav>}<p className="eyebrow">{categoryLabel(view.product.category)}</p>{isProductPage?<h1>{view.product.name}</h1>:<h2>{view.product.name}</h2>}
    <div className="detail-price-block"><p className="detail-price">{priceLabel(view.product,optionId)}</p>{view.product.priceStatus!=='approved'&&<p className="proposed-price-label">Prix de vente proposé · provisoire avant ouverture</p>}</div>
     <div className="product-confidence"><p><strong>Avis vérifiés</strong> · publiés après de vraies commandes.</p><p><strong>Composition et entretien</strong> · détaillés uniquement si confirmés pour cette référence.</p><p><strong>Livraison offerte dès 100 €</strong> · retours gratuits sous 14 jours après réception.</p></div>
     <p>{view.product.description}</p>
    <fieldset className="option-field"><legend>Couleur · <strong>{colorName(view.color,view.product)}</strong></legend>{shownViewColors.length>0?<div className="color-options">{shownViewColors.map(color=><button key={color.id} aria-label={color.name} aria-pressed={view.color===color.id} className={view.color===color.id?'chosen':''} onClick={()=>{setDetailImageIndex(0);setView({...view,color:color.id});}}><span style={{background:color.swatch}}/>{color.name}</button>)}</div>:<p className="source-note">Aucun coloris n’est sélectionnable tant qu’une photo propre à cette référence n’est pas confirmée.</p>}{unshownViewColors.length>0&&<p className="source-note">Coloris relevés mais masqués pour l’instant : {unshownViewColors.map(color=>color.name).join(', ')}. Leur photo et leur nuance doivent être confirmées pour cette référence.</p>}</fieldset>
    <fieldset className="option-field"><legend>Format et contenu</legend>{view.product.options.length>0?<><div className="size-options">{view.product.options.map(option=><button key={option.id} aria-pressed={optionId===option.id} onClick={()=>setOptionId(option.id)} className={optionId===option.id?'chosen':''}><span>{option.label}</span>{option.price>0&&<strong>{money(option.price)}</strong>}</button>)}</div>{view.product.photoScalingNote&&<p className="source-note">{view.product.photoScalingNote}</p>}</>:<p className="source-note">Les dimensions et le contenu de vente sont en cours de confirmation.</p>}</fieldset>
    <div className="add-row" ref={addArea}><div className="quantity-control"><button aria-label="Diminuer la quantité" disabled={quantity===1} onClick={()=>setQuantity(quantity-1)}><Minus size={15}/></button><span aria-label={`Quantité : ${quantity}`}>{quantity}</span><button aria-label="Augmenter la quantité" disabled={quantity===10} onClick={()=>setQuantity(quantity+1)}><Plus size={15}/></button></div><button className="button primary" disabled={!canPrepareItem} onClick={()=>addItem(view.product,view.color,optionId,quantity)}>Ajouter au panier <ShoppingBag size={17}/></button></div>
    <p className="detail-status">{view.product.draftOnly?'Panier de préparation uniquement · Les formats et couleurs ont été relevés séparément. Leur association, le stock, le prix livré et les conditions de retour restent à confirmer. Aucun paiement n’est ouvert.':view.product.priceStatus!=='approved'||!shop.checkoutEnabled?'Préouverture · Composez votre panier sans paiement. Les prix proposés, la livraison et les conditions de retour restent à valider.':shop.minDays!==null&&shop.maxDays!==null?`Livraison estimée : ${shop.minDays} à ${shop.maxDays} jours ouvrés. Consultez les conditions de retour.`:'Les conditions de livraison et de retour figurent sur la page de paiement.'}</p>
    {!canPrepareItem&&<p className="detail-status">Les choix de couleur, de format ou de prix manquants doivent être confirmés avant de préparer cet article.</p>}
    <ProductGuides product={view.product} optionLabel={selectedOption?.label}/>
    <ProductHelp/>
    <details className="product-specs"><summary>Le contenu de votre sélection <ChevronDown size={16}/></summary><ul>{view.product.details.map(detail=><li key={detail}>{detail}</li>)}</ul></details>
   </div>
  </div>
  <StickyProductAction target={addArea} name={view.product.name} selection={`${colorName(view.color,view.product)} · ${selectedOption?.label??'Format à choisir'} · quantité ${quantity}`} price={priceLabel(view.product,optionId)} disabled={!canPrepareItem} onAdd={()=>addItem(view.product,view.color,optionId,quantity)}/>
 </Sheet>;
 return <>{!initialProductId&&<JsonLd data={faqLd()}/>}<a className="skip" href="#main">Aller au contenu</a>{isProductPage&&detailSheet}<div className="announcement"><span>{shop.testMode&&shop.checkoutEnabled?'MODE TEST · Aucun paiement réel ni commande fournisseur':shop.checkoutEnabled?'La douceur fait son entrée chez vous':'Notre première collection se prépare. Prenez le temps de la découvrir.'}</span></div>
 <SiteHeader menuOpen={menuOpen} searchOpen={searchOpen} cartOpen={cartOpen} count={count} onMenu={()=>openPanel('menu')} onSearch={()=>openPanel('search')} onCart={()=>openPanel('cart')}/>
  <main id="main"><section className="hero"><img className="hero-image" src="/img/hero-canape.webp" alt="Canapé en lin clair avec coussins texturés, dans un salon baigné de lumière naturelle" width={1400} height={1400} fetchPriority={isProductPage?'auto':'high'}/><div className="hero-copy"><p className="eyebrow">L’ART DE SE SENTIR CHEZ SOI</p><HeroTitle className="hero-title">La douceur,<br/>à <em>demeure.</em></HeroTitle><p className="hero-description">Linge de lit, plaids et coussins aux textures douces, <br/>pour la chambre et le salon.</p><a className="button hero-button" href="#collection">Découvrir la collection <ArrowRight size={17}/></a></div></section>
 <section className="shop-by-color section-wrap" aria-labelledby="shop-by-color-title">
  <div className="shop-color-copy"><p className="eyebrow">SHOP BY COLOR · CHOISIR PAR NUANCE</p><h2 id="shop-by-color-title">Une couleur,<br/><em>une atmosphère.</em></h2><p>Explorez les nuances réellement présentes dans les photos de la collection. Chaque scène reste liée au coloris de sa fiche.</p>
  <div className="shop-color-swatches" role="group" aria-label="Choisir une couleur de mise en scène">{featuredColorStories.map(story=><button key={story.name} type="button" aria-pressed={activeColorName===story.name} onClick={()=>chooseColor(story.name)}><span className="shop-color-dot" style={{'--swatch':story.swatch??'#ded8ce'} as CSSProperties}/>{story.name}</button>)}</div>
    {currentColorFeature&&<div className="shop-color-caption" aria-live="polite"><span>{currentColorFeature.product.name}</span><span>{categoryLabel(currentColorFeature.product.category)} · {currentColorFeature.color.name}</span><button className="underlined" onClick={()=>{setColorFilter(activeColorName);scrollToCollection();}}>Voir les pièces {activeColorName}<ArrowRight size={15}/></button></div>}
   <small>Les coloris et photos restent soumis à la validation fournisseur avant l’ouverture des ventes.</small>
  </div>
   {currentColorFeature&&<button type="button" className="shop-color-visual" key={`${activeColorName}-${currentColorFeature.product.id}`} onClick={()=>openProduct(currentColorFeature.product,currentColorFeature.color.id)} aria-label={`Découvrir ${currentColorFeature.product.name} en ${currentColorFeature.color.name}`}><img src={currentColorFeature.image} alt={`${currentColorFeature.product.name} en ${currentColorFeature.color.name}, photographie de mise en situation`} width={1000} height={1000} loading="lazy"/><span>Découvrir cette mise en scène <ArrowUpRight size={16}/></span></button>}
 </section>
 <div className="reassurance" aria-label="Pour choisir en confiance"><span><Layers size={18} strokeWidth={1.2}/> Chaque pièce à votre rythme</span><span><Ruler size={18} strokeWidth={1.2}/> Des dimensions détaillées</span><span><ShoppingBag size={18} strokeWidth={1.2}/> {shop.checkoutEnabled?'Frais précisés avant paiement':'Panier sans paiement en préouverture'}</span></div>

  <section id="collection" className="collection section-wrap"><div className="section-top"><div><p className="eyebrow">LA COLLECTION EN PRÉPARATION</p><h2 id="collection-title" tabIndex={-1}>Faire place <em>au confort.</em></h2></div></div>
  {(hasProposedPrice||!shop.checkoutEnabled)&&<p id="collection-note" className="collection-note">{!shop.checkoutEnabled&&'Préouverture · '}{hasProposedPrice&&'Les montants affichés sont des prix de vente proposés pour préparer votre sélection. Ils restent à valider avec les coûts livrés et les variantes. '}{!shop.checkoutEnabled&&'Aucun paiement n’est ouvert.'}</p>}
  <div className="collection-layout">
   <aside className="collection-aside" aria-label="Affiner la collection"><CollectionFilters {...filterProps}/></aside>
   <div className="collection-main">
    <div className="collection-bar">
     <button type="button" className="filter-trigger" aria-haspopup="dialog" aria-controls={filtersOpen?'filter-panel':undefined} aria-expanded={filtersOpen} onClick={()=>openPanel('filters')}>Filtrer{activeLabels.length>0?` (${activeLabels.length})`:''}</button>
     <div className="collection-count-wrap"><p className="collection-count" id="collection-count" tabIndex={-1} aria-live="polite">{models(visible.length)}{search&&<span className="count-search">{` pour « ${search} »`}</span>}{activeLabels.length>0&&<span className="count-filters">{activeLabels.map(label=>` · ${label}`).join('')}</span>}</p>{search&&<button type="button" className="text-button count-clear" onClick={()=>{setSearch('');setShownCount(12);document.getElementById('collection-count')?.focus({preventScroll:true});}}>Effacer</button>}</div>
     <div className="collection-sort"><span className="sort-prefix" aria-hidden="true">Trier :</span><SelectMenu label="Trier les produits" value={sort} onChange={setSort} options={[{value:'selection',label:'Notre sélection'},{value:'prix-asc',label:'Prix croissant'},{value:'prix-desc',label:'Prix décroissant'}]}/></div>
    </div>
 {search&&<p className="search-line"><span>Pour « {search} »</span><button type="button" className="text-button" onClick={()=>{setSearch('');setShownCount(12);document.getElementById('collection-count')?.focus({preventScroll:true});}}>Effacer la recherche</button></p>}
 <div className="product-grid">{visible.slice(0,shownCount).map(product=>{
   const filteredColor=colorFilter?lifestyleColorFor(product,colorFilter):undefined;
   const selectedColor=filteredColor?.id??cardColors[product.id]??presentationColor(product);
  const exactPhoto=lifestyleGalleryFor(product,selectedColor).find(src=>!failedImages.includes(failedImageKey(product,selectedColor,src)));
  const cardFallback=selectedColor?presentationGalleryFor(product,selectedColor).find(src=>!failedImages.includes(failedImageKey(product,selectedColor,src))):collectionImage(product);
  const cardPhoto=exactPhoto??cardFallback;
  const altPhoto=[lifestyleGalleryFor(product,selectedColor)[1],macroGalleryFor(product,selectedColor)[0]].find(src=>Boolean(src)&&src!==cardPhoto&&!failedImages.includes(failedImageKey(product,selectedColor,src)));
  const choices=photographedProductColors(product).filter(color=>Boolean(color.swatch));
  const shownChoices=choices.slice(0,4);
  const selectedChoice=choices.find(color=>color.id===selectedColor);
  if(selectedChoice&&!shownChoices.includes(selectedChoice))shownChoices.splice(shownChoices.length-1,1,selectedChoice);
  const multiplePrices=new Set(product.options.map(o=>o.price)).size>1,proposed=product.priceStatus!=='approved';
  const markFailed=(src:string)=>setFailedImages(previous=>previous.includes(failedImageKey(product,selectedColor,src))?previous:[...previous,failedImageKey(product,selectedColor,src)]);
  return <article className="product-card" key={product.id}>
   <div className="product-media"><button type="button" className="product-image" onClick={()=>openProduct(product,selectedColor)} aria-label={`Découvrir ${product.name}${selectedColor?` en ${colorName(selectedColor,product)}`:''}`}>
    {cardPhoto?<><img key={cardPhoto} src={cardPhoto} alt={`${product.name}${selectedColor?` — ${colorName(selectedColor,product)}`:' — vue du modèle'}`} width={800} height={800} loading="lazy" onError={()=>markFailed(cardPhoto)}/>{altPhoto&&<img className="product-alt" src={altPhoto} alt="" aria-hidden="true" width={800} height={800} loading="lazy" onError={()=>markFailed(altPhoto)}/>}</>:<span className="no-image">La photo correspondant à ce coloris<br/>reste à confirmer</span>}
   </button></div>
   <div className="product-info"><h3 className="product-heading"><a href={`/produits/${product.id}`} title={product.name} onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey)return;event.preventDefault();openProduct(product,selectedColor);}}>{product.name}</a></h3><p className="product-price" aria-describedby={hasProposedPrice&&proposed?'collection-note':undefined}>{multiplePrices&&<span className="from">Dès </span>}{priceLabel(product)}{proposed&&<span className="sr-only">, prix proposé en préouverture</span>}</p></div>
   {cardPhoto&&!exactPhoto&&<p className="card-note">Photo du produit · mise en situation à compléter</p>}
   {choices.length===0&&<p className="product-status">Coloris photographié à confirmer</p>}
   <div className="card-bottom">{choices.length>0?<div className="swatches" role="group" aria-label={`Couleurs de ${product.name}`}>{shownChoices.map(c=><button type="button" key={c.id} title={`${c.name}${lifestyleGalleryFor(product,c.id).length?'':' · photo de mise en situation à compléter'}`} aria-label={`Afficher ${product.name} en ${c.name}`} aria-pressed={selectedColor===c.id} onClick={()=>{setCardColors(previous=>({...previous,[product.id]:c.id}));if(colorFilter&&fold(colorName(c.id,product))!==fold(colorFilter))setColorFilter('');}} style={{'--swatch':c.swatch}as CSSProperties}/>)}{choices.length>shownChoices.length&&<span className="swatch-more">+{choices.length-shownChoices.length}</span>}</div>:<span/>}<span className="card-selected-color sr-only" aria-live="polite">{selectedColor?colorName(selectedColor,product):'Vue du modèle · choisissez une nuance'}</span><button type="button" className="quick-add" aria-label={`Choisir ${product.name}`} onClick={()=>openProduct(product,selectedColor)}>Choisir</button></div>
  </article>;
 })}</div>
 {shownCount<visible.length&&<div className="load-more"><button type="button" className="button secondary" onClick={()=>setShownCount(count=>count+12)}>Découvrir {Math.min(12,visible.length-shownCount)} modèles de plus <Plus size={16}/></button></div>}
 {visible.length===0&&<div className="empty-results"><Search size={28}/><h3>La douceur se fait attendre.</h3><p>Essayez une autre catégorie ou un autre mot.</p><button className="button secondary" onClick={()=>{setSearch('');setFilter('tout');setRoom('tout');setColorFilter('');}}>Revoir la collection</button></div>}
   </div>
  </div>
  <details className="confidence-bar"><summary><span>Les repères pour choisir en confiance</span><ChevronDown size={16}/></summary><div className="confidence-points"><p><strong>Avis</strong> · publiés après des commandes réelles.</p><p><strong>Matières et entretien</strong> · précisés seulement lorsqu’ils sont documentés.</p><p><strong>Livraison offerte dès 100 €</strong> · retours gratuits sous 14 jours après réception.</p></div></details>
  <Link className="preparation-link" href="/catalogue-preparation">Voir les {preparationCount} références du catalogue de préparation <ArrowUpRight size={16}/></Link></section>
 <section id="composer" className="cocon-banner"><div className="cocon-image"><img src="/img/canape-blanc.jpg" alt="Deux housses blanches côtelées sur un canapé beige, à choisir à l’unité" width={1200} height={1200} loading="lazy"/><button className="look-hotspot" aria-label="Découvrir la housse côtelée blanche, 1 housse seule, prix proposé 12,90 euros" onClick={()=>openProduct(products.find(p=>p.id==='housse-cotelee')!,'blanc')}><Plus size={13}/><span>La housse côtelée<strong>{priceLabel(products.find(p=>p.id==='housse-cotelee')!)}</strong><small>1 housse seule · prix proposé</small></span></button></div><div className="cocon-copy"><p className="eyebrow">COFFRET COCON · À COMPOSER</p><h2>Votre coin cocon,<br/><em>à votre façon.</em></h2><p>Une housse pour commencer, un plaid pour prolonger la soirée. Choisissez chaque pièce séparément et composez votre panier selon vos envies.</p><div className="compose-actions"><button className="button primary" onClick={()=>chooseCategory('plaids')}>Choisir un plaid <ArrowRight size={17}/></button><button className="button secondary" onClick={()=>chooseCategory('housses')}>Choisir une housse <ArrowRight size={17}/></button></div><small>Chaque élément reste choisi séparément. Tout prix groupé ou remise sera défini après validation des coûts fournisseurs.</small></div></section>
 <section id="notre-univers" className="universe section-wrap"><div className="universe-copy"><p className="eyebrow">L’ESPRIT MOON & PILLOW</p><h2>La maison n’a pas besoin<br/>d’être parfaite.<br/><em>Juste d’être la vôtre.</em></h2><p>Nous aimons les salons où l’on s’attarde, les lits qu’on ne fait pas tout de suite, les teintes faciles à vivre. Moon & Pillow commence avec une idée simple : quelques pièces à choisir pour rendre vos moments à la maison un peu plus doux.</p><a href="#collection" className="underlined">Explorer notre collection <ArrowUpRight size={17}/></a></div><div className="universe-photo"><img src="/img/plaid-lit.jpg" alt="Un plaid côtelé blanc posé sur un lit" width={800} height={800} loading="lazy"/></div></section>
 <section className="faq section-wrap" id="questions"><div><p className="eyebrow">ON VOUS RÉPOND</p><h2>Avant de<br/><em>vous installer.</em></h2><p>Un doute sur une taille ou un ensemble ?<br/><a href="mailto:contact@raime.fr">Écrivez-nous <ArrowUpRight size={14}/></a></p></div><div className="faq-list">{faq.map(([question,answer])=><details key={question}><summary>{question}<Plus size={18}/></summary><p>{answer}</p></details>)}</div></section><div className="closing-note"><Moon size={28}/><p>On est si bien, <em>chez soi.</em></p></div></main>
 <footer className="site-footer"><div className="footer-main"><div><Link href="/" className="wordmark">Moon <i>&</i> Pillow</Link><p>Du doux. Du simple. Du chez-vous.</p></div><div><p className="footer-title">La collection</p><a href="#collection" onClick={()=>chooseCategory('housses-couette')}>Housses de couette</a><a href="#collection" onClick={()=>chooseCategory('taies')}>Taies d’oreiller</a><a href="#collection" onClick={()=>chooseCategory('housses')}>Housses de coussin</a><a href="#collection" onClick={()=>chooseCategory('plaids')}>Plaids</a><a href="#collection" onClick={()=>chooseCategory('coussins')}>Coussins</a><Link href="/produits/plaid-cotele">Le plaid côtelé</Link><Link href="/produits/housse-cotelee">La housse côtelée</Link></div><div><p className="footer-title">À votre écoute</p><a href="#questions">Questions fréquentes</a><Link href="/informations/retours">Livraison & retours</Link><Link href="/guide-du-linge">Le guide du linge</Link><Link href="/notre-univers">Notre univers</Link><a href="mailto:contact@raime.fr">Nous contacter</a></div><div><p className="footer-title">Un peu plus près</p><p>Une collection qui se prépare.<br/>Pour l’instant, prenez le temps<br/>de choisir votre nuance.</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Moon & Pillow</span><div><Link href="/informations/mentions-legales">Mentions légales</Link><Link href="/informations/cgv">CGV</Link><Link href="/informations/confidentialite">Confidentialité</Link></div><span>Imaginé pour vos moments à la maison.</span></div></footer>
 {notice&&<div role="status" className="toast"><Check size={17}/>{notice}<button onClick={()=>{setView(null);setCartOpen(true);setNotice('');}}>Voir mon panier <ArrowRight size={14}/></button></div>}
 {searchOpen&&<Sheet title="Un petit bonheur en tête ?" onClose={closeSearch}><form className="search-panel" role="search" onSubmit={event=>{event.preventDefault();submitSearch();}}><label className="sr-only" htmlFor="product-search">Rechercher dans la collection</label><div className="search-input"><Search size={19} strokeWidth={1.25} aria-hidden/><input id="product-search" data-autofocus type="search" value={search} placeholder="Un plaid, une nuance…" autoComplete="off" onChange={e=>setSearch(e.target.value)}/></div><button type="submit" className="button primary full">Voir les résultats <ArrowRight size={17}/></button><p>Explorez les parures, taies, oreillers, housses et plaids de l’aperçu.</p></form></Sheet>}
 {menuOpen&&<Sheet title="Menu" side="left" plainTitle className="menu-sheet" id="site-menu" restoreFocus={()=>!menuNavigated.current} onClose={closeMenu}><MenuPanel room={room} filter={filter} photo={menuPhoto} onPhoto={setMenuPhoto} pickRoom={pickRoom} pickCategory={pickCategory} closeMenu={closeMenu} failedImages={failedImages}/></Sheet>}
 {filtersOpen&&<Sheet title="Filtrer" side="left" plainTitle className="filter-sheet" id="filter-panel" onClose={closeFilters}><div className="filter-sheet-body"><CollectionFilters {...filterProps}/></div><div className="filter-sheet-footer"><button type="button" className="button primary full" onClick={closeFilters}>Voir {visible.length>1?`les ${visible.length} modèles`:models(visible.length)}</button></div></Sheet>}
 {!isProductPage&&detailSheet}
 {cartOpen&&<Sheet title={`Votre panier de préparation${count?` (${count})`:''}`} onClose={closeCart}>{cart.length===0?<div className="empty-cart"><ShoppingBag size={40}/><h3>Un peu de place<br/>pour la douceur.</h3><p>Choisissez chaque pièce séparément pour composer votre panier.</p><button className="button primary" onClick={()=>{setCartOpen(false);chooseCategory('tout');}}>Découvrir la collection <ArrowRight size={16}/></button></div>:<>
  <div className="cart-items">{cart.map((item,index)=>{const {product,option}=resolveItem(item);const image=productImage(product,item.color);return <article className="cart-item" key={`${item.productId}:${item.color}:${item.optionId}`}>
   {image?<img src={image} alt={`${product.name} — ${colorName(item.color,product)}`} width={94} height={120} loading="lazy"/>:<div className="cart-photo-placeholder">Photo du coloris à compléter</div>}
   <div><h3>{product.name}</h3><p>{colorName(item.color,product)}</p><p>{option.label}</p>{product.priceStatus!=='approved'&&<p className="proposed-price-label">Prix proposé · provisoire</p>}<div className="cart-item-bottom"><div className="quantity-control"><button aria-label={`Diminuer ${product.name}`} onClick={()=>setCart(items=>items.flatMap((i,n)=>n!==index?[i]:i.quantity>1?[{...i,quantity:i.quantity-1}]:[]))}><Minus size={13}/></button><span>{item.quantity}</span><button aria-label={`Augmenter ${product.name}`} disabled={item.quantity>=10} onClick={()=>setCart(items=>items.map((i,n)=>n===index?{...i,quantity:i.quantity+1}:i))}><Plus size={13}/></button></div><strong>{money(option.price*item.quantity)}</strong></div><button className="remove" onClick={()=>setCart(items=>items.filter((_,n)=>n!==index))}>Retirer</button></div>
  </article>;})}</div>
  {suggestion&&<div className="cart-suggestion"><p className="eyebrow">COMPLÉTEZ VOTRE COCON</p><button onClick={()=>{setCartOpen(false);openProduct(suggestion,suggestionColor||presentationColor(suggestion));}}>{collectionImage(suggestion,suggestionColor||undefined)&&<img src={collectionImage(suggestion,suggestionColor||undefined)} alt={`${suggestion.name}${suggestionColor?` en ${colorName(suggestionColor,suggestion)}`:''}`} width={90} height={105} loading="lazy"/>}<span><strong>{suggestion.name}</strong><small>{priceLabel(suggestion)} · prix proposé</small><span>Choisir cette pièce <ArrowUpRight size={14}/></span></span></button><p>{suggestionMatchesCartColor?'Le nom de la nuance correspond aux deux fiches ; vérifiez les photos avant de l’ajouter.':'La nuance reste à choisir ; aucune concordance exacte n’est confirmée.'}</p></div>}
  <div className="cart-summary"><div><span>{cartHasUnapproved?'Sous-total proposé':'Sous-total'}</span><strong>{money(total)}</strong></div><div><span>Livraison</span><span>{(()=>{const port=shippingForCart(total,cart);return port===0?'Offerte':port!==null?`${money(port)} · offerte dès ${money(FREE_SHIPPING_FROM)}`:`À confirmer · offerte dès ${money(FREE_SHIPPING_FROM)}`;})()}</span></div><p>{checkoutAllowed?'Le montant total sera confirmé sur la page de paiement Stripe.':cartHasUnapproved?'Ce panier prépare votre sélection. Les prix et les variantes restent à valider : aucun paiement n’est possible.':'La boutique est en préouverture. Aucun paiement n’est possible pour le moment.'}</p>{checkoutError&&<p className="error" role="alert">{checkoutError}</p>}<button className="button primary full" disabled={!checkoutAllowed||busy} onClick={checkout}>{busy?'Ouverture du paiement…':checkoutAllowed?(shop.testMode?'Tester le paiement Stripe':'Passer au paiement'):'Paiement disponible à l’ouverture'}<ArrowRight size={17}/></button><button className="continue-shopping" onClick={()=>setCartOpen(false)}>Continuer ma découverte</button><small>Le panier est mémorisé sur cet appareil.</small></div>
 </>}</Sheet>}
 </>;
}
