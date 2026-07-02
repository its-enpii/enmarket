import Link from 'next/link';

import { EmptyState } from '@/components/public/EmptyState';
import { cartApi, PublicFetchError } from '@/lib/cart-api';
import { readCartSession } from '@/lib/cart-session';
import { formatRupiah } from '@/lib/format';

import { CartItemRow } from './CartItemRow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Keranjang — enpiistudio Store',
  description: 'Produk yang sudah kamu tambahkan ke keranjang.',
};

export default async function KeranjangPage() {
  // Cookie akan di-set oleh server action saat addToCart.
  // Di sini cukup baca — kalau belum ada, cart kosong akan ditampilkan.
  await readCartSession();

  let cart;
  try {
    cart = (await cartApi.get()).data;
  } catch (err) {
    if (err instanceof PublicFetchError) {
      return (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <EmptyState
            title="Gagal memuat keranjang"
            message={err.message}
            cta={{ href: '/katalog', label: '← Lihat Katalog' }}
          />
        </div>
      );
    }
    throw err;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-6">Keranjang</h1>
        <EmptyState
          title="Keranjang kamu kosong"
          message="Tambahkan produk dari katalog untuk mulai belanja."
          cta={{ href: '/katalog', label: 'Lihat Katalog →' }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">Keranjang</h1>
      <p className="text-sm text-ink/60 mb-8">
        {cart.item_count} item · Total sementara {cart.total_formatted}
      </p>

      <div className="space-y-3 mb-8">
        {cart.items.map((item) => {
          const p = item.product;
          const thumb = p.preview_images?.[0];
          return (
            <div
              key={item.product_id}
              className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)]"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Thumbnail */}
                <Link
                  href={`/produk/${p.slug}`}
                  className="shrink-0 block w-full sm:w-32 h-32 border-2 border-ink overflow-hidden"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={p.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary text-surface flex items-center justify-center text-xs font-bold">
                      Tanpa Gambar
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produk/${p.slug}`}
                    className="block font-bold text-base sm:text-lg text-ink hover:text-primary line-clamp-2"
                  >
                    {p.nama}
                  </Link>
                  {p.category?.nama && (
                    <p className="text-xs text-ink/60 mt-0.5">{p.category.nama}</p>
                  )}
                  <p className="mt-2 font-bold text-primary text-base">
                    {p.harga_formatted}
                  </p>
                </div>

                {/* Qty + subtotal */}
                <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3 sm:gap-2">
                  <p className="font-bold text-ink text-lg sm:text-xl">
                    {item.subtotal_formatted}
                  </p>
                  <CartItemRow productId={item.product_id} qty={item.qty} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total + checkout */}
      <div className="bg-primary text-surface border-2 border-ink p-6 shadow-[6px_6px_0_0_var(--color-ink)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
              Total Belanja
            </p>
            <p className="text-3xl sm:text-4xl font-bold leading-none mt-1">
              {cart.total_formatted}
            </p>
            <p className="text-xs opacity-70 mt-1">{cart.item_count} item</p>
          </div>
          <Link
            href="/checkout"
            className="inline-block bg-accent text-ink border-2 border-ink px-6 py-4 font-bold text-base shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
          >
            Lanjut Checkout →
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/katalog"
          className="text-ink/60 hover:text-primary font-bold underline decoration-2 underline-offset-4"
        >
          ← Lanjut belanja
        </Link>
      </p>
    </div>
  );
}