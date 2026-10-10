/**
 * DraftingTools — kit ornamen studio arsitektur/drafting untuk storefront publik.
 *
 * Menyediakan elemen fisik alat kerja studio (pensil teknis, penggaris segitiga,
 * penggaris lurus, jangka) sebagai watermark kanvas cetak biru (Layer 3) yang
 * tenang — memperkuat identitas "Raw Architecture & Digital Craft"
 * (docs/design.md §1 & §7) dan mengisi area kosong tanpa berteriak.
 *
 * Sumber ikon resmi: package `lucide-react` (Pencil, Ruler, DraftingCompass,
 * Compass, PencilRuler). Tidak ada lagi path SVG manual.
 *
 * Aturan desain yang dipatuhi (docs/design.md §1, §4, §7, §10):
 *   - ZERO raw hex  → semua warna via token Tailwind (`text-ink/20`–`text-ink/25`).
 *   - ZERO inline style → tidak ada atribut `style="..."`.
 *   - 100% `pointer-events-none select-none` → tidak pernah mencegat klik/tab/scroll.
 *   - Semua ikon `aria-hidden="true"` → murni dekoratif (tekstur kanvas/watermark).
 *   - Stroke lebar konsisten `strokeWidth={1.5}` dari Lucide icon.
 *   - Hiasan overlay/background = tonal monokrom saja (`text-ink/20`–`text-ink/25`),
 *     dilarang warna jenuh (`text-accent/*`, `text-primary/*`) yang bertabrakan
 *     dengan konten primer.
 */

import {
  Pencil as LucidePencil,
  Ruler as LucideRuler,
  DraftingCompass as LucideDraftingCompass,
  Compass as LucideCompass,
  PencilRuler as LucidePencilRuler,
} from 'lucide-react';

interface ToolProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const BASE_CLS = 'pointer-events-none select-none transition-colors';

export function DraftingPencil({ className = '', size = 32, strokeWidth = 1.5 }: ToolProps) {
  return (
    <LucidePencil
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={`${BASE_CLS} ${className}`.trim()}
    />
  );
}

export function TriangleRuler({ className = '', size = 36, strokeWidth = 1.5 }: ToolProps) {
  return (
    <LucidePencilRuler
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={`${BASE_CLS} ${className}`.trim()}
    />
  );
}

export function StraightRuler({ className = '', size = 36, strokeWidth = 1.5 }: ToolProps) {
  return (
    <LucideRuler
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={`${BASE_CLS} ${className}`.trim()}
    />
  );
}

export function DraftingCompass({ className = '', size = 36, strokeWidth = 1.5 }: ToolProps) {
  return (
    <LucideDraftingCompass
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={`${BASE_CLS} ${className}`.trim()}
    />
  );
}

export function StudioCompass({ className = '', size = 32, strokeWidth = 1.5 }: ToolProps) {
  return (
    <LucideCompass
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      className={`${BASE_CLS} ${className}`.trim()}
    />
  );
}
