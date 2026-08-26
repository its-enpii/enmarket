import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { CustomRequest, SingleResponse } from '@/lib/types';

import { CustomRequestEditForm } from './CustomRequestEditForm';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.customRequests' });
  return { title: `${t('detailTitle')} — Admin` };
}

export default async function CustomRequestDetailPage({ params }: Props) {
  const { id } = await params;

  let request: CustomRequest | null = null;
  try {
    const res = await apiGet<SingleResponse<CustomRequest>>(`/api/admin/custom-requests/${id}`);
    request = res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!request) notFound();

  const t = await getTranslations('admin.customRequests');

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          {t('detailEyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {request.nama}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Diajukan pada {formatDate(request.created_at)}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8">
        <div className="space-y-6">
          <Card variant="surface" hoverable={false} className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-ink border-b-2 border-ink/10 pb-2">
              {t('projectDetail')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">Jenis Proyek</p>
                <p className="font-bold text-ink mt-0.5 uppercase">{request.jenis_proyek}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">Budget</p>
                <p className="font-bold text-primary mt-0.5">{request.budget_range}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">Timeline</p>
                <p className="font-bold text-ink mt-0.5">{request.timeline}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-ink/60 uppercase mb-1">Deskripsi Kebutuhan</p>
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
                <p className="text-xs font-bold text-ink/60 uppercase">Nama</p>
                <p className="font-bold text-ink mt-0.5">{request.nama}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">Email</p>
                <a href={`mailto:${request.email}`} className="font-bold text-primary underline mt-0.5 block">
                  {request.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/60 uppercase">WhatsApp</p>
                <a href={`https://wa.me/${request.wa.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="font-bold text-green-600 underline mt-0.5 block">
                  {request.wa} ↗
                </a>
              </div>
            </div>
          </Card>
        </div>

        <Card variant="surface" thick hoverable={false} className="p-6 h-fit">
          <h3 className="font-label text-label-sm uppercase tracking-[0.2em] text-accent mb-4 border-b border-ink/20 pb-2">
            {t('updateStatus')}
          </h3>
          <CustomRequestEditForm customRequest={request} />
        </Card>
      </div>
    </div>
  );
}
