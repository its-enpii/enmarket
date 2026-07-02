'use client';

import Link from 'next/link';
import { useTransition } from 'react';

import { addToCartAction, addToCartAndGoAction } from './actions';

interface Props {
  productId: number;
}

/**
 * Tombol "Beli Sekarang" (langsung ke keranjang) + "Tambah ke Keranjang" (in-page).
 */
export function AddToCartControls({ productId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const res = await addToCartAction(productId, 1);
      if (!res.ok && res.error) {
        alert(res.error);
      }
    });
  }

  function handleBuyNow() {
    startTransition(async () => {
      try {
        await addToCartAndGoAction(productId, 1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal';
        alert(msg);
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={pending}
        className="w-full bg-primary text-surface border-2 border-ink px-6 py-4 font-bold text-base shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Memproses…' : 'Beli Sekarang →'}
      </button>

      <button
        type="button"
        onClick={handleAdd}
        disabled={pending}
        className="w-full bg-surface text-ink border-2 border-ink px-6 py-3 font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Tambah ke Keranjang
      </button>

      <Link
        href="/keranjang"
        className="block text-center text-sm text-ink/60 hover:text-primary font-bold underline decoration-2 underline-offset-4"
      >
        Lihat keranjang →
      </Link>
    </div>
  );
}