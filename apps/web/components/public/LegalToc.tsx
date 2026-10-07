'use client';

import { useEffect, useState } from 'react';

export interface LegalTocItem {
  id: string;
  label: string;
}

interface Props {
  items: LegalTocItem[];
  /** Class tambahan untuk item yang sedang aktif (mis. warna aktif). */
  activeClassName?: string;
}

/**
 * LegalToc — daftar isi dokumen legal bergaya neobrutalis (bukan zine/arsip).
 *
 * Setiap item dibungkus link dengan padding rapi (`px-3.5 py-2.5`) dan
 * state neobrutalis yang jelas:
 *   - aktif   : kotak accent + border-ink + shadow-brutal-2 + translate-x-1,
 *               nomor & bullet pakai ink (kontras tinggi, TIDAK kuning-di-kuning)
 *   - nonaktif: border transparan, hover memunculkan border-ink + shadow
 *
 * Bug lama: item aktif memakai `bg-accent text-ink` sementara nomor 2-digit
 * masih `text-accent` dan bullet masih `bg-accent` → kuning di atas kuning
 * sehingga nomor & bullet jadi tak terbaca. Sekarang keduanya dipaksa ink.
 *
 * Client component: IntersectionObserver menandai section yang terlihat
 * sebagai baris aktif. Fallback aman kalau IntersectionObserver tidak ada.
 */
export function LegalToc({ items, activeClassName = '' }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <ol className="list-none flex flex-col gap-1.5">
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? 'true' : undefined}
              className={[
                'flex items-start gap-3 px-3.5 py-2.5 transition-all',
                isActive
                  ? `bg-accent border-2 border-ink shadow-brutal-2 font-bold translate-x-1 ${activeClassName}`.trim()
                  : 'border-2 border-transparent hover:border-ink hover:bg-ink/5 hover:shadow-brutal-2',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="shrink-0 inline-flex items-center gap-2 pt-0.5" aria-hidden>
                <span
                  className={`font-label text-label-sm tabular-nums ${
                    isActive ? 'text-ink font-black' : 'text-accent font-bold'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={`w-2 h-2 ${isActive ? 'bg-ink' : 'bg-accent'}`} />
              </span>
              <span
                className={`font-body text-body-sm ${
                  isActive ? 'font-bold text-ink' : 'text-ink/80 hover:text-ink'
                }`}
              >
                {item.label}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
