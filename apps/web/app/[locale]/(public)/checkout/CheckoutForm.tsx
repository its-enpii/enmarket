'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
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

  // FormData → CheckoutInput: server action expect object {nama,email,wa},
  // bukan FormData. Wrapper ini tetap di-handle client-side biar input object
  // sampai utuh. NEXT_REDIRECT di-rethrow biar Next.js follow redirect().
  const [state, formAction, pending] = useActionState<State | undefined, FormData>(
    async (_prev, formData) =>
      checkoutAction({
        nama: (formData.get('nama') as string) ?? '',
        email: (formData.get('email') as string) ?? '',
        wa: (formData.get('wa') as string) ?? '',
      }).catch((err) => {
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
        return { error: t('errorGeneric') };
      }),
    {} as State,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Header strip — matches theme eyebrow */}
      <div className="border-b-2 border-ink/20 pb-3 flex items-baseline justify-between">
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/70">
          ✎ {t('buyerInfo')}
        </p>
        <span className="font-label text-[10px] uppercase tracking-wider text-ink/50">
          {t('required')}
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
          placeholder={t('namePlaceholder')}
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
          placeholder={t('emailPlaceholder')}
        />
        <FormHint>{t('emailHint')}</FormHint>
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
        <FormHint>{t('phoneHint')}</FormHint>
        <FormError>{state?.fieldErrors?.wa?.[0]}</FormError>
      </div>

      {state?.error && !state.fieldErrors && (
        <FormError variant="box">{state.error}</FormError>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        shadowColor="accent"
        disabled={pending}
        className="w-full"
      >
        {pending ? `${t('placeOrder')}…` : `${t('placeOrder')} →`}
      </Button>

      <p className="text-xs text-ink/50 text-center border-t-2 border-ink/10 pt-3">
        {t('submitHint')}
      </p>
    </form>
  );
}