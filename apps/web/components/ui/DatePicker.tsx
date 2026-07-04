'use client';

import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { id as localeId } from 'date-fns/locale';

interface Props {
  /** Nama field form (untuk hidden input submit). */
  name: string;
  /** ISO date string "yyyy-mm-dd" — initial value. */
  defaultValue?: string;
  /** Placeholder saat kosong. */
  placeholder?: string;
  /** Optional label (small uppercase, di atas trigger). */
  label?: string;
  /** Mode single (default) atau range. */
  mode?: 'single';
  /** Disabled state. */
  disabled?: boolean;
  /** Optional className untuk wrapper. */
  className?: string;
  /** ISO date string output — dipanggil saat user pilih tanggal.
   *  Parent bisa pakai untuk trigger form submit / state update. */
  onChange?: (value: string) => void;
  /** Posisi popover relatif ke trigger. Default 'left'. */
  align?: 'left' | 'right';
}

/**
 * Convert Date → "yyyy-mm-dd" (UTC, bukan local — biar konsisten dengan
 * <input type="date"> native yang juga pakai calendar date, not timestamp).
 */
function toIsoDate(d: Date | undefined): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/**
 * DatePicker — NeoBrutalism styled date picker berbasis react-day-picker.
 * Trigger button (border-2, shadow) → klik → popover calendar grid.
 * Selected value ditulis ke hidden input `name={name}` untuk form GET submit.
 *
 * Pakai pola yang sama dengan SelectSearch: trigger button + dropdown panel +
 * outside click close + Escape close.
 */
export function DatePicker({
  name,
  defaultValue,
  placeholder = 'Pilih tanggal…',
  label,
  disabled,
  className = '',
  onChange,
  align = 'left',
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() =>
    parseIsoDate(defaultValue),
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync defaultValue jika berubah (mis. setelah navigation)
  useEffect(() => {
    setSelected(parseIsoDate(defaultValue));
  }, [defaultValue]);

  // Outside click → close
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Escape → close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function handleSelect(d: Date | undefined) {
    setSelected(d);
    const iso = toIsoDate(d);
    if (onChange) onChange(iso);
    // Auto-close setelah pilih (UX native input date)
    setOpen(false);
    triggerRef.current?.focus();
  }

  const isoValue = toIsoDate(selected);
  const displayLabel = isoValue
    ? new Date(isoValue + 'T00:00:00').toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : placeholder;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={`dp-trigger-${name}`}
          className="block text-xs font-bold uppercase tracking-wide mb-1"
        >
          {label}
        </label>
      )}
      <div ref={wrapperRef} className="relative">
        {/* Hidden input untuk form submit (ISO date string) */}
        <input type="hidden" name={name} value={isoValue} />

        {/* Trigger — styling seragam dengan SelectSearch trigger:
            border-2 ink + py-2.5 + font-medium, shadow hard-offset muncul on hover/focus. */}
        <button
          ref={triggerRef}
          id={`dp-trigger-${name}`}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={
            'flex items-center justify-between gap-2 w-full text-left ' +
            'bg-surface border-2 border-ink px-3 py-2.5 text-sm font-medium text-ink ' +
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-ink)] ' +
            'focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] ' +
            'transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          }
        >
          <span className={'truncate ' + (isoValue ? 'text-ink' : 'text-ink/40')}>
            {displayLabel}
          </span>
          <CalendarIcon />
        </button>

        {/* Popover */}
        {open && (
          <div
            role="dialog"
            aria-label="Pilih tanggal"
            className="absolute z-50 mt-2 bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
            style={{
              top: '100%',
              left: align === 'left' ? 0 : 'auto',
              right: align === 'right' ? 0 : 'auto',
              width: 'max-content',
              maxWidth: 'calc(100vw - 1rem)',
            }}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              locale={localeId}
              showOutsideDays
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="3" y="4" width="18" height="18" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}