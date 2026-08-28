import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Card } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import type { Game, SingleResponse } from '@/lib/types';

import { GameForm } from '../GameForm';
import { GameItemsSection } from './GameItemsSection';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.games' });
  return { title: `${t('editTitle')} — Admin` };
}

async function loadGame(id: string): Promise<Game | null> {
  try {
    const res = await apiGet<SingleResponse<Game>>(`/api/admin/games/${id}`);
    return res.data ?? null;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [game, t] = await Promise.all([
    loadGame(id),
    getTranslations('admin.games'),
  ]);

  if (!game) notFound();

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          {t('listEyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {t('editTitle')}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {t('editSubtitle')}
        </p>
      </header>

      <Card variant="surface" className="p-6 md:p-8">
        <GameForm game={game} />
      </Card>

      <GameItemsSection game={game} />
    </div>
  );
}
