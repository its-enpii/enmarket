'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button, Card } from '@/components/ui/neobrutal';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/admin/FormField';
import { FormFooter } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/toast-store';
import { Image } from '@/components/ui/Image';
import type { Sponsor } from '@/lib/types';

import {
  createSponsor,
  updateSponsor,
  fetchMetadataAction,
  ActionResult,
} from './actions';

interface Props {
  initial?: Sponsor;
}

export function SponsorForm({ initial }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.sponsors.form');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

  const [domain, setDomain] = useState(initial?.domain ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [fetchedDescription, setFetchedDescription] = useState<string | null>(
    initial?.fetched_description ?? null,
  );

  const [isFetchingMeta, startMetaTransition] = useTransition();

  const actionFn = isEdit
    ? updateSponsor.bind(null, initial!.id)
    : createSponsor;
  const [state, formAction, pending] = useActionState(
    actionFn,
    {} as ActionResult,
  );

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message, 3000);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [state, router]);

  const handleFetchMetadata = () => {
    const targetDomain = domain.trim();
    if (!targetDomain) {
      toast.error(t('domainRequiredForFetch'));
      return;
    }

    startMetaTransition(async () => {
      const res = await fetchMetadataAction(targetDomain);
      if (res.ok && res.data) {
        if (!name || name === domain) {
          setName(res.data.name);
        }
        if (res.data.url) {
          setUrl(res.data.url);
        }
        if (res.data.logo_url) {
          setLogoUrl(res.data.logo_url);
        }
        if (res.data.fetched_description) {
          setFetchedDescription(res.data.fetched_description);
        }
        toast.success(t('fetchSuccess'));
      } else {
        toast.error(res.error || t('fetchError'));
      }
    });
  };

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      {/* Domain + Fetch button */}
      <div className="space-y-2">
        <FormField
          label={t('fieldDomain')}
          htmlFor="domain"
          required
          hint={t('fieldDomainHint')}
          error={fieldErr('domain')}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="domain"
              name="domain"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="font-mono flex-1"
            />
            <Button
              type="button"
              variant="accent"
              size="md"
              disabled={isFetchingMeta || !domain.trim()}
              onClick={handleFetchMetadata}
              className="shrink-0"
            >
              {isFetchingMeta ? t('fetchingMeta') : t('fetchMetaBtn')}
            </Button>
          </div>
        </FormField>
      </div>

      {/* Name */}
      <FormField
        label={t('fieldName')}
        htmlFor="name"
        hint={t('fieldNameHint')}
        error={fieldErr('name')}
      >
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Corporation"
        />
      </FormField>

      {/* URL & Logo URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={t('fieldUrl')}
          htmlFor="url"
          hint={t('fieldUrlHint')}
          error={fieldErr('url')}
        >
          <Input
            id="url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="font-mono"
          />
        </FormField>

        <FormField
          label={t('fieldLogoUrl')}
          htmlFor="logo_url"
          hint={t('fieldLogoUrlHint')}
          error={fieldErr('logo_url')}
        >
          <div className="flex items-center gap-3">
            <Input
              id="logo_url"
              name="logo_url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="font-mono flex-1"
            />
            {logoUrl ? (
              <div className="w-10 h-10 border-2 border-ink bg-surface flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src={logoUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
          </div>
        </FormField>
      </div>

      {/* Amount (Bid) */}
      <FormField
        label={t('fieldAmount')}
        htmlFor="amount"
        required
        hint={t('fieldAmountHint')}
        error={fieldErr('amount')}
      >
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="500000"
          className="font-mono"
        />
      </FormField>

      {/* Manual Description */}
      <FormField
        label={t('fieldDescription')}
        htmlFor="description"
        hint={t('fieldDescriptionHint')}
        error={fieldErr('description')}
      >
        <Textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('fieldDescriptionPlaceholder')}
        />
      </FormField>

      {/* Fetched Description Preview (if any) */}
      {fetchedDescription && (
        <Card variant="surface" hoverable={false} className="p-4 border-2 border-ink/40 bg-surface/60">
          <p className="font-label text-label-sm font-bold uppercase text-ink/70 mb-1">
            {t('fetchedDescriptionLabel')}
          </p>
          <p className="font-body text-sm text-ink/80 italic">
            &ldquo;{fetchedDescription}&rdquo;
          </p>
        </Card>
      )}

      {/* Active Toggle */}
      <div className="pt-2">
        <Checkbox
          id="is_active"
          name="is_active"
          label={<span className="font-bold text-sm">{t('fieldIsActive')}</span>}
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
      </div>

      {state.error && <AlertBanner variant="error">{state.error}</AlertBanner>}

      <FormFooter
        pending={pending}
        submitLabel={
          pending
            ? t('submitPending')
            : isEdit
              ? t('submitSave')
              : t('submitCreate')
        }
        cancelHref="/admin/sponsors"
        cancelLabel={tBtns('cancel')}
      />
    </form>
  );
}
