/**
 * SummaryBlock — sticky aside checkout di halaman keranjang.
 *
 * Layout: filled-primary Card (purple) dengan line items (subtotal, discount,
 * total gold block) + Checkout CTA + payment note.
 *
 * Specifik cart (tidak reusable ke halaman lain — checkout aside ada di sini saja).
 */

import { getTranslations } from 'next-intl/server';

import { Button, Card } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/format';
import type { CartItem } from '@/lib/types';

interface Props {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  items?: CartItem[];
}

export async function SummaryBlock({ subtotal, discount, total, itemCount, items = [] }: Props) {
  const t = await getTranslations('keranjang');

  // Pre-order check: kalau semua item di cart pre-orderable, total adalah DP%, bukan harga penuh.
  // Cart policy all-or-nothing (enforced di CheckoutController) — kalau campuran sudah 422 di sana.
  const preorderItems = items.filter((i) => i.product?.is_pre_order);
  const allPreorder = items.length > 0 && preorderItems.length === items.length;
  const depositTotal = preorderItems.reduce(
    (sum, i) => sum + (i.product.deposit_amount ?? 0) * i.qty,
    0,
  );
  const releaseDate =
    allPreorder && items.length > 0
      ? items[0].product.release_date
      : null;

  // Untuk pre-order, "total" yang ditampilkan ke buyer = DP (amount yang harus dibayar).
  const displayTotal = allPreorder ? depositTotal : total;

  return (
    <Card variant="filled-primary" as="aside" thick hoverable={false}>
      <div className="p-6 md:p-8 space-y-5">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent">
          ✎ {t('summary')}
        </p>
        <div className="flex items-baseline justify-between border-b border-surface/20 pb-3">
          <span className="font-label text-label-sm uppercase tracking-wider text-surface/80">
            {allPreorder ? t('preorderLabel') : t('subtotal')}
          </span>
          <span className="font-display font-black text-lg text-surface">
            {formatRupiah(subtotal)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex items-baseline justify-between border-b border-surface/20 pb-3">
            <span className="font-label text-label-sm uppercase tracking-wider text-accent">
              {t('discount')}
            </span>
            <span className="font-display font-black text-lg text-accent">
              − {formatRupiah(discount)}
            </span>
          </div>
        )}
        {allPreorder && (
          <div className="space-y-2 border-t border-surface/10 pt-3 text-sm font-body text-surface/80">
            <p className="flex justify-between gap-3">
              <span>{t('preorderRemaining')}</span>
              <span className="font-bold">
                {formatRupiah(Math.max(0, subtotal - depositTotal))}
              </span>
            </p>
            {releaseDate && (
              <p className="flex justify-between gap-3">
                <span>{t('preorderReleaseDate')}</span>
                <span className="font-bold font-mono">{releaseDate}</span>
              </p>
            )}
          </div>
        )}
        <div className="pt-2">
          <p className="font-label text-label-sm uppercase tracking-[0.2em] text-surface/70 mb-2">
            {allPreorder ? t('preorderLabel') : t('total')}
          </p>
          <Badge tone="accent" size="lg" shadow={false} className="px-6 py-4">
            <span className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight">
              {formatRupiah(displayTotal)}
            </span>
          </Badge>
          <p className="mt-3 font-label text-[10px] uppercase tracking-wider text-surface/60">
            {itemCount} {t('itemsSuffix')}
          </p>
        </div>

        {allPreorder && (
          <p className="text-sm font-body text-surface/80 italic border-l-4 border-accent pl-3">
            {t('preorderNotice')}
          </p>
        )}

        <Button
          variant="surface"
          size="lg"
          href="/checkout"
          shadowColor="accent"
          className="w-full mt-2"
        >
          {allPreorder ? t('checkoutPreOrder') : t('checkout')}
        </Button>

        <p className="text-center font-label text-[10px] uppercase tracking-wider text-surface/60">
          {t('paymentNote')}
        </p>
      </div>
    </Card>
  );
}