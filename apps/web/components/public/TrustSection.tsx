import { NLink } from '@/components/ui/neobrutal';

interface Benefit {
  icon: string;
  title: string;
  body: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: '⚡',
    title: 'Akses instan',
    body: 'Bayar, link unduh atau kunci lisensi langsung aktif. Tidak nunggu email lama.',
  },
  {
    icon: '🔑',
    title: 'Invoice resmi',
    body: 'Setiap transaksi dapat invoice digital otomatis untuk catatan pribadi atau kantor.',
  },
  {
    icon: '🛠️',
    title: 'Update gratis',
    body: 'Beli sekali, dapat versi terbaru selama karya masih dipublish di etalase.',
  },
  {
    icon: '💬',
    title: 'Bantuan langsung',
    body: 'Ngobrol via WhatsApp atau email — bukan autoresponder bot.',
  },
];

/**
 * Section "Kenapa belanja di sini" — trust badge untuk marketplace.
 * 4 tile NeoBrutalism, warna diselang-seling biar ritme visual.
 */
export function TrustSection() {
  return (
    <section aria-label="Kenapa belanja di sini" className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-bold text-primary font-mono">★</span>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
            Kenapa belanja di sini
          </h2>
          <p className="text-sm sm:text-base text-ink/70 mt-1">
            Studio kecil, tapi proses rapi. Tidak ada drama setelah bayar.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENEFITS.map((b, i) => {
          const tile =
            i % 4 === 0
              ? 'bg-primary text-surface'
              : i % 4 === 1
                ? 'bg-accent text-ink'
                : i % 4 === 2
                  ? 'bg-ink text-surface'
                  : 'bg-surface text-ink';
          return (
            <div
              key={b.title}
              className={`${tile} border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)]`}
            >
              <p className="text-2xl" aria-hidden="true">
                {b.icon}
              </p>
              <h3 className="mt-2 font-bold text-base leading-tight">{b.title}</h3>
              <p className="mt-1 text-xs leading-relaxed opacity-80">{b.body}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink/60 text-center pt-2">
        Punya pertanyaan?{' '}
        <NLink
          href="/katalog"
          variant="primary"
          underline="static"
        >
          Lihat karya dulu
        </NLink>{' '}
        atau langsung kontak studio.
      </p>
    </section>
  );
}