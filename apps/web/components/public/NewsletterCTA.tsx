'use client';

import { useTranslations } from 'next-intl';

import { Button, Card, Eyebrow } from '@/components/ui/neobrutal';

/**
 * Newsletter / update CTA — banner besar sebelum footer.
 *
 * Catatan: backend newsletter belum ada, jadi tidak ada form sungguhan.
 * Pakai CTA ke katalog + kontak publik untuk sementara — tone marketplace,
 * tidak berjanji fitur yang belum jalan.
 *
 * Tone: ajakan informal, warna ink+accent (kontras tinggi, jadi penutup visual).
 */
export function NewsletterCTA() {
  const t = useTranslations('newsletter');
  return (
    <Card
      aria-label={t('ariaLabel')}
      as="section"
      variant="ink"
      thick
      hoverable={false}
      shadowColor="accent"
      elevation={6}
      className="p-6 sm:p-10 relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 w-32 h-32 bg-accent border-2 border-accent rotate-12"
      />
      <div
        aria-hidden="true"
        className="absolute right-10 bottom-4 w-16 h-16 bg-primary border-2 border-primary"
      />
      <div className="relative max-w-2xl">
        <Eyebrow size="md" color="accent" className="text-micro sm:text-xs tracking-label">
          {t('eyebrow')}
        </Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-4xl font-bold leading-tight">
          {t('heading')}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-surface/80 leading-relaxed">
          {t('body')}
        </p>
        <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
          <Button variant="accent" size="md" href="/develop">
            {t('ctaCatalog')}
          </Button>
          <Button variant="outline" size="md" href="/cek-pesanan" className="border-surface text-surface hover:bg-surface hover:text-ink">
            {t('ctaOrders')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
