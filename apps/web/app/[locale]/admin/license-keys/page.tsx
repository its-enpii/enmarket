import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import {
  LICENSE_STATUS_LABEL,
  type AdminLicenseKey,
  type LicenseStatus,
  type PaginatedResponse,
} from '@/lib/types';

import { ExtendDialog } from './ExtendDialog';
import { LicenseKeyFormCard, LicenseKeyTrigger } from './LicenseKeyForm';
import { LicenseKeyProvider } from './LicenseKeyContext';
import { RevokeButton } from './RevokeButton';

interface Props {
  searchParams: Promise<{
    product_id?: string;
    status?: string;
    q?: string;
    page?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
  }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.licenseKeys' });
  return { title: `${t('listTitle')} — Admin` };
}

async function loadKeys(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<AdminLicenseKey>>('/api/admin/license-keys', {
      product_id: params.product_id,
      status: params.status,
      q: params.q,
      sort: params.sort,
      dir: params.dir,
      page: params.page ?? 1,
      per_page: 20,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } };
    }
    throw err;
  }
}

async function loadActiveProducts() {
  try {
    const res = await apiGet<{ data: Array<{ id: number; nama: string }> }>(
      '/api/admin/products',
      { status: 'aktif', per_page: 100 },
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function LicenseKeysPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.licenseKeys');
  const [keysRes, products] = await Promise.all([loadKeys(params), loadActiveProducts()]);

  const rows = keysRes.data ?? [];
  const meta = keysRes.meta;

  const columns: Column<AdminLicenseKey>[] = [
    {
      key: 'key',
      header: t('columns.key'),
      width: '260px',
      render: (k) => (
        <code className="text-xs font-mono bg-ink/5 px-2 py-1 border border-ink/20 select-all">
          {k.key}
        </code>
      ),
    },
    {
      key: 'product',
      header: t('columns.product'),
      render: (k) => (
        <NLink
          href={`/admin/products/${k.product_id}`}
          variant="primary"
          underline="static"
        >
          {k.product?.nama ?? t('productFallback', { id: k.product_id })}
        </NLink>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: '120px',
      render: (k) => <StatusBadge status={k.status} labelMap={LICENSE_STATUS_LABEL} />,
    },
    {
      key: 'activated',
      header: t('columns.activated'),
      width: '110px',
      render: (k) => (
        <span className="text-xs text-ink/60">{formatDate(k.activated_at)}</span>
      ),
    },
    {
      key: 'expired',
      header: t('columns.expired'),
      width: '110px',
      render: (k) => (
        <span className="text-xs text-ink/60">{formatDate(k.expired_at)}</span>
      ),
    },
    {
      key: 'created',
      header: t('columns.created'),
      width: '110px',
      render: (k) => (
        <span className="text-xs text-ink/60">{formatDate(k.created_at)}</span>
      ),
    },
    {
      key: 'aksi',
      header: t('columns.actions'),
      width: '200px',
      render: (k) => {
        const canRevoke = k.status === 'aktif' || k.status === 'digunakan';
        const canExtend = k.status !== 'dicabut';
        return (
          <div className="flex gap-2">
            {canRevoke && (
              <RevokeButton id={k.id} keyMasked={`${k.key.substring(0, 8)}…`} />
            )}
            {canExtend && <ExtendDialog id={k.id} />}
          </div>
        );
      },
    },
  ];

  const STATUS_OPTIONS: { value: LicenseStatus | ''; label: string }[] = [
    { value: '', label: t('filters.allStatus') },
    { value: 'aktif', label: t('filters.active') },
    { value: 'digunakan', label: t('filters.used') },
    { value: 'kadaluarsa', label: t('filters.expired') },
    { value: 'dicabut', label: t('filters.revoked') },
  ];

  return (
    <AdminListProvider>
      <LicenseKeyProvider>
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
            sort={params.sort ?? 'id'}
            dir={params.dir === 'asc' ? 'asc' : 'desc'}
            filters={[
              {
                key: 'product_id',
                label: t('filters.product'),
                options: [
                  { value: '', label: t('filters.allProduct') },
                  ...products.map((p) => ({ value: String(p.id), label: p.nama })),
                ],
              },
              { key: 'status', label: t('filters.status'), options: STATUS_OPTIONS },
            ]}
            placeholder={t('searchPlaceholder')}
            action={<LicenseKeyTrigger products={products} />}
            secondary={<LicenseKeyFormCard products={products} />}
          />

          <DataTableArea
            columnCount={columns.length}
            columnWidths={columns.map((c) => c.width)}
            skeletonCount={meta.per_page ?? 20}
          >
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(k) => k.id}
              emptyState={
                <EmptyState
                  title={params.q || params.status || params.product_id ? t('empty.noMatch') : t('empty.noneYet')}
                  body={params.q || params.status || params.product_id ? t('empty.noMatchHint') : t('empty.noneYetHint')}
                />
              }
            />
          </DataTableArea>

          {meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              basePath="/admin/license-keys"
              queryParams={params}
            />
          )}
      </div>
      </LicenseKeyProvider>
    </AdminListProvider>
  );
}