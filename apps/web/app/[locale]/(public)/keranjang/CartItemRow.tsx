'use client';

import { useTransition } from 'react';

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
        <button
          type="button"
          aria-label="Kurangi"
          onClick={() => setQty(Math.max(0, qty - 1))}
          disabled={disabled || pending || qty <= 1}
          className="w-10 h-10 inline-flex items-center justify-center font-display font-black text-lg hover:bg-ink hover:text-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="min-w-[3rem] inline-flex items-center justify-center font-display font-black text-lg border-l-2 border-r-2 border-ink bg-surface">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Tambah"
          onClick={() => setQty(qty + 1)}
          disabled={disabled || pending}
          className="w-10 h-10 inline-flex items-center justify-center font-display font-black text-lg hover:bg-ink hover:text-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>

      {/* Remove — bordered pill */}
      <button
        type="button"
        onClick={remove}
        disabled={disabled || pending}
        className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-ink bg-surface font-label text-[10px] uppercase font-bold tracking-wider hover:bg-ink hover:text-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <span aria-hidden="true">✕</span>
        Remove
      </button>
    </div>
  );
}