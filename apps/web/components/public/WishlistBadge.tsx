'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { getClientApiBase } from '@/lib/client-api';
import { CART_EVENT } from '@/lib/cart-events';
import type { WishlistResponse } from '@/lib/types';

import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui';
import { Button } from '@/components/ui/neobrutal';

/**
 * Wishlist badge di TopNav — tampilkan jumlah item di wishlist.
 * Client Component, fetch wishlist count di sisi klien. Auto-handle cookie-less state.
 * (Fetch client-side agar route tree tidak bergantung pada session server → bisa ISR.)
 */
export function WishlistBadge() {
  const t = useTranslations('nav');
  const [count, setCount] = useState(0);

  const loadCount = useCallback(() => {
    let cancelled = false;
    fetch(`${getClientApiBase()}/api/wishlist`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })
      .then((res) => (res.ok ? (res.json() as Promise<WishlistResponse>) : null))
      .then((res) => {
        if (!cancelled && res) setCount(res.count ?? res.data?.length ?? 0);
      })
      .catch((err) => {
        console.warn('WishlistBadge fetch failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadCount(), [loadCount]);

  // Re-fetch saat wishlist berubah (toggle/unlike dari mana pun).
  useEffect(() => {
    const onCartChanged = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail = event.detail as { kind?: string } | undefined;
      if (detail?.kind && detail.kind !== 'wishlist') return;
      loadCount();
    };
    window.addEventListener(CART_EVENT, onCartChanged);
    return () => window.removeEventListener(CART_EVENT, onCartChanged);
  }, [loadCount]);

  return (
    <Button
      variant="surface"
      size="icon"
      href="/wishlist"
      aria-label={t('wishlist')}
    >
      <span className="relative inline-flex items-center gap-1.5">
        <Icon name="heart" size={16} className="text-danger" />
        <span className="badge-label">{t('wishlist')}</span>
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
