'use client';

import { useActionState } from 'react';

import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';

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
        <label htmlFor="nama" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          Nama Lengkap
        </label>
        <Input
          id="nama"
          name="nama"
          type="text"
          required
          autoComplete="name"
          placeholder="Nama kamu"
        />
        <FormError>{state?.fieldErrors?.nama?.[0]}</FormError>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder="kamu@email.com"
        />
        <FormHint>Untuk kirim link download & license key.</FormHint>
        <FormError>{state?.fieldErrors?.email?.[0]}</FormError>
      </div>

      <div>
        <label htmlFor="wa" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          Nomor WhatsApp
        </label>
        <Input
          id="wa"
          name="wa"
          type="tel"
          required
          autoComplete="tel"
          placeholder="08123456789"
        />
        <FormHint>Untuk notifikasi status pesanan.</FormHint>
        <FormError>{state?.fieldErrors?.wa?.[0]}</FormError>
      </div>

      {state?.error && !state.fieldErrors && (
        <FormError variant="box">{state.error}</FormError>
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