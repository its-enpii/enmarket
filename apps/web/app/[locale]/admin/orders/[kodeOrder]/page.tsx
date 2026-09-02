import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { AdminPageHeader, AdminPageBody, DataItem, FormSection } from '@/components/ui';
import { Text } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button, Card, Disclosure } from '@/components/ui/neobrutal';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ApiRequestError, apiGet } from '@/lib/api';
import {
  formatDateTime,
  TIPE_LABEL,
} from '@/lib/format';
import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderDeliveryInfo,
  type SingleResponse,
} from '@/lib/types';

import { GenerateDeliveriesForm } from '../GenerateDeliveriesForm';
import { RegenerateTokenForm } from '../RegenerateTokenForm';
import { ResendNotificationForm } from '../ResendNotificationForm';
import { NLink, Eyebrow } from '@/components/ui/neobrutal';

interface Props {
  params: Promise<{ kodeOrder: string }>;
}

async function loadOrder(kodeOrder: string) {
  try {
    const res = await apiGet<SingleResponse<Order>>(`/api/admin/orders/${kodeOrder}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { kodeOrder } = await params;
  const [order, t] = await Promise.all([
    loadOrder(kodeOrder),
    getTranslations('admin.orders.detail'),
  ]);

  if (!order) notFound();

  const items = order.items ?? [];
  const itemsWithoutDelivery = items.filter((it) => !it.delivery).length;

  const columns: Column<(typeof items)[number]>[] = [
    {
      key: 'product',
      header: t('items.colProduct'),
      render: (item) => {
        const delivery: OrderDeliveryInfo | null = item.delivery ?? null;

        return (
          <div>
            <Button
              href={`/admin/products/${item.product_id}`}
              variant="primary"
              size="sm"
              flat
            >
              {item.nama_produk}
            </Button>
            {delivery?.license_key && (
              <Text className="mt-1 font-mono">
                {t('items.licenseKey')}{' '}
                <span className="bg-ink/10 px-1.5 py-0.5 rounded">{delivery.license_key}</span>
              </Text>
            )}
          </div>
        );
      },
    },
    {
      key: 'type',
      header: t('items.colType'),
      render: (item) => TIPE_LABEL[item.tipe_produk] ?? item.tipe_produk,
    },
    {
      key: 'price',
      header: t('items.colPrice'),
      render: (item) => (
        <span className="font-bold">{item.harga_saat_beli_formatted}</span>
      ),
    },
    {
      key: 'delivery',
      header: t('items.colDelivery'),
      render: (item) => {
        const delivery: OrderDeliveryInfo | null = item.delivery ?? null;
        const tokenValid = !!delivery?.download_url;

        if (!delivery) {
          return (
            <span className="text-xs text-ink/50 italic">{t('items.notGenerated')}</span>
          );
        }

        return (
          <div className="space-y-2">
            {delivery.has_download && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={tokenValid ? 'accent' : 'ink'}
                  size="md"
                  shadow={false}
                  className="px-2 py-0.5 text-xs font-bold normal-case tracking-normal"
                >
                  {tokenValid ? t('items.tokenActive') : t('items.tokenExpired')}
                </Badge>
                {delivery.download_token && (
                  <code className="text-xs bg-ink/5 px-2 py-1 border border-ink/20 font-mono">
                    {delivery.download_token.substring(0, 16)}…
                  </code>
                )}
                {delivery.token_expired_at && (
                  <span className="text-xs text-ink/60">
                    {t('items.until', { date: formatDateTime(delivery.token_expired_at) })}
                  </span>
                )}
              </div>
            )}
            {(delivery.email_sent_at || delivery.wa_sent_at) && (
              <div className="flex flex-wrap gap-2 text-xs">
                {delivery.email_sent_at && (
                  <span className="text-ink/60">
                    {t('items.emailAt', { date: formatDateTime(delivery.email_sent_at) })}
                  </span>
                )}
                {delivery.wa_sent_at && (
                  <span className="text-ink/60">
                    {t('items.waAt', { date: formatDateTime(delivery.wa_sent_at) })}
                  </span>
                )}
              </div>
            )}
            {order.status === 'paid' && delivery.has_download && (
              <RegenerateTokenForm
                kodeOrder={order.kode_order}
                orderItemId={item.id}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminPageBody>
      <AdminPageHeader
        eyebrow={t('eyebrow')}
        title={order.kode_order}
        subtitle={t('subtitle')}
      />

      {/* Quick info + actions */}
      <Card variant="surface" className="p-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} labelMap={ORDER_STATUS_LABEL} />
        <span className="text-sm">
          <strong>{t('quickInfo.total')}:</strong> {order.total_harga_formatted}
        </span>
        <span className="text-sm">
          <strong>{t('quickInfo.productCount', { count: items.length })}</strong>
        </span>

        <div className="ml-auto flex flex-wrap gap-2">
          {order.status === 'paid' && (
            <ResendNotificationForm kodeOrder={order.kode_order} />
          )}
          <Button href="/admin/orders" variant="ghost" size="sm">
            {t('quickInfo.backToList')}
          </Button>
        </div>
      </Card>

      {/* Buyer card */}
      <Card variant="surface" className="p-6 md:p-8">
        <FormSection className="mb-5" mark eyebrow={t('buyer.eyebrow').replace('✎ ', '')} title={t('buyer.title')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <DataItem label={t('buyer.name')} value={order.nama_pembeli} />
          <DataItem label={t('buyer.email')} value={order.email_pembeli} />
          <DataItem label={t('buyer.whatsapp')} value={order.wa_pembeli} />
          <DataItem label={t('buyer.tripayRef')} value={order.tripay_reference ?? '—'} valueClassName="font-mono" />
        </div>
      </Card>

      {/* Re-trigger delivery kalau ada item tanpa delivery */}
      {order.status === 'paid' && itemsWithoutDelivery > 0 && (
        <Card variant="filled-accent" className="p-4 flex flex-wrap items-center gap-3">
          <span className="font-bold text-sm">
            {t('deliveryBanner', { count: itemsWithoutDelivery })}
          </span>
          <div className="ml-auto">
            <GenerateDeliveriesForm kodeOrder={order.kode_order} />
          </div>
        </Card>
      )}

      {/* Items table */}
      <Card
        variant="filled-primary"
        hoverable={false}
        elevation={4}
        className="shadow-[4px_4px_0_0_var(--color-ink)]"
      >
        <div className="px-6 py-4 border-b-2 border-ink bg-primary text-surface">
          <Eyebrow size="sm" color="accent" className="mb-1">
            {t('items.eyebrow')}
          </Eyebrow>
          <h2 className="font-display text-xl font-black uppercase tracking-tight">
            {t('items.title')}
          </h2>
        </div>
      </Card>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        emptyMessage={t('items.empty')}
      />

      {/* QR info */}
      {order.qr_url && order.status === 'pending' && (
        <Card variant="surface" className="p-6 md:p-8">
          <FormSection className="mb-5" mark={false} eyebrow={t('qr.eyebrow')} title={t('qr.title')} />
          <p className="text-body-sm text-ink/70 mb-3">
            {t('qr.hint')}{' '}
            <code>{t('qr.atUrl', { code: order.kode_order })}</code>.
            {order.qr_expired_at && (
              <> {t('qr.expired', { date: formatDateTime(order.qr_expired_at) })}</>
            )}
          </p>
          <NLink
            href={order.qr_url}
            target="_blank"
            rel="noreferrer"
            variant="primary"
            underline="static"
            className="text-xs"
          >
            {order.qr_url}
          </NLink>
          <Disclosure
            label={
              <span className="text-xs font-bold text-ink/60 hover:text-ink">
                {t('qr.viewRaw')}
              </span>
            }
            className="mt-3"
            contentClassName="mt-2"
          >
            <pre className="text-xs bg-ink/5 p-2 border border-ink/20 overflow-x-auto font-mono">
              {order.qr_string ?? t('qr.rawEmpty')}
            </pre>
          </Disclosure>
        </Card>
      )}
    </AdminPageBody>
  );
}
