'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { toast } from '@/components/ui/toast-store';
import { toggleWishlistAction } from '@/app/[locale]/(public)/wishlist/actions';

interface Props {
  productId: number;
  initialWishlisted?: boolean;
  className?: string;
}

export function WishlistHeartButton({
  productId,
  initialWishlisted = false,
  className = '',
}: Props) {
  const t = useTranslations('wishlist');
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    const nextState = !wishlisted;
    setWishlisted(nextState);

    startTransition(async () => {
      const res = await toggleWishlistAction(productId);
      if (!res.ok) {
        setWishlisted(!nextState);
        toast.error(res.error || 'Error');
      } else {
        toast.success(res.added ? t('add') : t('remove'));
      }
    });
  };

  return (
    <Button
      type="button"
      variant="surface"
      size="sm"
      onClick={handleToggle}
      aria-label={wishlisted ? t('remove') : t('add')}
      className={`w-8 h-8 px-0 py-0 ${
        wishlisted ? 'text-danger hover:text-danger' : 'text-ink/70 hover:text-ink hover:bg-accent'
      } ${className}`}
    >
      <span className="text-base leading-none select-none">
        {wishlisted ? '♥' : '♡'}
      </span>
    </Button>
  );
}
