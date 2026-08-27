import { getTranslations } from 'next-intl/server';

import { cartApi, PublicFetchError } from '@/lib/cart-api';
import { Button } from '@/components/ui/neobrutal';

/**
 * Cart badge di TopNav ? tampilkan jumlah item di cart.
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
      <span className="inline-flex items-center gap-2">
        <CartIcon />
        <span className="hidden sm:inline">{t('viewCart')}</span>
        {count > 0 && (
          <span className="inline-flex items-center justify-center bg-accent text-ink font-black text-xs px-2 py-0.5 border border-ink shadow-[1px_1px_0_0_var(--color-ink)] min-w-[1.25rem] rounded-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
    </Button>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="20" cy="20" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
