'use client';

import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useTranslations } from 'next-intl';

import { formatDate as formatShortDate } from '@/lib/format';
import { LABEL_CLS } from './form-tokens';

interface Props {
  name?: string;
  defaultValue?: string; // YYYY-MM-DD
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (isoDate: string) => void;
  align?: 'left' | 'right';
}

function toIsoDate(d: Date | undefined): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoDate(val?: string): Date | undefined {
  if (!val) return undefined;
  const parts = val.split('-');
  if (parts.length !== 3) return undefined;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/**
 * DatePicker — NeoBrutalism styled date picker berbasis react-day-picker.
 * Trigger button (border-2, shadow) → klik → popover calendar grid.
 */
export function DatePicker({
  name,
  defaultValue,
  placeholder,
  label,
  disabled,
  className = '',
  onChange,
  align = 'left',
}: Props) {
  const t = useTranslations('common.ui');
  const actualPlaceholder = placeholder ?? t('datePlaceholder');
  const [open, setOpen] = useState(false);
  const placementRef = useRef<'bottom' | 'top'>('bottom');
  const [selected, setSelected] = useState<Date | undefined>(() =>
    parseIsoDate(defaultValue),
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync internal state kalau defaultValue prop berubah
  useEffect(() => {
    setSelected(parseIsoDate(defaultValue));
  }, [defaultValue]);

  // Click outside to close + Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Hitung placement (flip ke atas kalau mepet viewport bottom) saat open
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 360; // estimasi DayPicker tinggi ~340-360px
    placementRef.current = spaceBelow < popoverHeight && rect.top > popoverHeight ? 'top' : 'bottom';
  }, [open]);

  function handleSelect(date: Date | undefined) {
    setSelected(date);
    const iso = toIsoDate(date);
    onChange?.(iso);
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setSelected(undefined);
    onChange?.('');
  }

  const isoValue = toIsoDate(selected);
  const formattedDisplay = selected ? formatShortDate(isoValue) : '';

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className={LABEL_CLS}>
          {label}
        </label>
      )}

      {/* Hidden input agar form standard (Server Actions / standard POST) bisa baca valuenya */}
      {name && <input type="hidden" name={name} value={isoValue} />}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 border-2 border-ink bg-surface text-ink text-sm font-semibold transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-ink/5'
            : 'hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)]'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <span aria-hidden="true" className="text-base">
            📅
          </span>
          <span className={formattedDisplay ? 'font-mono text-ink' : 'text-ink/60 font-normal'}>
            {formattedDisplay || actualPlaceholder}
          </span>
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClear(e as any);
              }}
              title={t('clear')}
              aria-label={t('clear')}
              className="p-1 hover:bg-ink/10 text-ink/70 hover:text-primary transition-colors text-xs font-bold"
            >
              <Icon name="close" size={14} />
            </span>
          )}
          <span aria-hidden="true" className="text-xs text-ink/70">
            {open ? '▲' : '▼'}
          </span>
        </span>
      </button>

      {/* Popover Calendar */}
      {open && (
        <div
          role="dialog"
          aria-label={t('pickDate')}
          className={`absolute z-nav ${
            placementRef.current === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            align === 'right' ? 'right-0' : 'left-0'
          } bg-surface border-3 border-ink shadow-[6px_6px_0_0_var(--color-ink)] p-3 animate-scale-in`}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected || new Date()}
            className="neobrutal-daypicker"
          />
        </div>
      )}
    </div>
  );
}
import { Icon } from '@/components/ui';
