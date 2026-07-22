/**
 * Cart page — orchestrator (server component).
 *
 * Flow:
 *   1. readCartSession() → cookie sync (no-op kalau sudah ada)
 *   2. cartApi.get() → fetch cart
 *   3. Render: empty | error | items + summary
 *
 * Semua bagian visual di-split ke file lain di folder ini:
 *   - CartHeader.tsx   — page hero
 *   - CartItem.tsx     — kartu item
 *   - CartItemRow.tsx  — qty controls (client, tetap)
 *   - SummaryBlock.tsx — sticky aside checkout
 *   - TrustNote.tsx    — catatan studio
 *   - EmptyCart.tsx    — empty state
 *   - ErrorState.tsx   — error state
 *   - actions.ts       — server actions (tetap)
 *
 * Pattern header generic dari PageHeader primitive (`components/public/`).
 */

import { getTranslations } from 'next-intl/server';

import { cartApi, PublicFetchError } from '@/lib/cart-api';
import { readCartSession } from '@/lib/cart-session';
import { SectionContainer } from '@/components/public/SectionContainer';

import { CartHeader } from './CartHeader';
import { CartItem } from './CartItem';
import { EmptyCart } from './EmptyCart';
import { ErrorState } from './ErrorState';
import { SummaryBlock } from './SummaryBlock';
import { TrustNote } from './TrustNote';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'keranjang' });
  return {
    title: `${t('title')} — enpiistudio`,
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/keranjang` },
  };
}

export default async function KeranjangPage() {
  await readCartSession();
  const t = await getTranslations('keranjang');

  let cart;
  try {
    cart = (await cartApi.get()).data;
  } catch (err) {
    if (err instanceof PublicFetchError) {
      return <ErrorState message={err.message} />;
    }
    throw err;
  }

  if (cart.items.length === 0) {
    return <EmptyCart />;
  }

  const subtotal: number = cart.total;
  const discount: number = 0;
  const total: number = Math.max(0, subtotal - discount);
  const itemCount: number = cart.item_count ?? cart.items.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      <CartHeader />

      <section className="border-b-4 border-ink">
        <SectionContainer py="md" className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
              <h2 className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/70">
                ✎ {t('selectedWorks')}
              </h2>
              <span className="font-label text-label-sm uppercase tracking-wider text-ink/60">
                {itemCount} {t('itemsSuffix')}
              </span>
            </div>
            <div className="space-y-5">
              {cart.items.map((item) => (
                <CartItem key={item.product_id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 space-y-6">
            <SummaryBlock
              subtotal={subtotal}
              discount={discount}
              total={total}
              itemCount={itemCount}
              items={cart.items}
            />
            <TrustNote />
          </div>
        </SectionContainer>
      </section>
    </>
  );
}