'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * Search bar — submit GET form ke /katalog?q=...
 * Pertahankan category filter kalau ada.
 */
export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(defaultValue);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (q.trim()) {
      sp.set('q', q.trim());
    } else {
      sp.delete('q');
    }
    sp.delete('page'); // reset pagination
    const qs = sp.toString();
    router.push(qs ? `/katalog?${qs}` : '/katalog');
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari produk…"
        className="flex-1 bg-surface border-2 border-ink px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
      />
      <button
        type="submit"
        className="bg-primary text-surface border-2 border-ink px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all"
      >
        Cari
      </button>
    </form>
  );
}