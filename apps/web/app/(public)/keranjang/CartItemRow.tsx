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
      <div className="flex items-center border-2 border-ink bg-surface">
        <button
          type="button"
          aria-label="Kurangi"
          onClick={() => setQty(Math.max(0, qty - 1))}
          disabled={disabled || pending || qty <= 1}
          className="px-3 py-1 text-lg font-bold hover:bg-ink hover:text-surface disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="px-3 py-1 min-w-[2.5rem] text-center font-bold border-l-2 border-r-2 border-ink">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Tambah"
          onClick={() => setQty(qty + 1)}
          disabled={disabled || pending}
          className="px-3 py-1 text-lg font-bold hover:bg-ink hover:text-surface disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={remove}
        disabled={disabled || pending}
        className="px-3 py-1 text-xs font-bold text-ink/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Hapus
      </button>
    </div>
  );
}