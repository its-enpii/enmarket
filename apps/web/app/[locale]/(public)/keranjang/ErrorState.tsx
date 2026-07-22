/**
 * ErrorState — fallback saat PublicFetchError saat fetch cart.
 *
 * Layout: CartHeader + section bg-surface dengan Card berisi
 * eyebrow + title + error message + CTA kembali ke Develop.
 */

import { getTranslations } from 'next-intl/server';

import { Button, Card } from '@/components/ui/neobrutal';
import { SectionContainer } from '@/components/public/SectionContainer';

import { CartHeader } from './CartHeader';

export async function ErrorState({ message }: { message: string }) {
  const t = await getTranslations('keranjang');
  return (
    <>
      <CartHeader />
      <section className="border-b-4 border-ink bg-surface">
        <SectionContainer py="xl">
          <Card variant="surface" thick hoverable={false} className="max-w-2xl mx-auto p-8">
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
              {t('errorEyebrow')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight text-ink mb-4">
              {t('errorTitle')}
            </h2>
            <p className="font-body text-body-md text-ink/70 mb-6">{message}</p>
            <Button variant="primary" size="md" href="/develop" shadowColor="accent">
              {t('errorAction')}
            </Button>
          </Card>
        </SectionContainer>
      </section>
    </>
  );
}