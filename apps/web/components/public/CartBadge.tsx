import Link from 'next/link';

import { cartApi, PublicFetchError } from '@/lib/cart-api';

/**
 * Cart badge di TopNav — tampilkan jumlah item di cart.
 * Server Component, fetch cart count. Auto-handle cookie-less state.
 */
export async function CartBadge() {
  let count = 0;
  try {
    const res = await cartApi.get();
    count = res.data.item_count ?? 0;
  } catch (err) {
    if (!(err instanceof PublicFetchError)) {
      // unknown error — silent fail
      console.warn('CartBadge fetch failed:', err);
    }
    // PublicFetchError atau unknown → tampilkan badge 0
  }

  return (
    <Link
      href="/keranjang"
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-surface text-ink border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] transition-all"
      aria-label={`Keranjang (${count} item)`}
    >
      <span aria-hidden="true">🛒</span>
      <span className="hidden sm:inline">Keranjang</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-accent text-ink border-2 border-ink min-w-[1.25rem] h-5 px-1 text-xs font-bold flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}