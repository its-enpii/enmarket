'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useTransition } from 'react';

import { toast } from '@/components/ui/toast-store';

import { addToCartAction, addToCartAndGoAction } from './actions';

interface Props {
  productId: number;
}

export function AddToCartControls({ productId }: Props) {
  const t = useTranslations('developDetail');
  const tCommon = useTranslations('common.buttons');
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const isEn = locale === 'en';
  const L = (id: string, en: string) => (isEn ? en : id);

  function handleAdd() {
    startTransition(async () => {
      const res = await addToCartAction(productId, 1);
      if (!res.ok && res.error) {
        toast.error(res.error);
      } else {
        toast.success(L('Ditambahkan ke keranjang.', 'Added to cart.'));
      }
    });
  }

  function handleBuyNow() {
    startTransition(async () => {
      try {
        await addToCartAndGoAction(productId, 1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : L('Gagal', 'Failed');
        toast.error(msg);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleAdd}
        disabled={pending}
        className="w-full bg-surface text-ink border-2 border-ink px-6 py-3 font-label text-label-sm uppercase font-black tracking-wider shadow-[4px_4px_0_0_var(--color-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? `${tCommon('confirm')}…` : `${t('addToCart')}`}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={pending}
        className="w-full bg-transparent text-ink border-b-2 border-ink px-2 py-2 font-label text-label-sm uppercase font-bold tracking-wider hover:text-primary hover:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {L('Beli Sekarang →', 'Buy Now →')}
      </button>

      <Link
        href="/keranjang"
        className="block text-center text-xs text-ink/50 hover:text-primary font-bold underline decoration-1 underline-offset-4"
      >
        {tCommon('viewAll')}
      </Link>
    </div>
  );
}