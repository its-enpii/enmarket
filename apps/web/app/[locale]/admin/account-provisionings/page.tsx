import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/Badge';
import { Button, Card, NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import {
  PROVISIONING_STATUS_LABEL,
  type AdminProvisioning,
  type AdminProvisioningStats,
  type PaginatedResponse,
  type ProvisioningStatus,
} from '@/lib/types';

import { MarkReadyForm } from './MarkReadyForm';

interface Props {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.accountProvisionings' });
  return { title: `${t('title')} — Admin` };
}

async function loadRows(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<AdminProvisioning>>(
      '/api/admin/account-provisionings',
      {
        status: params.status,
        page: params.page ?? 1,
        per_page: 20,
      },
    );
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } };
    }
    throw err;
  }
}

async function loadStats() {
  try {
    return await apiGet<{ data: AdminProvisioningStats }>(
      '/api/admin/account-provisionings/stats',
    );
  } catch {
    return {
      data: { menunggu_admin: 0, siap: 0, gagal: 0, dibatalkan: 0, total: 0 } satisfies AdminProvisioningStats,
    };
  }
}

const STATUS_FILTERS: { value: ProvisioningStatus | ''; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'menunggu_admin', label: PROVISIONING_STATUS_LABEL.menunggu_admin },
  { value: 'siap', label: PROVISIONING_STATUS_LABEL.siap },
  { value: 'gagal', label: PROVISIONING_STATUS_LABEL.gagal },
  { value: 'dibatalkan', label: PROVISIONING_STATUS_LABEL.dibatalkan },
];

const STATUS_BADGE_TONE: Record<ProvisioningStatus, 'primary' | 'accent' | 'primary'> = {
  menunggu_admin: 'accent',
  siap: 'primary',
  gagal: 'primary',
  dibatalkan: 'primary',
};

export default async function AccountProvisioningsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.accountProvisionings');
  const [rowsRes, statsRes] = await Promise.all([loadRows(params), loadStats()]);

  const rows = rowsRes.data ?? [];
  const meta = rowsRes.meta;
  const stats = statsRes.data;
  const activeStatus = (params.status ?? '') as ProvisioningStatus | '';

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* ───── HEADER ───── */}
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          {t('eyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {t('title')}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {t('subtitle')}
        </p>
      </header>

      {/* ───── STAT TILES (4) ───── */}
      <section>
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mb-3">
          {t('sectionStats')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile label={t('statMenungguAdmin')} value={stats.menunggu_admin} variant="filled-accent" />
          <StatTile label={t('statSiap')} value={stats.siap} variant="filled-primary" />
          <StatTile label={t('statGagal')} value={stats.gagal} variant="ink" />
          <StatTile label={t('statTotal')} value={stats.total} variant="surface" />
        </div>
      </section>

      {/* ───── FILTER TABS ───── */}
      <nav className="flex flex-wrap gap-2 border-b-2 border-ink/10 pb-3">
        {STATUS_FILTERS.map((f) => {
          const isActive = f.value === activeStatus;
          const href = f.value
            ? `/admin/account-provisionings?status=${f.value}`
            : '/admin/account-provisionings';
          return (
            <NLink
              key={f.value || 'all'}
              href={href}
              variant={isActive ? 'primary' : 'surface'}
              underline="static"
              className={`text-xs font-bold uppercase px-3 py-1.5 border-2 ${
                isActive ? 'border-ink bg-primary text-surface' : 'border-ink/30 hover:bg-accent/40'
              }`}
            >
              {f.label}
            </NLink>
          );
        })}
      </nav>

      {/* ───── ROWS ───── */}
      {rows.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-ink/20">
          <p className="font-display text-2xl font-black uppercase text-ink/60">{t('emptyTitle')}</p>
          <p className="mt-2 font-body text-sm text-ink/50">{t('emptyHint')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const order = row.orderItem?.order;
            const productName = row.orderItem?.nama_produk ?? '—';
            return (
              <li key={row.id}>
                <Card variant="surface" hoverable={false} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-ink truncate">{productName}</span>
                      <BadgeStatus status={row.status} tone={STATUS_BADGE_TONE[row.status]} />
                    </div>
                    {order && (
                      <p className="font-mono text-xs text-ink/60 truncate">
                        {order.kode_order} · {order.nama_pembeli}
                      </p>
                    )}
                    <p className="text-[11px] text-ink/50 mt-0.5">
                      {t('created')} {formatDateTime(row.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {row.status === 'menunggu_admin' && (
                      <MarkReadyForm
                        provisioningId={row.id}
                        isRegenerate={false}
                        initialCredentials={null}
                        initialCatatan={null}
                      />
                    )}
                    {row.status === 'siap' && (
                      <>
                        <MarkReadyForm
                          provisioningId={row.id}
                          isRegenerate
                          initialCredentials={row.credentials}
                          initialCatatan={row.catatan_admin}
                        />
                      </>
                    )}
                  </div>
                </div>

                {row.status === 'siap' && row.credentials && (
                  <details className="mt-3 border-t-2 border-dashed border-ink/20 pt-3">
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-ink/70">
                      {t('viewCredentials')}
                    </summary>
                    <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                      {Object.entries(row.credentials).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="font-bold uppercase text-ink/60 w-20">{k}</dt>
                          <dd className="font-mono break-all select-all">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {row.catatan_admin && (
                      <p className="mt-2 text-xs italic text-ink/60">📝 {row.catatan_admin}</p>
                    )}
                  </details>
                )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => {
            const href = p === 1
              ? `/admin/account-provisionings${activeStatus ? `?status=${activeStatus}` : ''}`
              : `/admin/account-provisionings?${activeStatus ? `status=${activeStatus}&` : ''}page=${p}`;
            const isCurrent = p === meta.current_page;
            return (
              <Button
                key={p}
                href={href}
                variant={isCurrent ? 'primary' : 'surface'}
                size="sm"
                flat
              >
                {p}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: 'surface' | 'filled-primary' | 'filled-accent' | 'ink';
}) {
  return (
    <Card
      variant={variant}
      hoverable={false}
      className="p-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-2 font-display text-3xl font-black leading-none">{value}</p>
    </Card>
  );
}

function BadgeStatus({
  status,
  tone,
}: {
  status: ProvisioningStatus;
  tone: 'primary' | 'accent';
}) {
  return (
    <Badge tone={tone} size="sm" shadow={false}>
      {PROVISIONING_STATUS_LABEL[status]}
    </Badge>
  );
}
