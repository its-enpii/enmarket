'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { CART_EVENT } from '@/lib/cart-events';
import { fetchCartCount, hasBadgeIdentity } from '@/lib/badge-count';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/neobrutal';

/**
 * Cart badge di TopNav ? tampilkan jumlah item di cart.
 * Client Component, fetch cart count di sisi klien. Auto-handle cookie-less state.
 * (Fetch client-side agar route tree tidak bergantung pada session server → bisa ISR.)
 */
export function CartBadge() {
  const t = useTranslations('cart.badge');
  const [count, setCount] = useState(0);

  const loadCount = useCallback((skipWithoutIdentity = false) => {
    let cancelled = false;
    if (skipWithoutIdentity && !hasBadgeIdentity('cart')) {
      return () => {
        cancelled = true;
      };
    }
    fetchCartCount()
      .then((value) => {
        if (!cancelled) setCount(value);
      })
      .catch((err) => {
        console.warn('CartBadge fetch failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadCount(true), [loadCount]);

  // Re-fetch saat ada mutasi cart di tempat lain (add/update/remove).
  useEffect(() => {
    const onCartChanged = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail = event.detail as { kind?: string } | undefined;
      if (detail?.kind && detail.kind !== 'cart') return;
      loadCount();
    };
    window.addEventListener(CART_EVENT, onCartChanged);
    return () => window.removeEventListener(CART_EVENT, onCartChanged);
  }, [loadCount]);

  return (
    <Button
      variant="surface"
      size="icon"
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
            height="28"
            fontSize="xs"
            className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 text-[10px] leading-none font-bold normal-case tracking-normal flex items-center justify-center pointer-events-none"
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
