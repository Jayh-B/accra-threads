import { notFound } from 'next/navigation';
import { getProduct, getRelated } from '@/lib/data';
import ProductClient from './ProductClient';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }

  const related = await getRelated(product);

  return <ProductClient product={product} related={related} />;
}
