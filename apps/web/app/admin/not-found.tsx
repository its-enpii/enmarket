import Link from 'next/link';

/**
 * 404 untuk route /admin/*. Layout admin sudah render sidebar+topbar.
 */
export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
        404 — Halaman Admin Tidak Ditemukan
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-ink">
        Halaman admin ini nggak ada.
      </h1>
      <p className="mt-4 text-base text-ink/70">
        Coba cek URL, atau kembali ke dashboard.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/admin"
          className="inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all min-h-[44px]"
        >
          ← Dashboard
        </Link>
        <Link
          href="/admin/products"
          className="inline-block bg-surface text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all min-h-[44px]"
        >
          Produk
        </Link>
        <Link
          href="/admin/orders"
          className="inline-block bg-surface text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all min-h-[44px]"
        >
          Pesanan
        </Link>
      </div>
    </div>
  );
}