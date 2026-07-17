'use client';

import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Button } from '@/components/ui/neobrutal';
import { toast } from '@/components/ui/toast-store';

import { addToCartAction, addToCartAndGoAction } from './actions';

interface Props {
  productId: number;
}

export function AddToCartControls({ productId }: Props) {
  const t = useTranslations('developDetail');
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const res = await addToCartAction(productId, 1);
      if (!res.ok && res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('added'));
      }
    });
  }

  function handleBuyNow() {
    startTransition(async () => {
      try {
        await addToCartAndGoAction(productId, 1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('addError');
        toast.error(msg);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="surface"
        size="lg"
        disabled={pending}
        onClick={handleAdd}
        className="w-full"
      >
        {pending ? t('adding') : t('addToCart')}
      </Button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={pending}
        className="w-full bg-transparent text-ink border-b-2 border-ink px-2 py-2 font-label text-label-sm uppercase font-bold tracking-wider hover:text-primary hover:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('buyNow')}
      </button>

      <a
        href="/keranjang"
        className="block text-center text-xs text-ink/50 hover:text-primary font-bold underline decoration-1 underline-offset-4"
      >
        {t('viewCart')}
      </a>
    </div>
  );
}