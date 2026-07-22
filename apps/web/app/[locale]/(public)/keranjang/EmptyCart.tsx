/**
 * EmptyCart — empty state halaman keranjang.
 *
 * Layout:
 *   - CartHeader (page hero)
 *   - Section bg-surface dengan Card berisi:
 *       • Icon decorative block (raw div, no Card primitive match — 10px10px
 *         shadow + absolute accent child)
 *       • Eyebrow "✎ Empty"
 *       • Display title "Nothing here yet—discover [something]." dengan Badge
 *         inline sebagai highlight kata terakhir
 *       • Body
 *       • 2 CTAs side-by-side (Develop + Display)
 *
 * Konsisten dengan EmptyState component (`components/public/EmptyState.tsx`)
 * pattern — flex-column + gap. Tapi pakai Card primitive bukan EmptyState,
 * karena EmptyState tidak support Badge inline highlight di title.
 */

import { getTranslations } from 'next-intl/server';

import { Button, Card } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { SectionContainer } from '@/components/public/SectionContainer';

import { CartHeader } from './CartHeader';

export async function EmptyCart() {
  const t = await getTranslations('keranjang');
  return (
    <>
      <CartHeader />

      <section className="border-b-4 border-ink bg-surface">
        <SectionContainer py="xl">
          <Card
            variant="surface"
            hoverable={false}
            className="max-w-2xl mx-auto p-8 md:p-12 flex flex-col items-center gap-6 text-center"
          >
            {/* Decorative icon — raw <div> karena no Card primitive match
                (10px10px shadow + absolute accent child + no hover). */}
            <div className="relative inline-block mb-4">
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
            <h2 className="font-display text-4xl md:text-5xl font-black uppercase leading-[0.95] tracking-tight text-ink">
              {t('emptyTitle1')}<br />
              {t('emptyTitle2')}{' '}
              <Badge
                tone="ink"
                size="sm"
                shadow={false}
                className="-rotate-1 text-accent text-2xl md:text-3xl px-4 py-2 align-middle"
              >
                {t('emptyTitle3')}
              </Badge>
            </h2>
            <p className="text-body-md font-body text-ink/70 max-w-md">
              {t('emptyBody')}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/develop" shadowColor="accent">
                {t('emptyCtaDevelop')}
              </Button>
              <Button variant="surface" size="lg" href="/display" shadowColor="accent">
                {t('emptyCtaDisplay')}
              </Button>
            </div>
          </Card>
        </SectionContainer>
      </section>
    </>
  );
}