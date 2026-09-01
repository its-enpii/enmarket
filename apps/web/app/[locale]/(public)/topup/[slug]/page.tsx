import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getApiBase } from '@/lib/api-base';


import { SectionContainer } from '@/components/public/SectionContainer';
import { Card, NLink } from '@/components/ui/neobrutal';
import type { Game } from '@/lib/types';

import { TopupForm } from './TopupForm';
import { Image } from '@/components/ui/Image';

export const dynamic = 'force-dynamic';

const API_URL = getApiBase();

async function loadGame(slug: string): Promise<Game | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/topup/games/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const game = await loadGame(slug);
  if (!game) {
    return buildMetadata({ title: 'Not Found' });
  }
  const t = await getTranslations({ locale, namespace: 'topup' });
  return buildMetadata({
    title: `${t('title')} — ${game.nama}`,
  });
}

export default async function TopupGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [game, t] = await Promise.all([
    loadGame(slug),
    getTranslations('topup'),
  ]);

  if (!game) {
    notFound();
  }

  return (
    <div className="bg-transparent py-8 md:py-16">
      <SectionContainer>
        <NLink href="/topup" variant="primary" underline="hover" className="font-label text-sm font-bold mb-4 inline-block">
          {t('backToGames')}
        </NLink>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Game info */}
          <div className="lg:w-1/3">
            <Card variant="surface" hoverable={false} className="p-6">
              {game.banner_url ? (
                <Image
                  src={game.banner_url}
                  alt={game.nama}
                  className="w-full h-40 border-4 border-ink mb-4"
                />
              ) : game.icon_url ? (
                <Image
                  src={game.icon_url}
                  alt={game.nama}
                  className="w-20 h-20 rounded-lg border-4 border-ink mb-4"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg border-4 border-ink bg-accent/20 flex items-center justify-center text-3xl mb-4">
                  🎮
                </div>
              )}
              <h1 className="font-display text-3xl font-black text-ink">{game.nama}</h1>
              {game.brand && (
                <p className="text-sm text-ink/60 mt-1">{game.brand}</p>
              )}
              {game.description && (
                <p className="text-sm text-ink/70 mt-3 font-body">{game.description}</p>
              )}
            </Card>
          </div>

          {/* Top-up form */}
          <div className="lg:w-2/3">
            <Card variant="surface" hoverable={false} className="p-6">
              <TopupForm game={game} />
            </Card>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
