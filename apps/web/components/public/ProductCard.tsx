import { Card } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui';
import { getTranslations } from 'next-intl/server';

import { formatRupiah } from '@/lib/format';
import type { Product } from '@/lib/types';
import { WishlistHeartButton } from '@/components/public/WishlistHeartButton';
import { Image } from '@/components/ui/Image';
import { ImagePlaceholder, Text } from '@/components/ui';

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
          <Image
            src={thumb}
            alt={product.nama}
            className="w-full h-full"
          />
        ) : (
          <ImagePlaceholder>
            <span className="font-bold text-sm uppercase tracking-wider opacity-80">
              {t('noImage')}
            </span>
          </ImagePlaceholder>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-raised">
          {product.is_featured && (
            <Badge tone="accent" size="sm" className="font-bold">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="star" size={14} />
                {t('featured')}
              </span>
            </Badge>
          )}
          {product.is_pre_order && (
            <Badge tone="primary" size="sm" className="font-bold">
              {t('preorderBadge')}
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-raised">
          <WishlistHeartButton productId={product.id} />
          <Badge tone="ink" size="sm" className="font-bold">
            {t(`tipe.${product.tipe}`)}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 text-ink">
          {product.nama}
        </h3>
        <Text as="p" variant="muted" className="mt-1">{kategoriNama}</Text>
        <p className="mt-3 font-bold text-primary text-lg sm:text-xl">
          {product.is_free ? t('priceFree') : formatRupiah(product.harga)}
        </p>
      </div>
    </Card>
  );
}
