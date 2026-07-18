'use client';

/**
 * PaymentForm — admin form untuk Tripay config + channel toggles.
 *
 * Backend (apps/api): SettingsController::update(PATCH /api/admin/settings)
 *   group: 'payment' | 'channels'
 *
 * Credentials (api_key, private_key) ditampilkan MASKED kalau sudah ada;
 * field dikosongkan saat edit = keep existing. Submit dengan value baru =
 * replace. Tidak ada "show/hide" toggle (security concern).
 */

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { toast } from '@/components/ui/toast-store';
import type { SiteChannels, SitePayment } from '@/lib/types';

import { updateChannels, updatePayment, type ActionResult } from './actions';

const INITIAL: ActionResult = {};

interface Props {
  payment: SitePayment;
  channels: SiteChannels;
}

// ───── Payment credentials section ─────

function PaymentSection({ initial }: { initial: SitePayment }) {
  const t = useTranslations('admin.settings.payment');
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await updatePayment(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    INITIAL,
  );

  const modeOptions = [
    { value: 'sandbox', label: t('modeSandbox') },
    { value: 'production', label: t('modeProduction') },
  ];

  return (
    <>
      {/* Mode indicator */}
      <Card variant="surface" className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
              ✎ {t('modeEyebrow').replace('✎ ', '')}
            </p>
            <p className="mt-1 font-display text-2xl font-black uppercase text-ink leading-tight">
              {initial.tripay_mode === 'production' ? t('modeProductionTitle') : t('modeSandboxTitle')}
            </p>
            <p className="mt-1 font-body text-body-sm text-ink/60">
              {initial.tripay_mode === 'production'
                ? t('modeProductionDesc')
                : t('modeSandboxDesc')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span
              className={
                'inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 border-ink ' +
                (initial.tripay_mode === 'production'
                  ? 'bg-primary text-surface'
                  : 'bg-accent text-ink')
              }
            >
              {initial.tripay_mode === 'production' ? t('modeBadgeLive') : t('modeBadgeTest')}
            </span>
          </div>
        </div>
      </Card>

      {/* Tripay credentials */}
      <Card variant="surface" className="p-6 space-y-5">
        <div className="border-b-2 border-ink pb-3">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
            ✎ {t('sectionTripay')}
          </p>
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
            {t('sectionTripayTitle')}
          </h2>
        </div>

        <form action={action} className="space-y-4">
          <FormError variant="box">{state.error}</FormError>

          <FormField
            label={t('fieldMerchant')}
            htmlFor="tripay-merchant"
            required
            hint={t('fieldMerchantHint')}
            error={state.fieldErrors?.tripay_merchant?.[0]}
          >
            <Input
              id="tripay-merchant"
              name="tripay_merchant"
              type="text"
              defaultValue={initial.tripay_merchant ?? ''}
              placeholder="T12345"
            />
          </FormField>

          <FormField
            label={t('fieldApiKey')}
            htmlFor="tripay-api-key"
            hint={
              initial.tripay_api_key_masked
                ? t('fieldApiKeyHintCurrent', { masked: initial.tripay_api_key_masked })
                : t('fieldApiKeyHintNew')
            }
            error={state.fieldErrors?.tripay_api_key?.[0]}
          >
            <Input
              id="tripay-api-key"
              name="tripay_api_key"
              type="password"
              defaultValue=""
              placeholder={initial.tripay_api_key_masked ?? '••••••••'}
              autoComplete="off"
            />
          </FormField>

          <FormField
            label={t('fieldPrivateKey')}
            htmlFor="tripay-private-key"
            hint={
              initial.tripay_private_key_masked
                ? t('fieldPrivateKeyHintCurrent', { masked: initial.tripay_private_key_masked })
                : t('fieldPrivateKeyHintNew')
            }
            error={state.fieldErrors?.tripay_private_key?.[0]}
          >
            <Input
              id="tripay-private-key"
              name="tripay_private_key"
              type="password"
              defaultValue=""
              placeholder={initial.tripay_private_key_masked ?? '••••••••'}
              autoComplete="off"
            />
          </FormField>

          <FormField
            label={t('fieldMode')}
            htmlFor="tripay-mode"
            hint={t('fieldModeHint')}
          >
            <SelectSearch
              name="tripay_mode"
              defaultValue={initial.tripay_mode}
              options={modeOptions}
              placeholder={t('modePlaceholder')}
              clearable={false}
            />
          </FormField>

          <div className="flex gap-2 pt-2 border-t-2 border-ink">
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              {pending ? t('submitPending') : t('submit')}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

// ───── Channels section ─────

function ChannelsSection({ initial }: { initial: SiteChannels }) {
  const t = useTranslations('admin.settings.payment');
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await updateChannels(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    INITIAL,
  );

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <div className="border-b-2 border-ink pb-3">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
          ✎ {t('sectionChannels')}
        </p>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
          {t('sectionChannelsTitle')}
        </h2>
      </div>

      <form action={action} className="space-y-3">
        <FormError variant="box">{state.error}</FormError>

        <ToggleRow
          name="channel_qris"
          label={t('channelQris')}
          description={t('channelQrisDesc')}
          defaultEnabled={initial.qris}
        />
        <ToggleRow
          name="channel_va"
          label={t('channelVa')}
          description={t('channelVaDesc')}
          defaultEnabled={initial.va}
        />
        <ToggleRow
          name="channel_ewallet"
          label={t('channelEwallet')}
          description={t('channelEwalletDesc')}
          defaultEnabled={initial.ewallet}
        />
        <ToggleRow
          name="channel_convenience_store"
          label={t('channelConvenienceStore')}
          description={t('channelConvenienceStoreDesc')}
          defaultEnabled={initial.convenience_store}
        />

        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t('submitPending') : t('submitChannels')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ToggleRow({
  name,
  label,
  description,
  defaultEnabled,
}: {
  name: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
}) {
  return (
    <Card
      as="label"
      variant="surface"
      hoverable={false}
      className="flex items-center gap-4 p-3 cursor-pointer hover:bg-accent transition-colors"
    >
      <Checkbox name={name} defaultChecked={defaultEnabled} />
      <div className="flex-1 min-w-0">
        <p className="font-display font-black uppercase text-sm text-ink">
          {label}
        </p>
        <p className="font-body text-xs text-ink/60 mt-0.5">{description}</p>
      </div>
    </Card>
  );
}

// ───── Composite ─────

export function PaymentForm({ payment, channels }: Props) {
  return (
    <div className="space-y-6">
      <PaymentSection initial={payment} />
      <ChannelsSection initial={channels} />
    </div>
  );
}