import { Button } from '@/components/ui/neobrutal';
import { ErrorState } from '@/components/ui/ErrorState';

/**
 * Global 404 — dipanggil kalau tidak ada not-found.tsx di segment yang cocok.
 * (public)/not-found.tsx sudah ada dan override ini untuk route publik.
 */
export default function GlobalNotFound() {
  return (
    <ErrorState
      className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center"
      eyebrowColor="muted"
      titleClassName="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink"
      descriptionClassName="mt-4 text-base sm:text-lg text-ink/70"
      eyebrow="404 — Halaman Tidak Ditemukan"
      title="Waduh, halaman ini nggak ada."
      description="Mungkin URL-nya salah ketik atau halaman sudah dihapus."
      actions={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="md" href="/katalog">
            ← Lihat Katalog
          </Button>
          <Button variant="surface" size="md" href="/">
            Beranda
          </Button>
        </div>
      }
    />
  );
}
