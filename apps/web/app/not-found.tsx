import { Button } from '@/components/ui/neobrutal';

/**
 * Global 404 — dipanggil kalau tidak ada not-found.tsx di segment yang cocok.
 * (public)/not-found.tsx sudah ada dan override ini untuk route publik.
 */
export default function GlobalNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-ink/60">
        404 — Halaman Tidak Ditemukan
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink">
        Waduh, halaman ini nggak ada.
      </h1>
      <p className="mt-4 text-base sm:text-lg text-ink/70">
        Mungkin URL-nya salah ketik atau halaman sudah dihapus.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="md" href="/katalog">
          ← Lihat Katalog
        </Button>
        <Button variant="surface" size="md" href="/">
          Beranda
        </Button>
      </div>
    </div>
  );
}