import { getTranslations } from 'next-intl/server';

import { wishlistApi, PublicFetchError } from '@/lib/wishlist-api';

import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui';
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
      size="md"
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
