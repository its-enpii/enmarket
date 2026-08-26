import { getTranslations } from 'next-intl/server';

import { wishlistApi, PublicFetchError } from '@/lib/wishlist-api';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/neobrutal';

/**
 * Wishlist badge di TopNav — tampilkan jumlah item di wishlist.
 * Server Component, fetch wishlist count. Auto-handle cookie-less state.
 */
export async function WishlistBadge() {
  const t = await getTranslations('nav');
  let count = 0;
  try {
    const res = await wishlistApi.get();
    count = res.count ?? res.data?.length ?? 0;
  } catch (err) {
    if (!(err instanceof PublicFetchError)) {
      console.warn('WishlistBadge fetch failed:', err);
    }
  }

  return (
    <Button
      variant="surface"
      size="sm"
      href="/wishlist"
      aria-label={t('wishlist')}
    >
      <span className="relative inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="text-red-500">♥</span>
        <span className="hidden sm:inline">{t('wishlist')}</span>
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
