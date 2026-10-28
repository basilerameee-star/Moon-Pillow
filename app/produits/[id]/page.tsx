import { notFound } from 'next/navigation';
import Home from '../../page';
import { products, productColors, presentationColor, categoryLabel, productImage, type Color } from '@/lib/catalog';
import { JsonLd } from '@/components/JsonLd';
import { productLd, breadcrumbLd, productDescription, robotsMeta } from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const product=products.find(p=>p.id===id);
 if(!product)return {title:'Produit introuvable — Moon & Pillow',robots:{index:false,follow:false}};
 const image=productImage(product);
 return {
  title:`${product.name} — ${categoryLabel(product.category)} | Moon & Pillow`,
  description:productDescription(product),
  alternates:{canonical:`/produits/${product.id}`},
  robots:product.draftOnly?{index:false,follow:false}:robotsMeta,
  openGraph:{title:product.name,description:productDescription(product),url:`/produits/${product.id}`,...(image?{images:[image]}:{})},
 };
}
export default async function ProductPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{couleur?:string;format?:string}>}){
 const {id}=await params;const search=await searchParams;const product=products.find(p=>p.id===id);if(!product)notFound();
 const color=productColors(product).some(c=>c.id===search.couleur)?search.couleur as Color:presentationColor(product);
 const option=product.options.find(o=>o.id===search.format)?.id??product.options[0]?.id;
 return <>
  <JsonLd data={productLd(product)}/>
  <JsonLd data={breadcrumbLd([{name:'Accueil',path:'/'},{name:product.name,path:`/produits/${product.id}`}])}/>
  <Home initialProductId={product.id} initialColor={color} initialOptionId={option}/>
 </>;
}
