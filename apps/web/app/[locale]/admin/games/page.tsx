import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Button, NLink } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import type { Game, PaginatedResponse } from '@/lib/types';

import { deleteGame } from './actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Eyebrow } from '@/components/ui/neobrutal';
import { AdminPageBody } from '@/components/ui';
import { PageTitle } from '@/components/ui';
import { Image } from '@/components/ui/Image';

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.games' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

async function loadGames(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<Game>>('/api/admin/games', {
      q: params.q,
      page: params.page ?? 1,
      per_page: 20,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { data: [] as Game[], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } };
    }
    throw err;
  }
}

export default async function GamesListPage({ searchParams }: Props) {
  const [sp, t] = await Promise.all([searchParams, getTranslations('admin.games')]);
  const result = await loadGames(sp);
  const games = result.data ?? [];

  return (
    <AdminPageBody>
      <header className="border-b-4 border-ink pb-6 flex items-end justify-between">
        <div>
          <Eyebrow size="sm" color="accent" className="mb-3">
            {t('listEyebrow')}
          </Eyebrow>
          <PageTitle size="hero-xl">
            {t('listTitle')}<span className="text-primary">.</span>
          </PageTitle>
          <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
            {t('listSubtitle')}
          </p>
        </div>
        <Button variant="primary" size="sm" href="/admin/games/new">
          {t('addNew')}
        </Button>
      </header>

      {games.length === 0 ? (
        <Card variant="surface" hoverable={false} className="p-8 text-center">
          <p className="text-ink/60">{t('empty')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <Card key={game.id} variant="surface" hoverable={false} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {game.icon_url ? (
                    <Image src={game.icon_url} alt="" className="w-10 h-10 rounded border-2 border-ink shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded border-2 border-ink bg-accent/20 flex items-center justify-center shrink-0">🎮</div>
                  )}
                  <div className="min-w-0">
                    <NLink href={`/admin/games/${game.id}`} variant="primary" className="font-bold text-sm truncate block">
                      {game.nama}
                    </NLink>
                    <p className="text-xs text-ink/50">{game.slug} · {(game.items ?? []).length} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge tone={game.active ? 'accent' : 'surface'} size="sm">
                    {game.active ? t('field.activeStatus') : t('field.inactiveStatus')}
                  </Badge>
                  <DeleteButton
                    action={deleteGame}
                    itemId={game.id}
                    confirmMessage={t('confirmDelete')}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminPageBody>
  );
}
