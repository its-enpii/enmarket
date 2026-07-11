import { Button } from '@/components/ui/neobrutal';

/**
 * Newsletter / update CTA — banner besar sebelum footer.
 *
 * Catatan: backend newsletter belum ada, jadi tidak ada form sungguhan.
 * Pakai CTA ke katalog + kontak publik untuk sementara — tone marketplace,
 * tidak berjanji fitur yang belum jalan.
 *
 * Tone: ajakan informal, warna ink+accent (kontras tinggi, jadi penutup visual).
 */
export function NewsletterCTA() {
  return (
    <section
      aria-label="Update studio"
      className="bg-ink text-surface border-4 border-ink p-6 sm:p-10 shadow-[6px_6px_0_0_var(--color-accent)] relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 w-32 h-32 bg-accent border-2 border-accent rotate-12"
      />
      <div
        aria-hidden="true"
        className="absolute right-10 bottom-4 w-16 h-16 bg-primary border-2 border-primary"
      />
      <div className="relative max-w-2xl">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent">
          📬 Update Studio
        </p>
        <h2 className="mt-3 text-2xl sm:text-4xl font-bold leading-tight">
          Karya baru, mampir duluan.
        </h2>
        <p className="mt-3 text-sm sm:text-base text-surface/80 leading-relaxed">
          Bookmark katalog untuk lihat karya terbaru, atau mampir ke halaman Karya kapan saja.
          Studio kecil — bukan newsletter mingguan, tapi ada notifikasi kalau ada rilis penting.
        </p>
        <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
          <Button variant="accent" size="md" href="/katalog">
            Lihat Karya →
          </Button>
          <Button variant="outline" size="md" href="/cek-pesanan" className="border-surface text-surface hover:bg-surface hover:text-ink">
            Cek Pesanan
          </Button>
        </div>
      </div>
    </section>
  );
}
