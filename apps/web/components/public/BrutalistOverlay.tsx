/**
 * BrutalistOverlay — hiasan-hiasan overlay arsitektural & zine-inspired untuk
 * storefront publik.
 *
 * Komponen ini murni dekoratif (0 state, 0 data-fetch). Semua elemen WAJIB
 * `pointer-events-none` supaya tidak pernah menghalangi interaksi pengguna
 * pada teks, tautan, maupun tombol CTA di bawahnya.
 *
 * Aturan desain yang dipatuhi (lihat .design/DESIGN.md §Brand & Style):
 *   - 0 raw hex   → hanya token Tailwind (`text-ink`, `bg-accent`, dll)
 *   - 0 inline style (kecuali nilai dinamis — di sini tidak ada)
 *   - High-contrast impact, hard offset shadow tanpa blur, tanpa gradient
 *
 * Sub-komponen:
 *   - CornerCrosshairs → tanda registrasi "+" di 4 sudut induk
 *   - TechnicalSticker → stiker zine melayang (accent/surface/primary)
 *
 * Catatan: `ViewportRegistrationOverlay` (label `[ZINE-EDITION: 2026]` dkk.
 * yang menempel fixed di 4 pojok viewport) SENGAJA TIDAK disertakan lagi —
 * teks teknis fixed itu terbaca mengganggu di seluruh halaman. Karakter teknis
 * kini dibawa oleh stiker/ribbon in-flow (Hero) dan badge PageHeader.
 */

import type { ReactNode } from 'react';

interface ClassNameProps {
  className?: string;
}

/**
 * Empat tanda registrasi crosshair `+` pada sudut container induk.
 * Induk HARUS punya `position: relative` (pasang `relative` pada section).
 * Offset positif kecil (`top-1 left-1` = 4px) menempatkan tanda DI DALAM
 * batas induk sehingga tidak pernah memperlebar `document.scrollWidth`
 * (menghindari horizontal overflow dari offset negatif).
 */
export function CornerCrosshairs({ className = '' }: ClassNameProps) {
  const cross =
    'absolute font-mono text-sm font-bold text-ink/40 select-none pointer-events-none';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none ${className}`.trim()}
    >
      <span className={`${cross} top-1 left-1`}>+</span>
      <span className={`${cross} top-1 right-1`}>+</span>
      <span className={`${cross} bottom-1 left-1`}>+</span>
      <span className={`${cross} bottom-1 right-1`}>+</span>
    </div>
  );
}

type StickerVariant = 'accent' | 'surface' | 'primary';

const STICKER_VARIANT_CLS: Record<StickerVariant, string> = {
  accent: 'bg-accent text-ink',
  surface: 'bg-surface text-ink',
  primary: 'bg-primary text-surface',
};

interface TechnicalStickerProps {
  /** Teks stiker (uppercase otomatis lewat CSS). */
  text: string;
  /** Skema warna stiker. Default 'accent'. */
  variant?: StickerVariant;
  /** Class rotasi Tailwind, mis. '-rotate-2', 'rotate-2', '-rotate-1'. */
  rotate?: string;
  /** Ikon/ReactNode opsional di depan teks. */
  icon?: ReactNode;
  className?: string;
}

/**
 * Stiker neobrutalis melayang bergaya zine. Selalu `pointer-events-none`
 * supaya aman ditempatkan di atas area konten.
 */
export function TechnicalSticker({
  text,
  variant = 'accent',
  rotate = '-rotate-2',
  icon,
  className = '',
}: TechnicalStickerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider border-2 border-ink shadow-brutal-2 pointer-events-none select-none ${STICKER_VARIANT_CLS[variant]} ${rotate} ${className}`.trim()}
    >
      {icon}
      {text}
    </span>
  );
}
