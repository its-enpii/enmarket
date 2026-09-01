import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { buildMetadata } from '@/lib/seo';
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
  return buildMetadata({
    title: `${t('editTitle')} — Admin`,
  });
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
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('editTitle')}
        subtitle={t('editSubtitle')}
      />

      <Card variant="surface" className="p-6 md:p-8">
        <GameForm game={game} />
      </Card>

      <GameItemsSection game={game} />
    </div>
  );
}
