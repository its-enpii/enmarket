/**
 * Footer — Neobrutalism enpiistudio.
 *
 * Server component; ambil strings via getTranslations.
 */

import { getTranslations } from 'next-intl/server';

import { Card, NLink } from '@/components/ui/neobrutal';

export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tCommon = await getTranslations('common.site');
  return (
    <footer className="bg-ink text-surface">
      <div className="px-6 md:px-12 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
          {/* Left col: brand */}
          <div className="flex flex-col gap-8">
            <h3 className="font-display text-headline-xl font-black uppercase leading-none">
              ENPII
              <br />
              STUDIO
            </h3>
            <p className="font-body text-body-lg text-surface/80 max-w-md">
              {tCommon('description')}
            </p>

            {/* Color swatches — brand indicator */}
            <div className="flex gap-6">
              <span
                className="w-8 h-8 bg-primary border-4 border-surface"
                aria-label="Primary"
              />
              <span
                className="w-8 h-8 bg-accent border-4 border-surface"
                aria-label="Accent"
              />
              <span
                className="w-8 h-8 bg-surface border-4 border-surface"
                aria-label="Surface"
              />
            </div>
          </div>

          {/* Right col: newsletter + links */}
          <div className="flex flex-col gap-12">
            <Card variant="surface" thick hoverable={false} className="p-8">
              <p className="font-label text-label-sm font-black mb-4 uppercase">
                {t('subscribeTitle')}
              </p>
              <form
                action="#"
                method="post"
                className="flex border-4 border-ink"
              >
                <input
                  type="email"
                  name="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  className="bg-surface px-4 py-4 w-full min-w-0 font-label text-label-sm focus:ring-0 focus:outline-none border-none rounded-none"
                />
                <button
                  type="submit"
                  aria-label={t('subscribeAria')}
                  className="bg-ink text-surface px-6 py-4 border-l-4 border-ink hover:bg-primary transition-colors"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            </Card>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <h4 className="font-label text-label-sm font-black uppercase mb-2">
                  {t('connectTitle')}
                </h4>
                <NLink href="#" variant="on-dark" underline="none">
                  {t('links.contact')}
                </NLink>
                <NLink href="#" variant="on-dark" underline="none">
                  {t('links.instagram')}
                </NLink>
                <NLink href="#" variant="on-dark" underline="none">
                  {t('links.arena')}
                </NLink>
                <NLink href="#" variant="on-dark" underline="none">
                  {t('links.twitter')}
                </NLink>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="font-label text-label-sm font-black uppercase mb-2">
                  {t('studioTitle')}
                </h4>
                <NLink href="/katalog" variant="on-dark" underline="none">
                  {t('studioLinks.catalog')}
                </NLink>
                <NLink href="/display" variant="on-dark" underline="none">
                  {t('studioLinks.journal')}
                </NLink>
                <NLink href="/cek-pesanan" variant="on-dark" underline="none">
                  {t('studioLinks.orders')}
                </NLink>
                <NLink href="/login" variant="on-dark" underline="none">
                  {tNav('admin')}
                </NLink>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-surface/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-label text-label-sm uppercase text-surface/50">
          <span>{t('copyright', { year: new Date().getFullYear() })}</span>
          <span>{t('poweredBy')}</span>
        </div>
      </div>
    </footer>
  );
}
