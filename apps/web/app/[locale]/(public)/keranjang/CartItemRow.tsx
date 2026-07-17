'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';

import { removeCartItemAction, updateCartItemAction } from './actions';

interface Props {
  productId: number;
  qty: number;
  disabled?: boolean;
}

/**
 * Qty controls + remove button — client component pakai Server Action.
 *
 * Style: chunky neobrutal +/- buttons dengan thick border, hard shadow,
 * press-down mechanic. Sesuai brief cart/chunky controls.
 */
export function CartItemRow({ productId, qty, disabled }: Props) {
  const t = useTranslations('keranjang');
  const [pending, startTransition] = useTransition();

  function setQty(next: number) {
    if (disabled || pending) return;
    startTransition(() => {
      void updateCartItemAction(productId, next);
    });
  }

  function remove() {
    if (disabled || pending) return;
    startTransition(() => {
      void removeCartItemAction(productId);
    });
  }

  return (
    <div className="flex items-center gap-3">
      {/* Chunky +/- group */}
      <div className="flex items-stretch border-2 border-ink bg-surface shadow-[3px_3px_0_0_var(--color-ink)]">
        <Button
          variant="surface"
          size="sm"
          flat
          type="button"
          aria-label={t('decrease')}
          onClick={() => setQty(Math.max(0, qty - 1))}
          disabled={disabled || pending || qty <= 1}
          className="min-w-[44px] min-h-[44px] w-11 h-11"
        >
          −
        </Button>
        <span className="min-w-[3rem] inline-flex items-center justify-center font-display font-black text-lg border-l-2 border-r-2 border-ink bg-surface">
          {qty}
        </span>
        <Button
          variant="surface"
          size="sm"
          flat
          type="button"
          aria-label={t('increase')}
          onClick={() => setQty(qty + 1)}
          disabled={disabled || pending}
          className="min-w-[44px] min-h-[44px] w-11 h-11"
        >
          +
        </Button>
      </div>

      {/* Remove — bordered pill */}
      <Button
        variant="surface"
        size="sm"
        flat
        type="button"
        onClick={remove}
        disabled={disabled || pending}
        className="min-h-[44px] inline-flex items-center gap-1.5"
      >
        <span aria-hidden="true">✕</span>
        {t('remove')}
      </Button>
    </div>
  );
}