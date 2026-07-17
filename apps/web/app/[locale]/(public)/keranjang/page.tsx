/**
 * Cart page — server component, translated.
 */

import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

import { Button, Card } from '@/components/ui/neobrutal';
import { cartApi, PublicFetchError } from '@/lib/cart-api';
import { readCartSession } from '@/lib/cart-session';
import { formatRupiah } from '@/lib/format';

import { CartItemRow } from './CartItemRow';

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

  const subtotal: string = String(cart.total);
  const discount: number = 0;
  const total: string = String(Math.max(0, parseInt(subtotal, 10) - discount));
  const itemCount: number = cart.item_count ?? cart.items.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-16 md:py-20">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
            ✎ Selection
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight text-ink break-words">
              {t('title')}<span className="text-primary">.</span>
            </h1>
            <Link
              href="/develop"
              className="inline-flex items-center gap-2 self-start lg:self-auto font-label text-label-sm uppercase font-bold text-ink/70 hover:text-primary underline decoration-2 underline-offset-4"
            >
              {t('continueShopping')}
            </Link>
          </div>
          <p className="mt-8 font-body text-body-lg italic text-ink/80 max-w-2xl border-l-4 border-accent pl-6">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-12 items-start">
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

          <div className="lg:sticky lg:top-24">
            <SummaryBlock
              subtotal={subtotal}
              discount={discount}
              total={total}
              itemCount={itemCount}
            />
            <TrustNote />
          </div>
        </div>
      </section>
    </>
  );
}

