/**
 * ErrorState — fallback saat PublicFetchError saat fetch cart.
 *
 * Layout: CartHeader + section bg-surface dengan Card berisi
 * eyebrow + title + error message + CTA kembali ke Develop.
 */

import { getTranslations } from 'next-intl/server';

import { EmptyState } from '@/components/ui';
import { SectionContainer } from '@/components/public/SectionContainer';
import { SectionBand } from '@/components/ui';

import { CartHeader } from './CartHeader';

export async function ErrorState({ message }: { message: string }) {
  const t = await getTranslations('keranjang');
  return (
    <>
      <CartHeader />
      <SectionBand>
        <SectionContainer py="xl">
          <div className="max-w-2xl mx-auto">
            <EmptyState
              variant="public"
              eyebrow={t('errorEyebrow')}
              title={t('errorTitle')}
              message={message}
              cta={{ href: '/develop', label: t('errorAction') }}
            />
          </div>
        </SectionContainer>
      </SectionBand>
    </>
  );
}
