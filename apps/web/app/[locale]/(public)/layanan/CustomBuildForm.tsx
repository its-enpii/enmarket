'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

import { CustomBuildFormState, submitCustomRequestAction } from './actions';

export function CustomBuildForm() {
  const t = useTranslations('customBuild');

  const [state, formAction, pending] = useActionState<CustomBuildFormState, FormData>(
    submitCustomRequestAction,
    {} as CustomBuildFormState,
  );

  if (state.success) {
    return (
      <Card variant="filled-primary" hoverable={false} className="p-8 text-center space-y-4">
        <span className="text-5xl select-none" role="img" aria-label="success">🚀</span>
        <h3 className="font-display text-3xl font-black uppercase text-surface">
          {t('successTitle')}
        </h3>
        <p className="text-sm text-surface/90 max-w-md mx-auto leading-relaxed">
          {t('successBody')}
        </p>
        <Button variant="surface" size="md" href="/katalog" className="mt-4">
          {t('viewCatalog')}
        </Button>
      </Card>
    );
  }

  const fieldErr = (key: string) => state.fieldErrors?.[key]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      <div className="border-b-2 border-ink/20 pb-3 flex items-baseline justify-between">
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/70">
          ✎ {t('formTitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nama" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
            {t('fields.nama')} *
          </label>
          <Input id="nama" name="nama" type="text" required placeholder={t('fields.namaPlaceholder')} />
          <FormError>{fieldErr('nama')}</FormError>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
            {t('fields.email')} *
          </label>
          <Input id="email" name="email" type="email" required placeholder={t('fields.emailPlaceholder')} />
          <FormError>{fieldErr('email')}</FormError>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label htmlFor="wa" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
            {t('fields.wa')} *
          </label>
          <Input id="wa" name="wa" type="tel" required placeholder="08123456789" />
          <FormHint>{t('fields.waHint')}</FormHint>
          <FormError>{fieldErr('wa')}</FormError>
        </div>

        <div>
          <label htmlFor="jenis_proyek" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
            {t('fields.jenisProyek.label')} *
          </label>
          <Select id="jenis_proyek" name="jenis_proyek" required defaultValue="website">
            <option value="website">{t('fields.jenisProyek.website')}</option>
            <option value="webapp">{t('fields.jenisProyek.webapp')}</option>
            <option value="mobile-app">{t('fields.jenisProyek.mobileApp')}</option>
            <option value="automation">{t('fields.jenisProyek.automation')}</option>
            <option value="other">{t('fields.jenisProyek.other')}</option>
          </Select>
          <FormError>{fieldErr('jenis_proyek')}</FormError>
        </div>

        <div>
          <label htmlFor="budget_range" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
            {t('fields.budgetRange.label')} *
          </label>
          <Select id="budget_range" name="budget_range" required defaultValue="5-15jt">
            <option value="<5jt">{t('fields.budgetRange.under5m')}</option>
            <option value="5-15jt">{t('fields.budgetRange.5to15m')}</option>
            <option value="15-50jt">{t('fields.budgetRange.15to50m')}</option>
            <option value="50jt+">{t('fields.budgetRange.above50m')}</option>
            <option value="discuss">{t('fields.budgetRange.discuss')}</option>
          </Select>
          <FormError>{fieldErr('budget_range')}</FormError>
        </div>
      </div>

      <div>
        <label htmlFor="timeline" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('fields.timeline.label')} *
        </label>
        <Select id="timeline" name="timeline" required defaultValue="1-3bulan">
          <option value="<2minggu">{t('fields.timeline.under2w')}</option>
          <option value="2-4minggu">{t('fields.timeline.2to4w')}</option>
          <option value="1-3bulan">{t('fields.timeline.1to3m')}</option>
          <option value="3-6bulan">{t('fields.timeline.3to6m')}</option>
          <option value="flexible">{t('fields.timeline.flexible')}</option>
        </Select>
        <FormError>{fieldErr('timeline')}</FormError>
      </div>

      <div>
        <label htmlFor="deskripsi" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('fields.deskripsi')} *
        </label>
        <Textarea
          id="deskripsi"
          name="deskripsi"
          rows={5}
          required
          placeholder={t('fields.deskripsiPlaceholder')}
        />
        <FormError>{fieldErr('deskripsi')}</FormError>
      </div>

      {state.error && (
        <FormError variant="box">{state.error}</FormError>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={pending}
        className="w-full"
      >
        {pending ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
