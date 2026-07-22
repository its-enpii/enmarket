/**
 * CartHeader — section hero halaman keranjang.
 *
 * Pakai `<PageHeader>` primitive dari `components/public/`. Actions slot
 * berisi NLink "Continue Shopping" yang align kanan di desktop.
 */

import { getTranslations } from 'next-intl/server';

import { NLink } from '@/components/ui/neobrutal';
import { PageHeader } from '@/components/public/PageHeader';

export async function CartHeader() {
  const t = await getTranslations('keranjang');
  return (
    <PageHeader
      eyebrow={t('selection')}
      title={t('title')}
      subtitle={t('subtitle')}
      actions={
        <NLink
          href="/develop"
          variant="default"
          underline="static"
          className="font-label text-label-sm uppercase font-bold text-ink/70 hover:text-primary"
        >
          {t('continueShopping')}
        </NLink>
      }
    />
  );
}