/**
 * PageHeader — section hero untuk halaman publik (display, develop, discover, keranjang).
 *
 * Pattern section:
 *   <section border-b-4 border-ink>
 *     <div px-6 md:px-12 py-{size}>
 *       <p eyebrow accent>            ← opsional, prepend "✎" otomatis
 *       <h1 display + accent dot.>    ← opsional via prop `accent`
 *       <p subtitle italic border-l> ← opsional
 *       {children}                    ← slot untuk actions (mis. NLink "Continue Shopping")
 *     </div>
 *   </section>
 *
 * Konsolidasi 4 call site (display, develop, discover, keranjang) yang sebelumnya
 * duplicate markup identik. Typography pakai Tailwind tokens (`text-headline-xl`,
 * `text-body-lg`) yang sudah defined di globals.css.
 *
 * ponytail: kalau halaman butuh 2 kolom (heading + actions side-by-side di desktop),
 * pakai prop `actions` untuk render NLink/Button sejajar h1 di kanan.
 */

import type { ReactNode } from 'react';

type Size = 'compact' | 'default' | 'tall';

interface Props {
  /** Eyebrow accent text di atas heading, prefix "✎ " ditambahkan otomatis. */
  eyebrow?: string;
  /** Heading display. Jika `accent=true`, append `<span class="text-primary">.</span>`. */
  title: string;
  /** Append primary-colored period di akhir title. Default true. */
  accent?: boolean;
  /** Subtitle italic dengan border-left accent. */
  subtitle?: string;
  /** Slot kanan header (mis. NLink "Continue Shopping"). */
  actions?: ReactNode;
  /** Konten tambahan di bawah subtitle (jarak mt-8). */
  children?: ReactNode;
  /** Section vertical padding. Default 'tall' (py-20 md:py-28). */
  size?: Size;
}

const PAD: Record<Size, string> = {
  compact: 'py-16 md:py-20',
  default: 'py-20 md:py-24',
  tall: 'py-20 md:py-28',
};

export function PageHeader({
  eyebrow,
  title,
  accent = true,
  subtitle,
  actions,
  children,
  size = 'tall',
}: Props) {
  return (
    <section className="border-b-4 border-ink">
      <div className={`mx-auto max-w-screen-2xl px-6 md:px-12 ${PAD[size]}`}>
        {eyebrow && (
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
            ✎ {eyebrow}
          </p>
        )}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h1 className="font-display text-5xl sm:text-6xl md:text-headline-xl text-ink break-words">
            {title}
            {accent && <span className="text-primary">.</span>}
          </h1>
          {actions && <div className="self-start lg:self-auto">{actions}</div>}
        </div>
        {subtitle && (
          <p className="mt-8 font-body text-body-lg italic text-ink/80 max-w-2xl border-l-4 border-accent pl-6">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}