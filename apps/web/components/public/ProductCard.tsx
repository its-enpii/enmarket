import Link from 'next/link';

import { formatRupiah, TIPE_LABEL } from '@/lib/format';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
}

/**
 * Card produk untuk grid. Thumbnail dari preview_images[0] atau blok primary.
 */
export function ProductCard({ product }: Props) {
  const thumb = product.preview_images?.[0];
  const kategoriNama = product.category?.nama ?? 'Tanpa kategori';

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group block bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
    >
      <div className="aspect-video bg-primary/10 border-b-2 border-ink overflow-hidden relative">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={product.nama}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-surface">
            <span className="font-bold text-sm uppercase tracking-wider opacity-80">
              Tanpa Gambar
            </span>
          </div>
        )}

        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-ink border-2 border-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Unggulan
          </span>
        )}

        <span className="absolute top-2 right-2 bg-ink text-surface border-2 border-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          {TIPE_LABEL[product.tipe] ?? product.tipe}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 text-ink">
          {product.nama}
        </h3>
        <p className="mt-1 text-xs text-ink/60">{kategoriNama}</p>
        <p className="mt-3 font-bold text-primary text-lg sm:text-xl">
          {formatRupiah(product.harga)}
        </p>
      </div>
    </Link>
  );
}