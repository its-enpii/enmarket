'use client';

import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Button, NLink } from '@/components/ui/neobrutal';
import { Icon } from '@/components/ui';
import { toast } from '@/components/ui/toast-store';

import { addToCartAction, addToCartAndGoAction } from './actions';

interface Props {
  productId: number;
  /** Produk pre-orderable: ganti label CTA + message. */
  isPreOrder?: boolean;
  /** Produk gratis: ganti label CTA + skip payment wording di checkout. */
  isFree?: boolean;
  /** Deposit percent (1-100) untuk label CTA. */
  depositPercent?: number | null;
}

export function AddToCartControls({ productId, isPreOrder = false, isFree = false, depositPercent }: Props) {
  const t = useTranslations('developDetail');
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const res = await addToCartAction(productId, 1);
      if (!res.ok && res.error) {
        toast.error(res.error);
      } else {
        const successMsg = isFree
          ? t('freeAdded')
          : isPreOrder
            ? t('preorderAdded')
            : t('added');
        toast.success(successMsg);
      }
    });
  }

  function handleBuyNow() {
    startTransition(async () => {
      try {
        await addToCartAndGoAction(productId, 1);
      } catch (err) {
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
        toast.error(err instanceof Error ? err.message : t('addError'));
      }
    });
  }

  // Label CTA: free > pre-order > normal precedence. Free produk tidak punya
  // pre-order (ProductController reject kombinasi), jadi branch cuma 2 cabang.
  const dpLabel = depositPercent ?? 50;
  const primaryLabel = pending
    ? t('adding')
    : isFree
      ? t('freeCta')
      : isPreOrder
        ? t('addToCartPreOrder', { percent: dpLabel })
        : t('addToCart');
  const buyNowTranslation = isFree
    ? t('freeBuyNow')
    : isPreOrder
      ? t('buyNowPreOrder')
      : t('buyNow');
  const buyNowLabel = (
    <span className="inline-flex items-center gap-2">
      {buyNowTranslation}
      <Icon name="arrow-right" />
    </span>
  );

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
        {primaryLabel}
      </Button>

      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={handleBuyNow}
        disabled={pending}
        className="w-full"
      >
        {buyNowLabel}
      </Button>

      <NLink
        href="/keranjang"
        variant="default"
        underline="hover"
        className="block text-center text-xs text-ink/50 font-bold"
      >
        {t('viewCart')}
      </NLink>
    </div>
  );
}
