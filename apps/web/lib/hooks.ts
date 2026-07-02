'use client';

import { useEffect, useState } from 'react';

/**
 * Debounce a value — return updated value setelah `delay` ms tanpa perubahan.
 * Useful untuk live search input yang push URL setelah user berhenti ngetik.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}