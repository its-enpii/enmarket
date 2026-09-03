import { getTranslations } from 'next-intl/server';

import { EmptyState } from '@/components/public/EmptyState';
import { Card, Eyebrow, NLink } from '@/components/ui/neobrutal';
import { cartApi, PublicFetchError } from '@/lib/cart-api';
import { readCartSession } from '@/lib/cart-session';
import { getEnabledGateways } from '@/lib/payment-api';
import { buildMetadata } from '@/lib/seo';

import { CheckoutForm } from './CheckoutForm';
import { PageTitle } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return buildMetadata({
    title: `${t('title')} — enpiistudio`,
    description: t('subtitle'),
  });
}

export default async function CheckoutPage() {
  await readCartSession();
  const t = await getTranslations('checkout');
  const tKeranjang = await getTranslations('keranjang');
  const tCommon = await getTranslations('common.buttons');

  let cart;
  try {
    cart = (await cartApi.get()).data;
  } catch (err) {
    if (err instanceof PublicFetchError) {
      return (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <EmptyState
            title={t('errorLoad')}
            message={err.message}
            cta={{ href: '/develop', label: `${tCommon('viewAll')} →` }}
          />
        </div>
      );
    }
    throw err;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <EmptyState
          title={tKeranjang('empty')}
          message={tKeranjang('continueShopping')}
          cta={{ href: '/develop', label: `${tCommon('viewAll')} →` }}
        />
      </div>
    );
  }

  const enabledGateways = await getEnabledGateways();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12">
      {/* Page header — neobrutalism eyebrow + display headline */}
      <div className="mb-8 border-b-4 border-ink pb-6">
        <Eyebrow size="md" color="accent" className="mb-3">
          ✎ {t('title')}
        </Eyebrow>
        <PageTitle size="hero">
          {t('title')}<span className="text-primary">.</span>
        </PageTitle>
        <p className="mt-3 text-sm text-ink/60 max-w-2xl">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8">
        <Card variant="surface" thick hoverable={false} className="p-6">
          <CheckoutForm cartTotal={cart.total} enabledGateways={enabledGateways} />
        </Card>

        <Card variant="filled-primary" as="aside" thick hoverable={false} className="p-5 h-fit">
          <Eyebrow as="h2" size="label-lg" color="accent" className="mb-4 border-b border-surface/30 pb-2">
            ✎ {t('orderSummary')}
          </Eyebrow>
          <ul className="space-y-3 mb-5">
            {cart.items.map((item) => (
              <li key={item.product_id} className="flex justify-between gap-2 text-sm border-b border-surface/10 pb-2 last:border-b-0">
                <span className="truncate">
                  {item.product.nama} <span className="opacity-70 font-mono">× {item.qty}</span>
                </span>
                <span className="font-bold shrink-0">{item.subtotal_formatted}</span>
              </li>
            ))}
          </ul>
          <div className="border-t-2 border-surface/30 pt-3">
            <Eyebrow size="micro" className="opacity-80 mb-1">{t('total')}</Eyebrow>
            <p className="font-display text-3xl font-black leading-none">{cart.total_formatted}</p>
          </div>
          <p className="mt-4 text-xs opacity-70 border-t border-surface/20 pt-3">
            {t('paymentMethod')}
          </p>
        </Card>
      </div>

      <p className="mt-6 text-center text-sm">
        <NLink
          href="/keranjang"
          variant="default"
          underline="static"
          className="text-ink/60 hover:text-primary font-bold"
        >
          {t('backToCart')}
        </NLink>
      </p>
    </div>
  );
}
