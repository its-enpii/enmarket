import Link from 'next/link';

import { EmptyState } from '@/components/public/EmptyState';
import { cartApi, PublicFetchError } from '@/lib/cart-api';
import { readCartSession } from '@/lib/cart-session';

import { CheckoutForm } from './CheckoutForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Checkout — enpiistudio Store',
  description: 'Isi data diri dan lakukan pembayaran.',
};

export default async function CheckoutPage() {
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
            cta={{ href: '/katalog', label: 'Lihat Katalog →' }}
          />
        </div>
      );
    }
    throw err;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <EmptyState
          title="Keranjang kosong"
          message="Tambahkan produk dulu sebelum checkout."
          cta={{ href: '/katalog', label: 'Lihat Katalog →' }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">Checkout</h1>
      <p className="text-sm text-ink/60 mb-8">Isi data dirimu untuk melanjutkan.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8">
        {/* Form */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <h2 className="text-lg font-bold text-ink mb-4">Data Pembeli</h2>
          <CheckoutForm />
        </div>

        {/* Order summary */}
        <aside className="bg-primary text-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-80 mb-3">
            Ringkasan
          </h2>
          <ul className="space-y-2 mb-4">
            {cart.items.map((item) => (
              <li key={item.product_id} className="flex justify-between gap-2 text-sm">
                <span className="truncate">
                  {item.product.nama} <span className="opacity-70">× {item.qty}</span>
                </span>
                <span className="font-bold shrink-0">{item.subtotal_formatted}</span>
              </li>
            ))}
          </ul>
          <div className="border-t-2 border-surface/30 pt-3">
            <p className="text-xs opacity-80">Total</p>
            <p className="text-2xl font-bold leading-none mt-1">{cart.total_formatted}</p>
          </div>
          <p className="mt-4 text-xs opacity-70">
            Metode pembayaran: QRIS via Tripay
          </p>
        </aside>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/keranjang"
          className="text-ink/60 hover:text-primary font-bold underline decoration-2 underline-offset-4"
        >
          ← Kembali ke keranjang
        </Link>
      </p>
    </div>
  );
}