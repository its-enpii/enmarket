/**
 * EmptyState — ilustratif empty state untuk admin list.
 *
 * Pattern visual (analog /keranjang empty state):
 *   - 1 box purple besar (bg-primary, 6px hard shadow)
 *   - 1 box gold kecil (w-20 h-20) overlap di kanan-bawah, ~half keluar
 *   - Heading uppercase bold + body 1 line + CTA optional
 *
 * Tone: confident, studio, bukan "blank stare". Pakai untuk empty list,
 * empty search result, empty filter result.
 *
 * @example
 *   <EmptyState
 *     title="Belum ada catatan"
 *     body="Catatan pertama akan muncul di sini setelah dibuat."
 *     action={<Link href="/admin/posts/new"><Button>+ Catatan Baru</Button></Link>}
 *   />
 */

import type { ReactNode } from 'react';

interface Props {
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: Props) {
  return (
    <div className="border-2 border-ink bg-surface shadow-[6px_6px_0_0_var(--color-ink)] p-8 md:p-12">
      <div className="flex flex-col md:flex-row md:items-center gap-8">
        {/* Illustration — purple box + gold square overlap */}
        <div className="relative inline-block shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-primary border-4 border-ink shadow-[10px_10px_0_0_var(--color-ink)] flex items-center justify-center">
            <span className="font-display text-5xl md:text-6xl font-black uppercase text-surface">
              ∅
            </span>
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-5 -right-5 w-16 h-16 md:w-20 md:h-20 bg-accent border-4 border-ink shadow-[6px_6px_0_0_var(--color-ink)] z-10"
          />
        </div>

        {/* Text + CTA */}
        <div className="flex-1 min-w-0">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-2">
            ✎ Empty
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight text-ink">
            {title}
          </h3>
          {body && (
            <p className="mt-3 font-body text-body-md text-ink/70 max-w-md">
              {body}
            </p>
          )}
          {action && <div className="mt-5">{action}</div>}
        </div>
      </div>
    </div>
  );
}