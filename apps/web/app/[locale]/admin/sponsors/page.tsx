import { AdminPageHeader, AdminPageBody, Text } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button, Card } from '@/components/ui/neobrutal';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { StatusPill } from '@/components/ui/StatusPill';
import { Image } from '@/components/ui/Image';
import { apiGet } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import type { PaginatedResponse, Sponsor } from '@/lib/types';
import { SponsorRowActions } from './SponsorRowActions';

interface Props {
  searchParams: Promise<{ q?: string; is_active?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.sponsors' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

async function loadSponsors(searchParams: {
  q?: string;
  is_active?: string;
  page?: string;
}) {
  const query: Record<string, string | number> = {};
  if (searchParams.q) query.q = searchParams.q;
  if (searchParams.is_active !== undefined) query.is_active = searchParams.is_active;
  if (searchParams.page) query.page = searchParams.page;

  const res = await apiGet<PaginatedResponse<Sponsor>>(
    '/api/admin/sponsors',
    query,
  );

  return {
    sponsors: res.data ?? [],
    meta: res.meta,
  };
}

export default async function SponsorsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.sponsors');

  const { sponsors, meta } = await loadSponsors(params);
  const q = params.q ?? '';

  const columns: Column<Sponsor>[] = [
    {
      key: 'name',
      header: t('columns.name'),
      width: '35%',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-ink bg-surface flex items-center justify-center shrink-0 overflow-hidden">
            {row.logo_url ? (
              <Image
                src={row.logo_url}
                alt={row.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="font-display font-black text-primary text-sm uppercase">
                {(row.name || row.domain).charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Text variant="itemTitle" className="truncate font-bold text-ink">
              {row.name || row.domain}
            </Text>
            <p className="text-fine text-ink/70 truncate max-w-xs">
              {row.description || row.fetched_description || '-'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'domain',
      header: t('columns.domain'),
      width: '25%',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-ink">
            {row.domain}
          </span>
          {row.url && (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block text-fine font-mono text-primary hover:underline truncate max-w-[200px]"
            >
              {row.url}
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: t('columns.amount'),
      width: '15%',
      render: (row) => (
        <span className="font-mono font-bold text-sm text-ink bg-accent/20 border border-ink/40 px-2 py-0.5">
          {formatRupiah(row.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: '10%',
      render: (row) => (
        <StatusPill tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? t('active') : t('inactive')}
        </StatusPill>
      ),
    },
    {
      key: 'actions',
      header: t('columns.actions'),
      width: '15%',
      render: (row) => <SponsorRowActions sponsor={row} />,
    },
  ];

  return (
    <AdminListProvider>
      <AdminPageBody>
        <AdminPageHeader
          eyebrow={t('listEyebrow')}
          title={t('listTitle')}
          subtitle={t('listSubtitle')}
        />

        <Card variant="surface" hoverable={false} className="p-0 overflow-hidden">
          <AdminTableHeader
            q={q}
            sort="amount"
            dir="desc"
            placeholder={t('searchPlaceholder')}
            action={
              <Button href="/admin/sponsors/new" variant="primary" size="md">
                + {t('addSponsorBtn')}
              </Button>
            }
            filters={[
              {
                key: 'is_active',
                label: t('filterStatus'),
                options: [
                  { label: t('filterAllStatus'), value: '' },
                  { label: t('active'), value: 'true' },
                  { label: t('inactive'), value: 'false' },
                ],
              },
            ]}
          />

          <DataTableArea
            columnCount={columns.length}
            columnWidths={columns.map((c) => c.width)}
            skeletonCount={10}
          >
            <DataTable
              columns={columns}
              rows={sponsors}
              rowKey={(s) => s.id}
              emptyState={
                <EmptyState
                  variant="admin"
                  title={
                    q
                      ? t('empty.noResults', { query: q })
                      : t('empty.noneYet')
                  }
                  body={
                    q
                      ? t('empty.noResultsHint')
                      : t('empty.noneYetHint')
                  }
                  action={
                    !q && (
                      <Button
                        href="/admin/sponsors/new"
                        variant="primary"
                        size="md"
                      >
                        + {t('addSponsorBtn')}
                      </Button>
                    )
                  }
                />
              }
            />
          </DataTableArea>

          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t-2 border-ink bg-surface/50">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                basePath="/admin/sponsors"
                queryParams={params}
              />
            </div>
          )}
        </Card>
      </AdminPageBody>
    </AdminListProvider>
  );
}
