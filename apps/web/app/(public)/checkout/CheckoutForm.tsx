'use client';

import { useActionState } from 'react';

import { checkoutAction } from './actions';

interface State {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface Props {
  defaultEmail?: string;
}

export function CheckoutForm({ defaultEmail }: Props) {
  const [state, formAction, pending] = useActionState(
    async (_prev: State | undefined, formData: FormData): Promise<State> => {
      return checkoutAction({
        nama: (formData.get('nama') as string) ?? '',
        email: (formData.get('email') as string) ?? '',
        wa: (formData.get('wa') as string) ?? '',
      });
    },
    {} as State,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="nama" className="block text-sm font-bold mb-1.5 text-ink uppercase tracking-wide">
          Nama Lengkap
        </label>
        <input
          id="nama"
          name="nama"
          type="text"
          required
          autoComplete="name"
          placeholder="Nama kamu"
          className="w-full bg-surface border-2 border-ink px-3 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
        />
        {state?.fieldErrors?.nama?.[0] && (
          <p className="mt-1 text-xs text-accent">{state.fieldErrors.nama[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-bold mb-1.5 text-ink uppercase tracking-wide">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder="kamu@email.com"
          className="w-full bg-surface border-2 border-ink px-3 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
        />
        <p className="mt-1 text-xs text-ink/50">
          Untuk kirim link download & license key.
        </p>
        {state?.fieldErrors?.email?.[0] && (
          <p className="mt-1 text-xs text-accent">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="wa" className="block text-sm font-bold mb-1.5 text-ink uppercase tracking-wide">
          Nomor WhatsApp
        </label>
        <input
          id="wa"
          name="wa"
          type="tel"
          required
          autoComplete="tel"
          placeholder="08123456789"
          className="w-full bg-surface border-2 border-ink px-3 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
        />
        <p className="mt-1 text-xs text-ink/50">
          Untuk notifikasi status pesanan.
        </p>
        {state?.fieldErrors?.wa?.[0] && (
          <p className="mt-1 text-xs text-accent">{state.fieldErrors.wa[0]}</p>
        )}
      </div>

      {state?.error && !state.fieldErrors && (
        <div className="bg-accent border-2 border-ink px-3 py-2 text-sm font-medium text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-surface border-2 border-ink px-5 py-4 font-bold text-base shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Membuat pesanan…' : 'Lanjut ke Pembayaran →'}
      </button>

      <p className="text-xs text-ink/50 text-center">
        Dengan klik tombol ini, kamu akan diarahkan ke halaman pembayaran QRIS Tripay.
      </p>
    </form>
  );
}