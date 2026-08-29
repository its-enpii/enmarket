import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Button, Card } from '@/components/ui/neobrutal';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { CustomRequest, SingleResponse } from '@/lib/types';
import { CustomRequestEditForm } from './CustomRequestEditForm';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.customRequests' });
  return { title: `${t('detailTitle')} #${id} — Admin` };
}

export default async function CustomRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('admin.customRequests');

  let request: CustomRequest | null = null;
  try {
    const res = await apiGet<SingleResponse<CustomRequest>>(`/api/admin/custom-requests/${id}`);
    request = res.data ?? null;
  } catch {
    notFound();
  }

  if (!request) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          {t('detailEyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight text-ink">
          {t('detailTitle')} #{request.id}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {request.deskripsi.length > 140 ? `${request.deskripsi.slice(0, 140)}…` : request.deskripsi}
        </p>
      </header>

      {/* Quick actions — konsisten dengan detail pages lain (back to list) */}
      <div className="flex justify-end">
        <Button href="/admin/custom-requests" variant="ghost" size="sm">
          ← {t('listTitle')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="surface" hoverable={false} className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3">
              <h3 className="font-bold text-lg text-ink">{t('projectDetail')}</h3>
              <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">{t('fields.projectType')}</p>
                <p className="font-bold text-ink uppercase mt-0.5">{request.jenis_proyek}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">{t('fields.budget')}</p>
                <p className="font-bold text-primary mt-0.5">{request.budget_range}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">{t('fields.timeline')}</p>
                <p className="font-bold text-ink mt-0.5">{request.timeline}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-ink/60 uppercase mb-1">{t('fields.description')}</p>
              <div className="p-4 bg-primary/5 border-2 border-ink text-sm leading-relaxed whitespace-pre-wrap font-body">
                {request.deskripsi}
              </div>
            </div>
          </Card>

          <Card variant="surface" hoverable={false} className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-ink border-b-2 border-ink/10 pb-2">
              {t('clientDetail')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">{t('columns.client')}</p>
                <p className="font-bold text-ink mt-0.5">{request.nama}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">Email</p>
                <p className="font-bold text-ink mt-0.5">
                  <a href={`mailto:${request.email}`} className="text-primary underline">
                    {request.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">WhatsApp</p>
                <p className="font-bold text-ink mt-0.5">
                  <a
                    href={`https://wa.me/${request.wa.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {request.wa} ↗
                  </a>
                </p>
              </div>
            </div>
            <p className="text-xs text-ink/50 pt-2 border-t border-ink/10">
              {t('columns.created')}: {formatDate(request.created_at)}
            </p>
          </Card>
        </div>

        {/* Right 1 col: Edit Status & Notes Form */}
        <div>
          <Card variant="surface" hoverable={false} className="p-6">
            <h3 className="font-bold text-lg text-ink border-b-2 border-ink/10 pb-3 mb-4">
              {t('updateStatus')}
            </h3>
            <CustomRequestEditForm customRequest={request} />
          </Card>
        </div>
      </div>
    </div>
  );
}
