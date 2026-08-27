'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, NLink } from '@/components/ui/neobrutal';
import { authApi } from '@/lib/auth-api';
import type { WishlistItem } from '@/lib/types';

export default function AkunWishlistPage() {
  const tNav = useTranslations('account.nav');
  const t = useTranslations('account.wishlistPage');
  const tAcc = useTranslations('account');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await authApi.getWishlist();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      await authApi.removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-ink tracking-tight">
          {tNav('wishlist')}
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {loading ? (
        <Card variant="surface" hoverable={false} className="p-8 text-center">
          <p className="text-sm font-bold text-ink">{tAcc('loadingWishlist')}</p>
        </Card>
      ) : items.length === 0 ? (
        <Card variant="surface" hoverable={false} className="p-12 text-center">
          <p className="text-base font-bold text-ink mb-2">{t('emptyTitle')}</p>
          <p className="text-xs text-ink/70 mb-6">
            {t('emptyHint')}
          </p>
          <Button variant="primary" size="md" href="/katalog">
            {t('exploreCatalog')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id} variant="surface" hoverable={false} className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {item.product?.category?.nama || t('defaultCategory')}
                </span>
                <h3 className="font-bold text-base text-ink mt-1">
                  <NLink href={`/katalog/${item.product?.slug}`}>
                    {item.product?.nama}
                  </NLink>
                </h3>
                <p className="font-mono font-black text-ink text-base mt-2">
                  {item.product?.harga_formatted}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t-2 border-ink">
                <Button
                  variant="primary"
                  size="sm"
                  href={`/katalog/${item.product?.slug}`}
                >
                  {t('viewProduct')}
                </Button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.product_id)}
                  className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors uppercase"
                >
                  {t('remove')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
