import { getTranslations } from 'next-intl/server';

import { CekPesananForm } from './CekPesananForm';
import { getLastOrderCode } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkOrder' });
  return {
    title: `${t('title')} — enpiistudio`,
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/cek-pesanan` },
  };
}

export default async function CekPesananPage() {
  const lastCode = await getLastOrderCode();
  const t = await getTranslations('checkOrder');

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">
        {t('title')}
      </h1>
      <p className="text-sm text-ink/60 mb-8">
        {t('subtitle')}
      </p>

      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
        <CekPesananForm defaultKode={lastCode ?? ''} />
      </div>
          <code className="font-mono bg-surface border border-ink px-1.5 py-0.5 text-xs">
            EPS-YYYYMMDD-XXXX
          </code>
        </p>
      </div>
    </div>
  );
}