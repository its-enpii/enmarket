/**
 * Marquee strip — animasi teks horizontal pakai CSS keyframes.
 * Pakai untuk efek "ticker" marketplace (label produk / promo yang mengalir).
 * Tidak depend data — visual statis, animasi CSS murni.
 *
 * Pause saat hover agar tidak bikin pusing.
 */
const ITEMS = [
  '⚡ INSTANT DOWNLOAD',
  '🔑 LISENSI RESMI',
  '📦 BUNDLE HEMAT',
  '🎁 SAMPLE GRATIS',
  '💬 BANTUAN WA',
  '🛠️ UPDATE GRATIS',
  '🚧 HMR-OK-12345',
  '✨ KARYA STUDIO ENPII',
  '⚡ INSTANT DOWNLOAD',
  '🔑 LISENSI RESMI',
  '📦 BUNDLE HEMAT',
];

export function MarqueeStrip() {
  // Gandakan sequence biar looping seamless
  const seq = [...ITEMS, ...ITEMS];

  return (
    <div className="relative overflow-hidden border-y-2 border-ink bg-accent text-ink">
      <div
        className="flex whitespace-nowrap py-2 font-mono font-bold text-xs sm:text-sm tracking-widest"
        style={{
          animation: 'marquee 30s linear infinite',
          width: 'max-content',
        }}
      >
        {seq.map((it, i) => (
          <span key={i} className="px-6 inline-flex items-center gap-2">
            <span aria-hidden="true">★</span>
            {it}
            <span aria-hidden="true" className="text-ink/30">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .group-hover-pause:hover > div {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}// HMR-TEST-122516
