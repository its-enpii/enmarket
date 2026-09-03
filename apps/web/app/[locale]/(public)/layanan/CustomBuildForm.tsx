'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card, Eyebrow } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
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
        <Eyebrow size="label-sm" color="ink-soft">
          ✎ {t('formTitle')}
        </Eyebrow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label={t('fields.nama')} htmlFor="nama" required error={fieldErr('nama')}>
          <Input id="nama" name="nama" type="text" required placeholder={t('fields.namaPlaceholder')} />
        </FormField>

        <FormField label={t('fields.email')} htmlFor="email" required error={fieldErr('email')}>
          <Input id="email" name="email" type="email" required placeholder={t('fields.emailPlaceholder')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FormField label={t('fields.wa')} htmlFor="wa" required hint={t('fields.waHint')} error={fieldErr('wa')}>
          <Input id="wa" name="wa" type="tel" required placeholder="08123456789" />
        </FormField>

        <FormField label={t('fields.jenisProyek.label')} required error={fieldErr('jenis_proyek')}>
          <SelectSearch
            name="jenis_proyek"
            required
            defaultValue="website"
            options={[
              { value: 'website', label: t('fields.jenisProyek.website') },
              { value: 'webapp', label: t('fields.jenisProyek.webapp') },
              { value: 'mobile-app', label: t('fields.jenisProyek.mobileApp') },
              { value: 'automation', label: t('fields.jenisProyek.automation') },
              { value: 'other', label: t('fields.jenisProyek.other') },
            ]}
          />
        </FormField>

        <FormField label={t('fields.budgetRange.label')} required error={fieldErr('budget_range')}>
          <SelectSearch
            name="budget_range"
            required
            defaultValue="5-15jt"
            options={[
              { value: '<5jt', label: t('fields.budgetRange.under5m') },
              { value: '5-15jt', label: t('fields.budgetRange.5to15m') },
              { value: '15-50jt', label: t('fields.budgetRange.15to50m') },
              { value: '50jt+', label: t('fields.budgetRange.above50m') },
              { value: 'discuss', label: t('fields.budgetRange.discuss') },
            ]}
          />
        </FormField>
      </div>

      <FormField label={t('fields.timeline.label')} required error={fieldErr('timeline')}>
        <SelectSearch
          name="timeline"
          required
          defaultValue="1-3bulan"
          options={[
            { value: '<2minggu', label: t('fields.timeline.under2w') },
            { value: '2-4minggu', label: t('fields.timeline.2to4w') },
            { value: '1-3bulan', label: t('fields.timeline.1to3m') },
            { value: '3-6bulan', label: t('fields.timeline.3to6m') },
            { value: 'flexible', label: t('fields.timeline.flexible') },
          ]}
        />
      </FormField>

      <FormField label={t('fields.deskripsi')} htmlFor="deskripsi" required error={fieldErr('deskripsi')}>
        <Textarea
          id="deskripsi"
          name="deskripsi"
          rows={5}
          required
          placeholder={t('fields.deskripsiPlaceholder')}
        />
      </FormField>

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
