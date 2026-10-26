import { notFound } from 'next/navigation';
import Home from '../../page';
import { products, productColors, presentationColor, type Color } from '@/lib/catalog';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const product=products.find(p=>p.id===id);
 return {title:product?`${product.name} — Moon & Pillow`:'Produit introuvable',description:product?.description};
}
export default async function ProductPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{couleur?:string;format?:string}>}){
 const {id}=await params;const search=await searchParams;const product=products.find(p=>p.id===id);if(!product)notFound();
 const color=productColors(product).some(c=>c.id===search.couleur)?search.couleur as Color:presentationColor(product);
 const option=product.options.find(o=>o.id===search.format)?.id??product.options[0]?.id;
 return <Home initialProductId={product.id} initialColor={color} initialOptionId={option}/>;
}
