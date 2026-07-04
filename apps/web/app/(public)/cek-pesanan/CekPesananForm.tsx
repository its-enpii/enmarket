'use client';

import { useActionState } from 'react';

import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';

import { checkOrderAction } from './actions';

interface State {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface Props {
  defaultKode?: string;
}

export function CekPesananForm({ defaultKode = '' }: Props) {
  const [state, formAction, pending] = useActionState(
    async (_prev: State | undefined, formData: FormData): Promise<State> => {
      return checkOrderAction({
        kode_order: ((formData.get('kode_order') as string) ?? '').trim().toUpperCase(),
        email: ((formData.get('email') as string) ?? '').trim(),
      });
    },
    {} as State,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="kode_order" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          Kode Order
        </label>
        <Input
          id="kode_order"
          name="kode_order"
          type="text"
          required
          defaultValue={defaultKode}
          placeholder="EPS-20240701-A3KX"
          autoComplete="off"
          className="font-mono"
        />
        <FormError>{state?.fieldErrors?.kode_order?.[0]}</FormError>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          Email Pembeli
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="email@yang-digunakan-saat-checkout.com"
          autoComplete="email"
        />
        <FormHint>Email yang kamu pakai saat checkout.</FormHint>
        <FormError>{state?.fieldErrors?.email?.[0]}</FormError>
      </div>

      {state?.error && !state.fieldErrors && (
        <FormError variant="box">{state.error}</FormError>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Mengecek…' : 'Cek Pesanan →'}
      </button>
    </form>
  );
}