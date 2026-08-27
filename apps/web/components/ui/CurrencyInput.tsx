'use client';

import { forwardRef, InputHTMLAttributes, useCallback, useState } from 'react';

import { INPUT_BASE_CLS } from './form-tokens';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  /** Controlled raw numeric value (string, e.g. "150000"). */
  value: string;
  /** Callback dengan raw numeric string (tanpa separator). */
  onChange: (raw: string) => void;
}

/**
 * Format angka ke string dengan titik ribuan (id-ID).
 * "150000" → "150.000", "" → ""
 */
function formatDisplay(raw: string): string {
  if (!raw) return '';
  const num = parseInt(raw, 10);
  if (Number.isNaN(num)) return raw;
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Strip semua karakter non-digit dari string.
 * "150.000" → "150000", "Rp 50.000" → "50000"
 */
function stripNonDigits(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * CurrencyInput — input harga Rupiah dengan prefix "Rp" dan
 * thousand separator otomatis (titik). Value yang di-submit ke
 * FormData tetap angka mentah (e.g. "150000").
 *
 * NeoBrutalism styling konsisten dengan Input component.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, Props>(function CurrencyInput(
  { value, onChange, name, disabled, readOnly, className = '', placeholder, ...rest },
  ref,
) {
  const [displayValue, setDisplayValue] = useState(() => formatDisplay(value));

  // Sync display saat controlled value berubah dari luar
  // (e.g. toggle isFree → value jadi "0")
  const prevRawRef = useCallback(
    (newVal: string) => {
      const stripped = stripNonDigits(displayValue);
      if (stripped !== newVal) {
        setDisplayValue(formatDisplay(newVal));
      }
    },
    [displayValue],
  );

  // Effect-like sync: jika value prop berubah, update display
  if (stripNonDigits(displayValue) !== value && value !== undefined) {
    // Ini safe karena hanya terjadi saat prop berubah dari parent
    // (bukan dari user typing), tidak akan infinite loop.
    prevRawRef(value);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = stripNonDigits(e.target.value);
    setDisplayValue(formatDisplay(raw));
    onChange(raw);
  }

  return (
    <div className="relative">
      {/* Hidden input untuk FormData submission — raw numeric value */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Prefix Rp */}
      <span
        className={
          'absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-ink/60 pointer-events-none select-none' +
          (disabled ? ' opacity-50' : '')
        }
      >
        Rp
      </span>

      {/* Visible formatted input */}
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder ?? '0'}
        className={`${INPUT_BASE_CLS} pl-10 font-mono tabular-nums ${className}`}
        {...rest}
      />
    </div>
  );
});