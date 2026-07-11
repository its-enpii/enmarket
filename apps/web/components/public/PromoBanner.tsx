import Link from 'next/link';

/**
 * Strip promo tipis di paling atas homepage — marketplace vibe.
 * Hard-border ink, badge accent, scrollable horizontal di mobile
 * agar tidak makan ruang vertikal.
 *
 * Tone: benefit, bukan hard-sell ("Gratis ongkir" / "Lisensi resmi").
 */
export function PromoBanner() {
  const items: Array<{ icon: string; text: string; href?: string }> = [
    { icon: '⚡', text: 'Instant download — bayar, langsung unduh' },
    { icon: '🔑', text: 'Lisensi resmi & garansi update' },
    { icon: '📦', text: 'Bundle hemat untuk karya favorit' },
    { icon: '💬', text: 'Bantuan via WhatsApp setiap hari' },
    { icon: '🎁', text: 'Sample gratis untuk pemula' },
  ];

  return (
    <div className="border-y-2 border-ink bg-ink text-surface overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-2 overflow-x-auto whitespace-nowrap text-xs sm:text-sm font-bold uppercase tracking-wider scrollbar-none">
          <span className="shrink-0 bg-accent text-ink border-2 border-accent px-2 py-0.5 text-[10px] sm:text-xs">
            🔥 PROMO
          </span>
          {items.map((it, i) => (
            <span key={i} className="shrink-0 inline-flex items-center gap-1.5">
              <span aria-hidden="true">{it.icon}</span>
              {it.href ? (
                <Link href={it.href} className="hover:text-accent transition-colors">
                  {it.text}
                </Link>
              ) : (
                <span>{it.text}</span>
              )}
              {i < items.length - 1 && (
                <span aria-hidden="true" className="ml-3 text-surface/30">
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}