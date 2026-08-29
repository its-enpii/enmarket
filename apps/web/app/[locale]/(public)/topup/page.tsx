import { getTranslations } from 'next-intl/server';


import { SectionContainer } from '@/components/public/SectionContainer';
import { PageHeader } from '@/components/public/PageHeader';
import { Card } from '@/components/ui/neobrutal';
import type { Game } from '@/lib/types';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api:8000';

async function loadGames(): Promise<Game[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/topup/games`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'topup' });
  return { title: t('title') };
}

export default async function TopupPage() {
  const [games, t] = await Promise.all([
    loadGames(),
    getTranslations('topup'),
  ]);

  return (
    <div className="bg-transparent py-8 md:py-16">
      <SectionContainer>
        <PageHeader eyebrow="Top Up" title={t('title')} subtitle={t('subtitle')} />

        {games.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-body-md text-ink/60">{t('noGames')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
            {games.map((game) => (
              <Card key={game.id} href={`/topup/${game.slug}`} variant="surface" className="p-4 text-center group">
                {game.icon_url ? (
                  <img
                    src={game.icon_url}
                    alt={game.nama}
                    className="w-16 h-16 mx-auto mb-3 rounded-lg border-2 border-ink object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg border-2 border-ink bg-accent/20 flex items-center justify-center text-2xl">
                    🎮
                  </div>
                )}
                <p className="font-label text-sm font-bold text-ink truncate">{game.nama}</p>
                {game.brand && (
                  <p className="text-xs text-ink/50 mt-1">{game.brand}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </SectionContainer>
    </div>
  );
}