async function CartItem({
  item,
}: {
  item: Awaited<ReturnType<typeof cartApi.get>>['data']['items'][number];
}) {
  const t = await getTranslations('keranjang');
  const p = item.product;
  const thumb = p.preview_images?.[0];
  const category = p.category?.nama ?? null;

  return (
    <Card variant="surface" as="article" hoverable={false} className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/develop/${p.slug}`}
          className="shrink-0 block sm:w-32 sm:h-32 aspect-video sm:aspect-square border-b-2 sm:border-b-0 sm:border-r-2 border-ink overflow-hidden bg-primary/10"
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={p.nama}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-xs text-center px-3">
              {p.nama}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {category && (
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-1">
                  {category}
                </p>
              )}
              <Link
                href={`/develop/${p.slug}`}
                className="block font-display text-lg sm:text-xl font-black uppercase tracking-tight text-ink leading-tight hover:text-primary transition-colors"
              >
                {p.nama}
              </Link>
            </div>
            <span className="shrink-0 inline-flex items-center bg-accent text-ink border-2 border-ink px-3 py-1.5 font-display font-black text-sm sm:text-base uppercase shadow-[2px_2px_0_0_var(--color-ink)]">
              {p.harga_formatted}
            </span>
          </div>

          <div className="flex items-baseline gap-2 border-l-2 border-ink/20 pl-3">
            <span className="font-label text-[10px] uppercase tracking-wider text-ink/50">
              {t('subtotal')}
            </span>
            <span className="font-display font-black text-base text-ink">
              {item.subtotal_formatted}
            </span>
            {item.qty > 1 && (
              <span className="font-label text-[10px] uppercase text-ink/50">
                × {item.qty}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t-2 border-ink/10">
            <CartItemRow productId={item.product_id} qty={item.qty} />
          </div>
        </div>
      </div>
    </Card>
  );
}

async function SummaryBlock({
  subtotal,
  discount,
  total,
  itemCount,
}: {
  subtotal: string;
  discount: number;
  total: string;
  itemCount: number;
}) {
  const t = await getTranslations('keranjang');
  return (
    <Card variant="filled-primary" as="aside" thick hoverable={false}>
      <div className="p-6 md:p-8 space-y-5">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent">
          ✎ {t('summary')}
        </p>
        <div className="flex items-baseline justify-between border-b border-surface/20 pb-3">
          <span className="font-label text-label-sm uppercase tracking-wider text-surface/80">
            {t('subtotal')}
          </span>
          <span className="font-display font-black text-lg text-surface">
            {formatRupiah(String(subtotal))}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex items-baseline justify-between border-b border-surface/20 pb-3">
            <span className="font-label text-label-sm uppercase tracking-wider text-accent">
              {t('discount')}
            </span>
            <span className="font-display font-black text-lg text-accent">
              − {formatRupiah(String(discount))}
            </span>
          </div>
        )}
        <div className="pt-2">
          <p className="font-label text-label-sm uppercase tracking-[0.2em] text-surface/70 mb-2">
            {t('total')}
          </p>
          <div className="inline-flex items-center bg-accent text-ink border-2 border-ink px-4 py-3 shadow-[4px_4px_0_0_var(--color-surface)]">
            <span className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight">
              {formatRupiah(String(total))}
            </span>
          </div>
          <p className="mt-3 font-label text-[10px] uppercase tracking-wider text-surface/60">
            {itemCount} {t('itemsSuffix')}
          </p>
        </div>

        <Button
          variant="surface"
          size="lg"
          href="/checkout"
          shadowColor="accent"
          className="w-full mt-2"
        >
          {t('checkout')}
        </Button>

        <p className="text-center font-label text-[10px] uppercase tracking-wider text-surface/60">
          {t('paymentNote')}
        </p>
      </div>
    </Card>
  );
}

async function TrustNote() {
  const t = await getTranslations('keranjang');
  return (
    <Card variant="surface" hoverable={false} className="mt-6 p-5">
      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
        {t('trustNoteEyebrow')}
      </p>
      <p className="font-display text-base font-black uppercase leading-tight text-ink">
        {t('trustNoteTitle')}
      </p>
      <p className="mt-2 font-body text-xs text-ink/70 leading-snug">
        {t('trustNoteBody')}
      </p>
    </Card>
  );
}

async function EmptyCart() {
  const t = await getTranslations('keranjang');
  return (
    <>
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-16 md:py-20">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
            ✎ {t('selection')}
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight text-ink">
            {t('title')}<span className="text-primary">.</span>
          </h1>
        </div>
      </section>

      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-12">
              <div className="w-40 h-40 md:w-48 md:h-48 bg-primary border-4 border-ink shadow-[10px_10px_0_0_var(--color-ink)] flex items-center justify-center">
                <span className="font-display text-6xl md:text-7xl font-black uppercase text-surface">
                  ✎
                </span>
              </div>
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -right-6 w-20 h-20 bg-accent border-4 border-ink shadow-[6px_6px_0_0_var(--color-ink)] z-10"
              />
            </div>

            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent">
              {t('emptyEyebrow')}
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-black uppercase leading-[0.95] tracking-tight text-ink">
              {t('emptyTitle1')}<br />
              {t('emptyTitle2')}{' '}
              <span className="inline-block bg-ink text-accent px-2 py-0.5 -rotate-1">
                {t('emptyTitle3')}
              </span>
            </h2>
            <p className="mt-6 font-body text-body-md text-ink/70 max-w-md mx-auto">
              {t('emptyBody')}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                href="/develop"
                shadowColor="accent"
              >
                {t('emptyCtaDevelop')}
              </Button>
              <Button
                variant="surface"
                size="lg"
                href="/display"
              >
                {t('emptyCtaDisplay')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

async function ErrorState({ message }: { message: string }) {
  const t = await getTranslations('keranjang');
  return (
    <>
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-16 md:py-20">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
            ✎ {t('selection')}
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight text-ink">
            {t('title')}<span className="text-primary">.</span>
          </h1>
        </div>
      </section>

      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-20">
          <div className="max-w-2xl mx-auto">
          <Card variant="surface" thick hoverable={false} className="max-w-2xl mx-auto p-8">
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
              {t('errorEyebrow')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight text-ink mb-4">
              {t('errorTitle')}
            </h2>
            <p className="font-body text-body-md text-ink/70 mb-6">{message}</p>
            <Button
              variant="primary"
              size="md"
              href="/develop"
              shadowColor="accent"
            >
              {t('errorAction')}
            </Button>
          </Card>
          </div>
        </div>
      </section>
    </>
  );
}