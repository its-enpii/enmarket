import { apiGet, ApiRequestError } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import type {
  AdminOrderStats,
  PaginatedResponse,
  ProductStats,
  SingleResponse,
} from '@/lib/types';

export const metadata = {
  title: 'Beranda Admin — enpiistudio Store',
};

async function loadProductStats() {
  try {
    return await apiGet<SingleResponse<ProductStats>>('/api/admin/products/stats');
  } catch {
    return { data: { total: 0, aktif: 0, draft: 0, tidak_dijual: 0 } };
  }
}

async function loadOrderStats() {
  try {
    return await apiGet<SingleResponse<AdminOrderStats>>('/api/admin/orders/stats');
  } catch {
    return {
      data: {
        total: 0,
        pending: 0,
        paid: 0,
        failed: 0,
        expired: 0,
        refunded: 0,
        revenue_month: 0,
        paid_month: 0,
      } satisfies AdminOrderStats,
    };
  }
}

async function loadActiveLicenseCount() {
  try {
    const res = await apiGet<PaginatedResponse<unknown>>('/api/admin/license-keys', {
      status: 'aktif',
      per_page: 1,
    });
    return res.meta?.total ?? 0;
  } catch (err) {
    if (err instanceof ApiRequestError) return 0;
    return 0;
  }
}

export default async function AdminHomePage() {
  const [productStats, orderStats, licenseActive] = await Promise.all([
    loadProductStats(),
    loadOrderStats(),
    loadActiveLicenseCount(),
  ]);

  const tiles = [
    {
      label: 'Total Produk',
      value: String(productStats.data.total),
      accent: false,
    },
    {
      label: 'Pesanan Paid (Bulan Ini)',
      value: String(orderStats.data.paid_month),
      accent: true,
    },
    {
      label: 'Pendapatan (Bulan Ini)',
      value: formatRupiah(orderStats.data.revenue_month),
      accent: true,
    },
    {
      label: 'License Aktif',
      value: String(licenseActive),
      accent: false,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-ink/60 mb-3">
          Statistik
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className={
                'border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] ' +
                (tile.accent ? 'bg-accent' : 'bg-surface')
              }
            >
              <p className="text-xs font-bold uppercase tracking-widest text-ink/70">
                {tile.label}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-ink mt-2 leading-none break-all">
                {tile.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
