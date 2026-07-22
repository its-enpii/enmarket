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

interface Props {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

export async function SummaryBlock({ subtotal, discount, total, itemCount }: Props) {
  const t = await getTranslations('keranjang');
  return (
    <Card variant="filled-primary" as="aside" thick hoverable={false}>
      <div className="p-6 md:p-8 space-y-5">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent">
          ✎ {t('summary')}
        </p>
        <div className="flex items-baseline justify-between border-b border-surface/20 pb-3">
          <span className="font-label text-label-sm uppercase tracking-wider text-surface/80">
            {t('subtotal')}
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
        <div className="pt-2">
          <p className="font-label text-label-sm uppercase tracking-[0.2em] text-surface/70 mb-2">
            {t('total')}
          </p>
          <Badge tone="accent" size="lg" shadow={false} className="px-6 py-4">
            <span className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight">
              {formatRupiah(total)}
            </span>
          </Badge>
          <p className="mt-3 font-label text-[10px] uppercase tracking-wider text-surface/60">
            {itemCount} {t('itemsSuffix')}
          </p>
        </div>

        <Button
          variant="surface"
          size="lg"
          href="/checkout"
          shadowColor="accent"
          className="w-full mt-2"
        >
          {t('checkout')}
        </Button>

        <p className="text-center font-label text-[10px] uppercase tracking-wider text-surface/60">
          {t('paymentNote')}
        </p>
      </div>
    </Card>
  );
}