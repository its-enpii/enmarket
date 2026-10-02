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
 * LegalToc — daftar isi dokumen legal bergaya zine/arsip.
 *
 * Setiap item adalah baris bernomor 2-digit (monospace, accent) + kotak aksen
 * 8px (bukan bullet bulat) + judul section, dipisah garis horizontal tipis.
 * Item terakhir tidak memakai border bawah.
 *
 * Client component: memakai IntersectionObserver untuk menandai section yang
 * sedang terlihat sebagai baris aktif (`bg-accent text-ink border-ink`).
 * Fallback aman kalau IntersectionObserver tidak tersedia (SSR/headless):
 * tidak ada baris aktif, TOC tetap tampil benar tanpa error.
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
    <ol className="list-none border-b-4 border-ink">
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        return (
          <li
            key={item.id}
            className={[
              'flex items-start gap-3 py-2 border-b border-ink/15 last:border-b-0',
              isActive ? `bg-accent text-ink border-ink ${activeClassName}`.trim() : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span
              className="shrink-0 mt-0.5 inline-flex items-center gap-2"
              aria-hidden
            >
              <span className="font-label text-label-sm text-accent tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="w-2 h-2 bg-accent" />
            </span>
            <a
              href={`#${item.id}`}
              className="font-body text-body-sm text-ink/80 hover:text-ink hover:underline underline-offset-4 decoration-accent"
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
