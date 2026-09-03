import { getTranslations } from 'next-intl/server';
import { SectionContainer } from '@/components/public/SectionContainer';
import { SectionTitle } from '@/components/ui';
import { Card } from '@/components/ui/neobrutal';
import { Image } from '@/components/ui/Image';
import type { PublicSponsor } from '@/lib/types';

interface Props {
  sponsors?: PublicSponsor[];
}

/**
 * SponsorsSection — Neobrutalism Sponsor Grid for Homepage.
 * Renders top active sponsors with logo, name, description, and external link.
 * Only rendered when at least 1 active sponsor exists.
 */
export async function SponsorsSection({ sponsors }: Props) {
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  const t = await getTranslations('home');

  return (
    <section id="sponsors" className="border-b-4 border-ink bg-surface">
      <SectionContainer py="xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <SectionTitle className="leading-none">
              {t('sponsorsTitle')}
            </SectionTitle>
          </div>
          <div className="font-label text-label-sm uppercase tracking-widest text-ink/70">
            {t('sponsorsSubtitle')}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block group"
            >
              <Card
                variant="surface"
                hoverable
                thick
                className="h-full flex flex-col justify-between p-6 border-4 border-ink bg-surface"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 border-2 border-ink bg-surface flex items-center justify-center shrink-0 overflow-hidden shadow-brutal-2">
                      {sponsor.logo_url ? (
                        <Image
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="font-display font-black text-primary text-xl uppercase">
                          {sponsor.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-black uppercase text-primary truncate group-hover:underline underline-offset-4 decoration-2">
                        {sponsor.name}
                      </h3>
                      <p className="font-mono text-fine text-ink/60 truncate">
                        {sponsor.url.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                  </div>

                  {sponsor.description && (
                    <p className="font-body text-body-md text-ink/80 line-clamp-3 mb-6">
                      {sponsor.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t-2 border-ink/20 flex items-center justify-between font-label text-label-sm font-bold uppercase text-primary">
                  <span>{t('visitSponsor')}</span>
                  <span className="font-mono text-base transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
