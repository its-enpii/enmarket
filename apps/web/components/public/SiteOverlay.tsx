'use client';

/**
 * SiteOverlay — hiasan overlay tonal (GSAP) untuk seluruh storefront publik.
 *
 * Definisi operasional overlay (references/overlay-definition-and-misinterpretations.md §1):
 * lapisan yang MENIMPA/MENUTUPI viewport. Ciri teknis minimal yang WAJIB:
 *   - `position: fixed` + `inset: 0`  → menutupi seluruh viewport
 *   - 100% `pointer-events-none`      → tidak pernah mencegat klik/tab/scroll
 *   - `-z-10`                          → berada DI BAWAH seluruh konten
 *   - `overflow-hidden`                → tidak memicu horizontal scroll
 *   - `aria-hidden="true"`             → murni dekoratif, diabaikan screen reader
 *
 * Lapisan kedalaman parallax (mengikuti kursor via GSAP, `window.innerWidth/2`):
 *   1. Layer 1 (paling dalam) — siku L-bracket 4 sudut, geser halus ~6px.
 *   2. Layer 2 (menengah)     — ruler ticks tepi kiri, precision crosses `+ +`,
 *                               belah ketupat garis tipis; geser ~14px.
 *   3. Layer 3 (foreground)   — koordinat registration tonal, rotating seal
 *                               terukir, HUD status chip; geser ~22px.
 *
 * Gerak kontinu:
 *   - Rotating seal kanan-bawah: rotasi 360° kontinu (25s linear).
 *
 * Gaya tonal (menyatu dengan background):
 *   - Semua ornamen memakai ink ber-alpha tipis (`text-ink/15`–`text-ink/25`,
 *     `border-ink/15`–`border-ink/20`) → menyatu dengan surface off-white,
 *     tanpa warna mencolok (TIDAK ada badge biru/kuning pekat).
 *
 * Aksesibilitas & performa:
 *   - `prefers-reduced-motion: reduce` → semua tween dimatikan, posisi statis.
 *   - Cleanup: `gsap.context().revert()` + `removeEventListener('mousemove')`.
 *
 * Aturan desain:
 *   - 0 raw hex, 0 inline style → hanya token Tailwind + arbitrary value.
 *     Transform hanya melalui JS GSAP (bukan style attribute).
 *   - 100% pointer-events-none → tidak pernah mencegat interaksi.
 *   - BUKAN marquee: tidak ada teks berjalan.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import {
  DraftingCompass,
  DraftingPencil,
  StraightRuler,
  StudioCompass,
  TriangleRuler,
} from './DraftingTools';

/** Kedalaman parallax per layer (px) — diukur dari pusat viewport. */
const PARALLAX_DEPTH = {
  /** Layer 1 — latar paling dalam, gerakan paling lambat. */
  deep: 6,
  /** Layer 2 — ornamen mengambang menengah. */
  mid: 14,
  /** Layer 3 — foreground seal & koordinat, gerakan paling responsif. */
  fore: 22,
} as const;

