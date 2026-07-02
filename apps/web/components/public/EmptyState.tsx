import Link from 'next/link';

interface Props {
  title: string;
  message?: string;
  cta?: { href: string; label: string };
}

/**
 * Empty state — blok warna dengan CTA. Dipakai saat katalog kosong / filter tidak ketemu.
 */
export function EmptyState({ title, message, cta }: Props) {
  return (
    <div className="bg-surface border-2 border-ink p-8 sm:p-12 shadow-[4px_4px_0_0_var(--color-ink)] text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
        Belum Ada
      </p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold leading-tight text-ink">
        {title}
      </h2>
      {message && (
        <p className="mt-3 text-sm sm:text-base text-ink/70 max-w-md mx-auto">
          {message}
        </p>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}