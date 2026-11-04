import { notFound } from 'next/navigation';
import Home from '../../page';
import { products, productColors, presentationColor, productImage, type Color } from '@/lib/catalog';
import { JsonLd } from '@/components/JsonLd';
import { productLd, hasProductLd, breadcrumbLd, productDescription, productTitle, pageMeta, privateMeta, robotsMeta } from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const product=products.find(p=>p.id===id);
 if(!product){const meta=privateMeta({title:'Produit introuvable — Moon & Pillow',description:'Ce produit n’existe pas ou plus sur la boutique Moon & Pillow.',path:`/produits/${id}`});return {...meta,alternates:{},openGraph:{...meta.openGraph,url:undefined}};}
 const image=productImage(product);
 return {
  ...pageMeta({title:productTitle(product),description:productDescription(product),path:`/produits/${product.id}`,image}),
  robots:product.draftOnly?{index:false,follow:false}:robotsMeta,
 };
}
export default async function ProductPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{couleur?:string;format?:string}>}){
 const {id}=await params;const search=await searchParams;const product=products.find(p=>p.id===id);if(!product)notFound();
 const color=productColors(product).some(c=>c.id===search.couleur)?search.couleur as Color:presentationColor(product);
 const option=product.options.find(o=>o.id===search.format)?.id??product.options[0]?.id;
 return <>
  {hasProductLd(product)&&<JsonLd data={productLd(product)}/>}
  {!product.draftOnly&&<JsonLd data={breadcrumbLd([{name:'Accueil',path:'/'},{name:product.name,path:`/produits/${product.id}`}])}/>}
  <Home initialProductId={product.id} initialColor={color} initialOptionId={option}/>
 </>;
}
