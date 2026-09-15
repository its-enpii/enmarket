import { forwardRef, InputHTMLAttributes } from 'react';

import { INPUT_BASE_CLS, INPUT_SM_CLS, INPUT_FLAT_CLS } from './form-tokens';

type Variant = 'default' | 'sm' | 'flat';

/**
 * Tipe yang didukung <Input>. Sengaja dibatasi:
 * - `tel` / `url` / `search` → pakai `text` + `inputMode` (keyboard mobile tetap benar,
 *   styling konsisten, tanpa validasi browser yang beda-beda)
 * - `date` / `datetime-local` → pakai <DatePicker> atau <input> native + INPUT_*_CLS
 * - `file` / `checkbox` / `radio` → pakai <FileInput> / <Checkbox> / <Radio>
 */
export const INPUT_TYPES = ['text', 'email', 'password', 'number'] as const;
export type InputType = (typeof INPUT_TYPES)[number];

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: Variant;
  type?: InputType;
}

/**
 * Runtime guard untuk `type`. Type narrowing saja tidak cukup — nilai bisa datang
 * dari props dinamis / `as any` / data server. Tipe tidak valid → dev warning +
 * fallback 'text' (render tetap jalan, tidak crash di production).
 */
function resolveType(type: unknown): InputType {
  if (type === undefined || type === null || type === '') return 'text';
  if ((INPUT_TYPES as readonly unknown[]).includes(type)) return type as InputType;

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Input] type="${String(type)}" tidak didukung. Pakai salah satu dari: ${INPUT_TYPES.join(
        ', ',
      )} (untuk tel/url/search pakai type="text" + inputMode). Fallback ke "text".`,
    );
  }
  return 'text';
}

/**
 * Input standar. Variant:
 * - default (py-2.5, focus geser + shadow) — untuk form besar
 * - sm (py-1, focus shadow tanpa geser) — untuk inline toolbar (LiveFilterBar)
 * - flat (py-2, focus shadow tanpa geser) — untuk input yang menyatu dengan kontainer
 */
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { variant = 'default', type, className = '', ...rest },
  ref,
) {
  const base = variant === 'sm' ? INPUT_SM_CLS : variant === 'flat' ? INPUT_FLAT_CLS : INPUT_BASE_CLS;
  const resolvedType = resolveType(type);
  return <input ref={ref} type={resolvedType} className={`${base} ${className}`} {...rest} />;
});
