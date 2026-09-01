import { getTranslations } from 'next-intl/server';

import { cartApi, PublicFetchError } from '@/lib/cart-api';
import { Badge } from '@/components/ui/Badge';
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
      size="md"
      href="/keranjang"
      aria-label={t('viewCart')}
    >
      <span className="relative inline-flex items-center gap-1.5">
        <CartIcon />
        <span className="badge-label">{t('viewCart')}</span>
        {count > 0 && (
          <Badge
            tone="accent"
            size="sm"
            shadow={false}
            className="absolute -top-2 -right-3 sm:right-auto sm:-right-6 min-w-[1.75rem] !h-7 px-1.5 !text-xs font-bold normal-case tracking-normal"
          >
            {count > 99 ? '99+' : count}
          </Badge>
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
      className="block shrink-0"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="20" cy="20" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
