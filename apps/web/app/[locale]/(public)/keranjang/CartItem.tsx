/**
 * CartItem — kartu item di halaman keranjang.
 *
 * Layout: thumbnail kiri (link ke detail produk) + info kanan (kategori,
 * judul, harga, subtotal, qty controls).
 *
 * Primitive:
 *   - Card (variant=surface) — wrapper artikel.
 *   - NLink — link ke detail produk (thumbnail + judul).
 *   - Badge (tone=accent) — chip harga.
 *   - CartItemRow (client) — qty controls + remove.
 */

import { getTranslations } from 'next-intl/server';

import { Card, NLink } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/format';

import { CartItemRow } from './CartItemRow';

type CartItemData = Awaited<
  ReturnType<typeof import('@/lib/cart-api').cartApi.get>
>['data']['items'][number];

export async function CartItem({ item }: { item: CartItemData }) {
  const t = await getTranslations('keranjang');
  const p = item.product;
  const thumb = p.preview_images?.[0];
  const category = p.category?.nama ?? null;

  return (
    <Card variant="surface" as="article" hoverable={false} className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <NLink
          href={`/develop/${p.slug}`}
          variant="default"
          underline="none"
          className="shrink-0 block sm:w-32 sm:h-32 aspect-video sm:aspect-square border-b-2 sm:border-b-0 sm:border-r-2 border-ink overflow-hidden bg-primary/10"
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={p.nama}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-xs text-center px-3">
              {p.nama}
            </div>
          )}
        </NLink>

        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {category && (
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-1">
                  {category}
                </p>
              )}
              <NLink
                href={`/develop/${p.slug}`}
                variant="default"
                underline="hover"
                className="block font-display text-lg sm:text-xl font-black uppercase tracking-tight text-ink leading-tight hover:text-primary transition-colors"
              >
                {p.nama}
              </NLink>
            </div>
            <Badge tone="accent" size="md">
              {formatRupiah(p.harga)}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2 border-l-2 border-ink/20 pl-3">
            <span className="font-label text-[10px] uppercase tracking-wider text-ink/50">
              {t('subtotal')}
            </span>
            <span className="font-display font-black text-base text-ink">
              {formatRupiah(item.subtotal)}
            </span>
            {item.qty > 1 && (
              <span className="font-label text-[10px] uppercase text-ink/50">
                × {item.qty}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t-2 border-ink/10">
            <CartItemRow productId={item.product_id} qty={item.qty} />
          </div>
        </div>
      </div>
    </Card>
  );
}