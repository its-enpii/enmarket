'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
  /** Optional secondary text shown dimmer (mis. slug, jumlah produk) */
  hint?: string;
}

interface Props {
  name: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Field label ditampilkan di atas trigger */
  label?: string;
  required?: boolean;
  disabled?: boolean;
  /** Tampilkan tombol clear (×) saat ada value */
  clearable?: boolean;
  /** Tampilkan opsi "Semua…" sebagai value kosong di paling atas */
  showAllOption?: Option;
  /** Pesan error di bawah field */
  error?: string;
}

/**
 * Combobox — searchable select.
 * Trigger menampilkan label value aktif, klik → panel dropdown dengan
 * input search di atas + list opsi yang di-filter.
 *
 * Pakai untuk dropdown panjang (kategori, produk) di mana native <select>
 * tidak punya filter. Untuk list pendek (< 8 opsi), pakai <Select> saja.
 *
 * Mengirim value via hidden input `name`, kompatibel dengan FormData server action.
 */
export function SelectSearch({
  name,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Cari…',
  label,
  required,
  disabled,
  clearable = true,
  showAllOption,
  error,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = controlledValue ?? internalValue;

  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allOptions = showAllOption ? [showAllOption, ...options] : options;
  const selected = allOptions.find((o) => o.value === value);
  const filtered = query
    ? allOptions.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        o.hint?.toLowerCase().includes(query.toLowerCase()),
      )
    : allOptions;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Auto-focus search saat panel terbuka
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Escape close
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

  function selectOption(v: string) {
    if (controlledValue === undefined) setInternalValue(v);
    onChange?.(v);
    setQuery('');
    setOpen(false);
    triggerRef.current?.focus();
  }

  function clearValue() {
    if (controlledValue === undefined) setInternalValue('');
    onChange?.('');
    setQuery('');
  }

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {label}{required && <span className="ml-1 text-primary">*</span>}
        </label>
      )}

      {/* Hidden input untuk submit FormData */}
      <input type="hidden" name={name} value={value} required={required} />

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          'flex items-center justify-between gap-2 w-full text-left ' +
          'bg-surface border-2 border-ink px-3 py-2.5 text-sm font-medium text-ink ' +
          'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-ink)] ' +
          'focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] ' +
          'transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
        }
      >
        <span className={selected ? 'text-ink' : 'text-ink/40'}>
          {selected?.label ?? placeholder}
        </span>
        <span className="flex items-center gap-1">
          {clearable && value && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                clearValue();
              }}
              className="text-ink/40 hover:text-primary font-bold text-base leading-none px-1"
              aria-label="Clear"
            >
              ×
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
        >
          <div className="p-2 border-b-2 border-ink">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-surface border-2 border-ink px-2 py-1.5 text-sm focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-ink/60">Tidak ada hasil.</p>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => selectOption(o.value)}
                    className={
                      'flex w-full text-left px-3 py-2 text-sm border-l-4 ' +
                      (active
                        ? 'bg-primary text-surface border-accent font-bold'
                        : 'border-transparent hover:bg-accent hover:text-ink')
                    }
                  >
                    <span className="flex-1">{o.label}</span>
                    {o.hint && (
                      <span className={'text-xs ' + (active ? 'text-surface/80' : 'text-ink/50')}>
                        {o.hint}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs font-bold text-primary">{error}</p>}
    </div>
  );
}