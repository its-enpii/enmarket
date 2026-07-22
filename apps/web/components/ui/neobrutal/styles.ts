/**
 * Neobrutal design tokens — single source of truth.
 *
 * Semua interactive styling (border + shadow + translate + transition)
 * dikonsentrasikan di sini. Consumer (Button.tsx, Card.tsx, Link.tsx)
 * compose dari constants ini — sehingga 1 perubahan style propagate ke
 * SELURUH app lewat touch satu file ini.
 *
 * CATATAN: paket translate-on-hover dipakai (bukan pseudo-element wrapper)
 * karena:
 *   1. 22 call-site existing sudah pakai pola ini → zero behavior change saat refactor.
 *   2. Pseudo-element butuh extra DOM, refactor invasif.
 *   3. Konsistensi > presisi. Kalau nanti mau "physical press" mechanic,
 *      upgrade di file ini tanpa nyentuh call-site.
 *
 * Token referensi (globals.css):
 *   --color-primary  #3D348B
 *   --color-accent   #E6AF2E
 *   --color-surface  #F3F3F3
 *   --color-ink      #040303
 *   --border-width-neobrutal: 4px
 *   --shadow-offset-neobrutal: 6px
 */

// ───── Border + corner ─────
export const BORDER = 'border-2 border-ink';
export const BORDER_THICK = 'border-4 border-ink';

// ───── Shadow sizes ─────
//
// Spec (.design/DESIGN.md):
//   "Shadow: solid #040303 100% opacity, offset 6px bottom-right.
//    On hover/active, buttons 'press down' by reducing offset to 2px
//    or 0px, mimicking a physical mechanical click."
//
// Jadi alur mekanik yang benar:
//   default : 6px6px
//   hover   : 2px2px   ← tekan ke arah shadow (offset mengecil)
//   active  : 0px0px   ← fully pressed, menyatu dengan shadow
//
// Penting: SHADOW_HOVER & SHADOW_PRESS dipakai BERSAMA dengan
// translate positif (ke arah shadow) sehingga button kelihatan
// "masuk" ke shadow. Bukan lift ke atas (itu material design).

/** Default 6px6px hard shadow — state idle. */
export const SHADOW_BASE = 'shadow-[6px_6px_0_0_var(--color-ink)]';
/** Press/hover state — shadow mengecil ke 2px2px. */
export const SHADOW_PRESS = 'shadow-[2px_2px_0_0_var(--color-ink)]';
/** Fully pressed state — shadow 0, button menyatu dengan surface. */
export const SHADOW_PRESS_DEEP = 'shadow-[0_0_0_0_var(--color-ink)]';

/** Compact 3px3px hard shadow. Untuk button kecil / chip / nav. */
export const SHADOW_SM_BASE = 'shadow-[3px_3px_0_0_var(--color-ink)]';
export const SHADOW_SM_PRESS = 'shadow-[1px_1px_0_0_var(--color-ink)]';

// ───── Press translate ─────

/** Default press — 2px diagonal ke arah shadow (down-right). Pakai 0.5 (2px) Tailwind default */
export const LIFT_HOVER = 'hover:translate-x-0.5 hover:translate-y-0.5';
export const LIFT_PRESS = 'active:translate-x-0.5 active:translate-y-0.5';

/** Compact press — 1px diagonal. Pakai arbitrary [1px]. */
export const LIFT_SM_HOVER = 'hover:translate-x-[1px] hover:translate-y-[1px]';
export const LIFT_SM_PRESS = 'active:translate-x-[1px] active:translate-y-[1px]';

// ───── Transition ─────
/**
 * transition-all dengan transform-gpu untuk menghindari bug garis abu-abu
 * (sub-pixel ghosting) di Chromium saat elemen ber-border tebal ditranslasi.
 * Juga kita set will-change-transform.
 */
export const TRANSITION = 'transition-all will-change-transform';

/** Disable lift saat button disabled — translate ditahan di posisi netral. */
export const DISABLED_RESET =
  'disabled:hover:translate-x-0 disabled:hover:translate-y-0 ' +
  'disabled:active:translate-x-0 disabled:active:translate-y-0';

// ───── Composed base ─────

/**
 * Interactive base untuk button ukuran standar (md/lg).
 *
 * Mechanics (neobrutal "press down"):
 *   default : 6px6px shadow
 *   hover   : translate [2px,2px] + shadow 2px2px  → tombol "masuk" ke shadow
 *   active  : translate [2px,2px] + shadow 2px2px  → sama, deep pressed
 */
export const INTERACTIVE_BASE = [
  BORDER,
  SHADOW_BASE,
  LIFT_HOVER,
  LIFT_PRESS,
  'hover:shadow-[2px_2px_0_0_var(--color-ink)]',
  'active:shadow-[2px_2px_0_0_var(--color-ink)]',
  TRANSITION,
].join(' ');

/** Interactive base untuk button ukuran kecil (sm). */
export const INTERACTIVE_BASE_SM = [
  BORDER,
  SHADOW_SM_BASE,
  LIFT_SM_HOVER,
  LIFT_SM_PRESS,
  'hover:shadow-[1px_1px_0_0_var(--color-ink)]',
  'active:shadow-[1px_1px_0_0_var(--color-ink)]',
  TRANSITION,
].join(' ');

// ───── Button variant fills ─────

export type ButtonVariant = 'primary' | 'accent' | 'surface' | 'outline' | 'ink';

export const BUTTON_VARIANT_CLS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-surface',
  accent: 'bg-accent text-ink',
  surface: 'bg-surface text-ink',
  outline: 'bg-transparent text-ink',
  ink: 'bg-ink text-surface',
};

// ───── Button sizes ─────

export type ButtonSize = 'sm' | 'md' | 'lg';

export const BUTTON_SIZE_CLS: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[40px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]',
  lg: 'px-12 py-5 text-lg sm:text-xl min-h-[56px] font-black uppercase',
};

// ───── Card variant fills ─────

export type CardVariant = 'surface' | 'filled-primary' | 'filled-accent' | 'ink';

export const CARD_VARIANT_CLS: Record<CardVariant, string> = {
  surface: 'bg-surface text-ink',
  'filled-primary': 'bg-primary text-surface',
  'filled-accent': 'bg-accent text-ink',
  ink: 'bg-ink text-surface',
};

// ───── Link variant ─────

export type LinkVariant = 'default' | 'primary' | 'on-dark';

export const LINK_VARIANT_CLS: Record<LinkVariant, string> = {
  default: 'text-ink hover:text-primary',
  primary: 'text-primary hover:text-accent',
  'on-dark': 'text-surface/80 hover:text-accent',
};