export function SiteOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctx = gsap.context(() => {
      // ── Gerak kontinu: rotating tonal seal ────────────────────────────────
      if (!prefersReducedMotion) {
        gsap.to('[data-spin]', {
          rotation: 360,
          duration: 25,
          repeat: -1,
          ease: 'none',
        });
      }

      // ── Multi-depth mouse parallax ────────────────────────────────────────
      const layers: ReadonlyArray<readonly [string, number]> = [
        ['[data-parallax="deep"]', PARALLAX_DEPTH.deep],
        ['[data-parallax="mid"]', PARALLAX_DEPTH.mid],
        ['[data-parallax="fore"]', PARALLAX_DEPTH.fore],
      ];

      if (!prefersReducedMotion) {
        const setters = layers.map(([selector, depth]) => ({
          depth,
          x: gsap.quickTo(selector, 'x', { duration: 0.8, ease: 'power2.out' }),
          y: gsap.quickTo(selector, 'y', { duration: 0.8, ease: 'power2.out' }),
        }));

        const onMouseMove = (event: MouseEvent) => {
          const offsetX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
          const offsetY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

          setters.forEach(({ depth, x, y }) => {
            x(offsetX * depth);
            y(offsetY * depth);
          });
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMouseMove);
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* ── Layer 1 (dalam) — siku L-bracket di 4 sudut viewport. ─────────── */}
      <div
        data-parallax="deep"
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-ink/20 pointer-events-none" />
        <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-ink/20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-ink/20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-ink/20 pointer-events-none" />
      </div>

      {/* ── Layer 2 (menengah) — ruler ticks & precision crosses tonal. ───── */}
      <div
        data-parallax="mid"
        className="absolute inset-0 pointer-events-none"
      >
        {/* Canvas artboard ruler ticks di tepi kiri. */}
        <div className="hidden sm:flex flex-col gap-3 absolute top-1/3 left-4 md:left-6 border-r border-ink/15 pr-1 text-ink/20 font-mono text-[8px] select-none pointer-events-none">
          <span>- 00</span>
          <span>- 24</span>
          <span>- 48</span>
          <span>- 72</span>
          <span>- 96</span>
        </div>

        {/* Kuadran kiri-bawah (layer mid) — penggaris segitiga besar.
            Kontras tonal seragam text-ink/20 (menyatu dengan kanvas). */}
        <TriangleRuler size={48} className="hidden sm:block absolute bottom-24 left-8 text-ink/20 rotate-12" />

        {/* Kuadran kanan-tengah (layer mid) — penggaris lurus teknis miring.
            Kontras tonal seragam text-ink/20. */}
        <StraightRuler size={40} className="hidden md:block absolute top-[58%] right-8 text-ink/20 rotate-12" />

        {/* Faint precision crosses & diamond outline di kanan tengah. */}
        <div className="hidden sm:flex flex-col items-center gap-2 absolute top-1/2 right-6 md:right-8 text-ink/25 font-mono select-none pointer-events-none">
          <span className="text-xs font-bold">+</span>
          <div className="w-3.5 h-3.5 border border-ink/20 rotate-45" />
          <span className="text-xs font-bold">+</span>
        </div>
      </div>

      {/* ── Layer 3 (foreground) — koordinat, tonal seal & HUD chip. ──────── */}
      <div data-parallax="fore" className="absolute inset-0 pointer-events-none">
        {/* Tonal registration coordinates tepi atas. */}
        <div className="hidden sm:block absolute top-6 left-12 font-mono text-[9px] font-bold tracking-[0.25em] text-ink/25 uppercase select-none pointer-events-none">
          + [CANVAS // 100VW]
        </div>
        <div className="hidden sm:block absolute top-6 right-12 font-mono text-[9px] font-bold tracking-[0.25em] text-ink/25 uppercase select-none pointer-events-none">
          [WORKSPACE // CORE] +
        </div>

        {/* Kuadran kiri-atas (layer fore) — jangka sedang, dekat koordinat
            + [CANVAS // 100VW]. Kontras tonal monokrom text-ink/20. */}
        <DraftingCompass size={40} className="hidden sm:block absolute top-14 left-10 text-ink/20 -rotate-12" />

        {/* Kuadran kanan-atas (layer fore) — pensil drafting miring,
            dekat [WORKSPACE // CORE] +. Kontras tonal text-ink/25. */}
        <DraftingPencil size={40} className="hidden sm:block absolute top-12 right-12 text-ink/25 -rotate-45" />

        {/* Kuadran kanan-bawah (layer fore) — kompas studio di atas rotating
            seal. Kontras tonal monokrom text-ink/25. */}
        <StudioCompass size={32} className="hidden sm:block absolute bottom-36 right-10 text-ink/25" />

        {/* Tonal etched rotating seal kanan bawah (desktop). */}
        <div className="hidden sm:block absolute bottom-16 right-8 w-16 h-16 pointer-events-none">
          <div className="relative w-16 h-16 border border-ink/20 bg-surface/30 pointer-events-none">
            <svg
              data-spin
              className="absolute inset-0 h-full w-full text-ink/25 pointer-events-none"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <defs>
                <path
                  id="site-overlay-seal-path"
                  d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                />
              </defs>
              <text className="fill-current font-mono text-[9px] tracking-[0.18em]">
                <textPath href="#site-overlay-seal-path" startOffset="0%">
                  ★ ENSTUDIO DIGITAL CRAFT ★ 2026 ★
                </textPath>
              </text>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-ink/30 text-lg pointer-events-none">
              ✦
            </span>
          </div>
        </div>

        {/* Tonal HUD status chip kiri bawah (desktop). */}
        <div className="hidden sm:block absolute bottom-6 left-6 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface/60 border border-ink/20 text-ink/40 text-[9px] font-mono tracking-wider uppercase select-none pointer-events-none">
            <span className="w-2 h-2 border border-ink/20" />
            ENSTUDIO · DIGITAL WORKSPACE
          </div>
        </div>
      </div>
    </div>
  );
}
