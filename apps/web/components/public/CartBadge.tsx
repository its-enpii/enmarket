import { getTranslations } from 'next-intl/server';

import { cartApi, PublicFetchError } from '@/lib/cart-api';

import { Button } from '@/components/ui/neobrutal';

/**
 * Cart badge di TopNav — tampilkan jumlah item di cart.
 * Server Component, fetch cart count. Auto-handle cookie-less state.
 */
export async function CartBadge() {
  const t = await getTranslations('cart.badge');
  let count = 0;
  try {
    const res = await cartApi.get();
    count = res.data.item_count ?? 0;
  } catch (err) {
    if (!(err instanceof PublicFetchError)) {
      console.warn('CartBadge fetch failed:', err);
    }
  }

  return (
    <Button
      variant="surface"
      size="sm"
      href="/keranjang"
      aria-label={t('viewCart')}
    >
      <span className="relative inline-flex items-center gap-1.5">
        <span aria-hidden="true">🛒</span>
        <span className="hidden sm:inline">{t('viewCart')}</span>
        {count > 0 && (
          <span className="absolute -top-2 -right-3 sm:right-auto sm:-right-6 bg-accent text-ink border-2 border-ink min-w-[1.75rem] h-7 px-1.5 text-xs font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
    </Button>
  );
}
