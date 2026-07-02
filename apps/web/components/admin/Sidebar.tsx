import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Beranda', icon: '◆' },
  { href: '/admin/products', label: 'Produk', icon: '▤' },
  { href: '/admin/categories', label: 'Kategori', icon: '◧' },
  { href: '/admin/orders', label: 'Pesanan', icon: '◊' },
  { href: '/admin/license-keys', label: 'Lisensi', icon: '⚷' },
];

interface Props {
  currentPath: string;
}

export function Sidebar({ currentPath }: Props) {
  return (
    <aside className="w-64 shrink-0 bg-primary border-r-4 border-ink flex flex-col">
      <div className="p-6 border-b-2 border-ink">
        <Link href="/admin" className="block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            enpiistudio
          </p>
          <p className="text-2xl font-bold text-surface leading-none mt-1">
            Admin
          </p>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === '/admin'
              ? currentPath === '/admin'
              : currentPath.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                'flex items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all ' +
                (active
                  ? 'bg-accent text-ink border-ink shadow-[4px_4px_0_0_var(--color-ink)] translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-transparent text-surface border-transparent hover:border-ink hover:bg-accent hover:text-ink')
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-ink">
        <Link
          href="/"
          className="block text-xs font-bold uppercase tracking-wide text-surface/70 hover:text-accent"
        >
          ← Lihat Toko
        </Link>
      </div>
    </aside>
  );
}