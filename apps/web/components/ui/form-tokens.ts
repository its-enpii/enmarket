/**
 * Design tokens untuk form elements.
 * Konsisten di semua halaman (admin + public).
 *
 * Style NeoBrutalism enmarket:
 * - Border 2px ink, surface bg
 * - Focus: geser 2px + shadow offset
 * - Min height 44px (tap target)
 * - Typography: text-ink, placeholder 40% opacity
 *
 * Pakai:
 *   <input className={INPUT_BASE_CLS + ' ' + className} />
 *   atau langsung <Input /> component di components/ui/Input.tsx
 */

export const INPUT_BASE_CLS =
  'block w-full bg-surface border-2 border-ink text-ink placeholder:text-ink/40 ' +
  'px-3 py-2.5 text-sm font-medium ' +
  'focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] ' +
  'focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const INPUT_SM_CLS =
  'block w-full bg-surface border-2 border-ink text-ink placeholder:text-ink/40 ' +
  'px-2 py-1 text-sm ' +
  'focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const INPUT_FLAT_CLS =
  'block w-full bg-surface border-2 border-ink text-ink placeholder:text-ink/40 ' +
  'px-3 py-2 text-sm ' +
  'focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

/** Select native — pakai base yang sama dengan input, plus arrow indicator */
export const SELECT_CLS =
  INPUT_BASE_CLS +
  ' pr-9 appearance-none cursor-pointer ' +
  'bg-[length:0.65rem] bg-no-repeat ' +
  'bg-[position:right_0.75rem_center] ' +
  '[background-image:url("data:image/svg+xml,%3Csvg_xmlns=%27http://www.w3.org/2000/svg%27_viewBox=%270_0_20_20%27_fill=%27%23040303%27%3E%3Cpath_fill-rule=%27evenodd%27_d=%27M5.23_7.21a.75.75_0_011.06.02L10_11.06l3.71-3.83a.75.75_0_111.08_1.04l-4.25_4.39a.75.75_0_01-1.08_0L5.21_8.27a.75.75_0_01.02-1.06z%27_clip-rule=%27evenodd%27/%3E%3C/svg%3E")]';

export const SELECT_FLAT_CLS =
  INPUT_FLAT_CLS +
  ' pr-9 appearance-none cursor-pointer ' +
  'bg-[length:0.65rem] bg-no-repeat ' +
  'bg-[position:right_0.75rem_center] ' +
  '[background-image:url("data:image/svg+xml,%3Csvg_xmlns=%27http://www.w3.org/2000/svg%27_viewBox=%270_0_20_20%27_fill=%27%23040303%27%3E%3Cpath_fill-rule=%27evenodd%27_d=%27M5.23_7.21a.75.75_0_011.06.02L10_11.06l3.71-3.83a.75.75_0_111.08_1.04l-4.25_4.39a.75.75_0_01-1.08_0L5.21_8.27a.75.75_0_01.02-1.06z%27_clip-rule=%27evenodd%27/%3E%3C/svg%3E")]';

export const TEXTAREA_CLS =
  'block w-full bg-surface border-2 border-ink text-ink placeholder:text-ink/40 ' +
  'px-3 py-2.5 text-sm font-medium resize-y ' +
  'focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] ' +
  'focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const LABEL_CLS =
  'block text-xs font-bold uppercase tracking-wide text-ink mb-1.5';

export const LABEL_INLINE_CLS =
  'block text-sm font-bold uppercase tracking-wide text-ink mb-1.5';

export const HINT_CLS = 'mt-1 text-xs text-ink/60';
export const ERROR_CLS = 'mt-1 text-xs font-bold text-primary';

/** Checkbox & radio — NeoBrutalism style (square, ink border, primary check) */
export const CHECKBOX_CLS =
  'h-5 w-5 shrink-0 appearance-none border-2 border-ink bg-surface ' +
  'checked:bg-primary checked:shadow-[2px_2px_0_0_var(--color-ink)] ' +
  'focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] ' +
  'transition-all cursor-pointer disabled:opacity-50';

export const RADIO_CLS = CHECKBOX_CLS + ' rounded-full';

export const FILE_INPUT_CLS =
  'block w-full text-sm text-ink ' +
  'file:mr-3 file:py-2 file:px-4 ' +
  'file:border-2 file:border-ink ' +
  'file:bg-accent file:text-ink file:font-bold ' +
  'file:shadow-[2px_2px_0_0_var(--color-ink)] ' +
  'file:cursor-pointer file:transition-all ' +
  'hover:file:-translate-x-[1px] hover:file:-translate-y-[1px] ' +
  'hover:file:shadow-[3px_3px_0_0_var(--color-ink)]';