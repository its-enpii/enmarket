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
import { Eyebrow } from '@/components/ui/neobrutal';
import { CornerCrosshairs } from './BrutalistOverlay';
import {
  DraftingCompass,
  DraftingPencil,
  StraightRuler,
  TriangleRuler,
} from './DraftingTools';

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
    <section className="relative border-b-4 border-ink">
      <div className={`relative mx-auto max-w-screen-2xl px-6 md:px-12 ${PAD[size]}`}>
        <CornerCrosshairs />
        {/* Badge teknis di pojok kanan atas header (desktop). */}
        <div
          aria-hidden="true"
          className="hidden md:inline-block absolute top-4 right-6 max-w-[40%] pointer-events-none font-mono text-[11px] text-ink/30 border border-ink/20 px-2 py-0.5 tracking-widest uppercase"
        >
          [ARCHIVE // SPEC-01]
        </div>
        {/*
         * Ornamen drafting tools (watermark kanvas Layer 3) disebar mandiri di
         * 4 sudut/tepi header — bukan klaster menumpuk. Kontras tonal monokrom
         * seragam text-ink/20–text-ink/25 agar tenang & tidak mengaburkan headline.
         * 100% pointer-events-none select-none (aman dari interaksi).
         */}
        <DraftingPencil size={36} className="hidden lg:block absolute top-6 right-28 text-ink/25 -rotate-12" />
        <TriangleRuler size={44} className="hidden md:block absolute bottom-6 right-8 text-ink/20 rotate-6" />
        <DraftingCompass size={36} className="hidden sm:block absolute bottom-4 left-6 md:left-12 text-ink/20 -rotate-6" />
        <StraightRuler size={40} className="hidden xl:block absolute top-1/2 right-40 -translate-y-1/2 text-ink/20" />
        {eyebrow && (
          <div className="flex items-center gap-3 mb-6">
            <Eyebrow size="md" color="accent">
              ✎ {eyebrow}
            </Eyebrow>
          </div>
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