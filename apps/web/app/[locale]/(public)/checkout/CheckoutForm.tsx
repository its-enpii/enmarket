'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

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
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common.buttons');
  const locale = useLocale();
  const isEn = locale === 'en';
  const L = (id: string, en: string) => (isEn ? en : id);

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
    <form action={formAction} className="space-y-6">
      {/* Header strip — matches theme eyebrow */}
      <div className="border-b-2 border-ink/20 pb-3 flex items-baseline justify-between">
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/70">
          ✎ {t('buyerInfo', { defaultValue: 'Data Pembeli' })}
        </p>
        <span className="font-label text-[10px] uppercase tracking-wider text-ink/50">
          {L('Wajib diisi', 'Required')}
        </span>
      </div>

      <div>
        <label htmlFor="nama" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('name')}
        </label>
        <Input
          id="nama"
          name="nama"
          type="text"
          required
          autoComplete="name"
          placeholder={L('Nama kamu', 'Your name')}
        />
        <FormError>{state?.fieldErrors?.nama?.[0]}</FormError>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('email')}
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
        <FormHint>{L('Untuk kirim link download & license key.', 'Used to send download link & license key.')}</FormHint>
        <FormError>{state?.fieldErrors?.email?.[0]}</FormError>
      </div>

      <div>
        <label htmlFor="wa" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('phone')}
        </label>
        <Input
          id="wa"
          name="wa"
          type="tel"
          required
          autoComplete="tel"
          placeholder="08123456789"
        />
        <FormHint>{L('Untuk notifikasi status pesanan.', 'For order status notifications.')}</FormHint>
        <FormError>{state?.fieldErrors?.wa?.[0]}</FormError>
      </div>

      {state?.error && !state.fieldErrors && (
        <FormError variant="box">{state.error}</FormError>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-surface border-4 border-ink px-6 py-5 font-label text-base uppercase font-black tracking-wider shadow-[6px_6px_0_0_var(--color-accent)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-accent)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--color-accent)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? `${t('placeOrder')}…` : `${t('placeOrder')} →`}
      </button>

      <p className="text-xs text-ink/50 text-center border-t-2 border-ink/10 pt-3">
        {L(
          'Dengan klik tombol ini, kamu akan diarahkan ke halaman pembayaran QRIS Tripay.',
          'By clicking this button, you will be redirected to the QRIS Tripay payment page.'
        )}
      </p>
    </form>
  );
}