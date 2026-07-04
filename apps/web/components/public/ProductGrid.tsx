import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

interface Props {
  products: Product[];
}

/**
 * Wrapper grid responsif (1 kolom mobile, 2 tablet, 3-4 desktop).
 */
export function ProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}