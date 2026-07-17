import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button } from '@/components/admin/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import {
  POST_STATUS_LABEL,
  type PaginatedResponse,
  type Post,
} from '@/lib/types';

import { deletePost } from './actions';

interface Props {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
  params: Promise<{ locale: string }>;
}

const STATUS_BG: Record<string, string> = {
  draft: 'bg-surface text-ink',
  published: 'bg-accent text-ink',
  archived: 'bg-ink text-surface',
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.posts' });
  return { title: `${t('listTitle')} — Admin` };
}

async function loadPosts(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<Post>>('/api/admin/posts', {
      status: params.status,
      q: params.q,
      page: params.page ?? 1,
      per_page: 10,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
    }
    throw err;
  }
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [postsRes, t, tBtns] = await Promise.all([
    loadPosts(params),
    getTranslations('admin.posts'),
    getTranslations('common.buttons'),
  ]);

  const rows = postsRes.data ?? [];
  const meta = postsRes.meta;

  const columns: Column<Post>[] = [
    {
      key: 'title',
      header: t('columns.title'),
      render: (p) => (
        <NLink href={`/admin/posts/${p.id}`} variant="primary" underline="static">
          {p.title}
        </NLink>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: '120px',
      render: (p) => (
        <StatusBadge status={p.status} labelMap={POST_STATUS_LABEL} bgOverride={STATUS_BG} />
      ),
    },
    {
      key: 'published_at',
      header: t('columns.published'),
      width: '120px',
      render: (p) => (
        <span className="text-ink/60 text-xs">{formatDate(p.published_at)}</span>
      ),
    },
    {
      key: 'updated',
      header: t('columns.updated'),
      width: '120px',
      render: (p) => <span className="text-ink/60 text-xs">{formatDate(p.updated_at)}</span>,
    },
    {
      key: 'aksi',
      header: t('columns.actions'),
      width: '180px',
      render: (p) => (
        <div className="flex gap-2">
          <Button href={`/admin/posts/${p.id}`} variant="ghost" size="sm">
            {tBtns('edit')}
          </Button>
          <DeleteButton
            itemId={p.id}
            itemName={p.title}
            action={deletePost}
          />
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: t('filters.status'),
      options: [
        { value: '', label: t('filters.allStatus') },
        { value: 'draft', label: t('filters.draft') },
        { value: 'published', label: t('filters.published') },
        { value: 'archived', label: t('filters.archived') },
      ],
    },
  ];

  return (
    <AdminListProvider>
      <div className="p-6 sm:p-8 space-y-6">
        <header className="border-b-4 border-ink pb-6">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
            {t('listEyebrow')}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
            {t('listTitle')}<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
            {t('listSubtitle')}
          </p>
        </header>

        <AdminTableHeader
          q={params.q ?? ''}
          sort="updated_at"
          dir="desc"
          filters={filters}
          placeholder={t('searchPlaceholder')}
          action={
            <Button href="/admin/posts/new" variant="primary" size="md">
              {t('newButton')}
            </Button>
          }
        />

        <DataTableArea
          columnCount={columns.length}
          columnWidths={columns.map((c) => c.width)}
          skeletonCount={meta.per_page ?? 10}
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(p) => p.id}
            emptyState={
              <EmptyState
                title={params.q ? t('empty.noResults', { query: params.q }) : t('empty.noneYet')}
                body={params.q ? t('empty.noResultsHint') : t('empty.noneYetHint')}
                action={
                  !params.q && (
                    <Button href="/admin/posts/new" variant="primary" size="md">
                      {t('newButton')}
                    </Button>
                  )
                }
              />
            }
          />
        </DataTableArea>
      </div>
    </AdminListProvider>
  );
}