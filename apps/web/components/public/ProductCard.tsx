import { Card } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { getTranslations } from 'next-intl/server';

import { formatRupiah } from '@/lib/format';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
}

/**
 * Card produk untuk grid. Thumbnail dari preview_images[0] atau blok primary.
 */
export async function ProductCard({ product }: Props) {
  const t = await getTranslations('katalog');
  const thumb = product.preview_images?.[0];
  const kategoriNama = product.category?.nama ?? t('noCategory');

  return (
    <Card
      href={`/develop/${product.slug}`}
      variant="surface"
      hoverable
      className="overflow-hidden"
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
              {t('noImage')}
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge tone="accent" size="sm" className="font-bold">
              {t('featured')}
            </Badge>
          )}
          {product.is_pre_order && (
            <Badge tone="primary" size="sm" className="font-bold">
              {t('preorderBadge')}
            </Badge>
          )}
        </div>

        <Badge tone="ink" size="sm" className="absolute top-2 right-2 font-bold">
          {t(`tipe.${product.tipe}`)}
        </Badge>
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
    </Card>
  );
}
