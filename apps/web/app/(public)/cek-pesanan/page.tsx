import { CekPesananForm } from './CekPesananForm';
import { getLastOrderCode } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Cek Pesanan — enpiistudio Store',
  description: 'Cek status pesanan kamu dengan kode order dan email.',
};

export default async function CekPesananPage() {
  const lastCode = await getLastOrderCode();

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">
        Cek Pesanan
      </h1>
      <p className="text-sm text-ink/60 mb-8">
        Masukkan kode order dan email yang kamu pakai saat checkout.
      </p>

      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
        <CekPesananForm defaultKode={lastCode ?? ''} />
      </div>

      <div className="mt-6 text-sm text-ink/60">
        <p>
          Kode order dikirim ke email setelah checkout. Format:{' '}
          <code className="font-mono bg-surface border border-ink px-1.5 py-0.5 text-xs">
            EPS-YYYYMMDD-XXXX
          </code>
        </p>
      </div>
    </div>
  );
}