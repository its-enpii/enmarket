import { Card, NLink } from '@/components/ui/neobrutal';

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
          const variant =
            i % 4 === 0
              ? 'filled-primary'
              : i % 4 === 1
                ? 'filled-accent'
                : i % 4 === 2
                  ? 'ink'
                  : 'surface';
          return (
            <Card key={b.title} variant={variant} hoverable={false} className="p-4">
              <p className="text-2xl" aria-hidden="true">
                {b.icon}
              </p>
              <h3 className="mt-2 font-bold text-base leading-tight">{b.title}</h3>
              <p className="mt-1 text-xs leading-relaxed opacity-80">{b.body}</p>
            </Card>
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