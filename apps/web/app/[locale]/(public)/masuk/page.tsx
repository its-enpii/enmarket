import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { Card, NLink } from '@/components/ui/neobrutal';
import { MasukForm } from './MasukForm';
import { redirect } from '@/i18n/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'customer.login' });
  return {
    title: `${t('title')} — enpiistudio`,
    description: t('subtitle'),
  };
}

export default async function MasukPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { next } = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;

  if (token) {
    redirect(next ? (next as any) : '/akun');
  }

  const t = await getTranslations('customer.login');

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card variant="surface" hoverable={false} thick raised className="p-6 sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            enpiistudio Akun
          </p>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-ink">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-ink/70 mb-6">
            {t('subtitle')}
          </p>

          <MasukForm locale={locale} />
        </Card>

        <p className="mt-6 text-center text-sm">
          <NLink href="/" variant="primary" underline="static">
            ← Kembali ke Beranda
          </NLink>
        </p>
      </div>
    </section>
  );
}
