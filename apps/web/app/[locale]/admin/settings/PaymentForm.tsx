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

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { toast } from '@/components/ui/toast-store';
import { EMPTY_ACTION_RESULT } from '@/lib/action-result';
import type { PaymentGatewaysMap, SiteChannels, SitePayment } from '@/lib/types';

import {
  updateChannels,
  updatePayment,
  updatePaymentGateways,
  type SettingsActionResult,
} from './actions';
import { FormActions, FormSection } from '@/components/ui';
import { Eyebrow } from '@/components/ui/neobrutal';

interface Props {
  payment: SitePayment;
  channels: SiteChannels;
  paymentGateways?: PaymentGatewaysMap;
}

// ───── Payment credentials section ─────

function PaymentSection({ initial }: { initial: SitePayment }) {
  const t = useTranslations('admin.settings.payment');
  const [state, action, pending] = useActionState<SettingsActionResult, FormData>(
    async (prev, fd) => {
      const res = await updatePayment(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    EMPTY_ACTION_RESULT,
  );

  // Controlled state — React 19 + Next 15 me-reset uncontrolled <input>
  // setelah form action selesai. Pakai useState supaya isian tidak hilang
  // saat validasi gagal.
  const [merchant, setMerchant] = useState(initial.tripay_merchant ?? '');
  const [apiKey, setApiKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

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
            <Eyebrow size="sm" color="accent">
              ✎ {t('modeEyebrow').replace('✎ ', '')}
            </Eyebrow>
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
            <Badge
              tone={initial.tripay_mode === 'production' ? 'primary' : 'accent'}
              size="sm"
            >
              {initial.tripay_mode === 'production' ? t('modeBadgeLive') : t('modeBadgeTest')}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Tripay credentials */}
      <Card variant="surface" className="p-6 space-y-5">
        <FormSection eyebrow={t('sectionTripay')} title={t('sectionTripayTitle')} />

        <form action={action} className="space-y-4">
          <FormError variant="box">{state.error}</FormError>

          <FormField
            label={t('fieldMerchant')}
            htmlFor="tripay-merchant"
            hint={t('fieldMerchantHint')}
            error={state.fieldErrors?.tripay_merchant?.[0]}
          >
            <Input
              id="tripay-merchant"
              name="tripay_merchant"
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
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
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
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
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
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

          <FormActions>
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              {pending ? t('submitPending') : t('submit')}
            </Button>
          </FormActions>
        </form>
      </Card>
    </>
  );
}

// ───── Channels section ─────

function ChannelsSection({ initial }: { initial: SiteChannels }) {
  const t = useTranslations('admin.settings.payment');
  const [state, action, pending] = useActionState<SettingsActionResult, FormData>(
    async (prev, fd) => {
      const res = await updateChannels(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    EMPTY_ACTION_RESULT,
  );

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <FormSection eyebrow={t('sectionChannels')} title={t('sectionChannelsTitle')} />

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

        <FormActions>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t('submitPending') : t('submitChannels')}
          </Button>
        </FormActions>
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

export function PaymentForm({ payment, channels, paymentGateways }: Props) {
  return (
    <div className="space-y-6">
      <GatewaysSection initial={paymentGateways} />
      <PaymentSection initial={payment} />
      <DuitkuSection initial={payment} />
      <ChannelsSection initial={channels} />
    </div>
  );
}

function GatewaysSection({ initial }: { initial?: PaymentGatewaysMap }) {
  const t = useTranslations('admin.settings.payment');
  const [state, action, pending] = useActionState<SettingsActionResult, FormData>(
    async (prev, fd) => {
      const res = await updatePaymentGateways(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    EMPTY_ACTION_RESULT,
  );

  const tripayEnabled = initial?.tripay?.enabled ?? true;
  const duitkuEnabled = initial?.duitku?.enabled ?? false;

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <FormSection eyebrow={t('sectionGateways')} title={t('sectionGatewaysTitle')} />

      <form action={action} className="space-y-3">
        <FormError variant="box">{state.error}</FormError>

        <ToggleRow
          name="gateway_tripay"
          label={t('gatewayTripay')}
          description={t('gatewayTripayDesc')}
          defaultEnabled={tripayEnabled}
        />
        <ToggleRow
          name="gateway_duitku"
          label={t('gatewayDuitku')}
          description={t('gatewayDuitkuDesc')}
          defaultEnabled={duitkuEnabled}
        />

        <FormActions>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t('submitPending') : t('submitGateways')}
          </Button>
        </FormActions>
      </form>
    </Card>
  );
}

function DuitkuSection({ initial }: { initial: SitePayment }) {
  const t = useTranslations('admin.settings.payment');
  const [state, action, pending] = useActionState<SettingsActionResult, FormData>(
    async (prev, fd) => {
      const res = await updatePayment(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    EMPTY_ACTION_RESULT,
  );

  const modeOptions = [
    { value: 'sandbox', label: t('modeSandbox') },
    { value: 'production', label: t('modeProduction') },
  ];

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <FormSection eyebrow={t('sectionDuitku')} title={t('sectionDuitkuTitle')} />

      <form action={action} className="space-y-4">
        <FormError variant="box">{state.error}</FormError>

        <FormField
          label={t('fieldDuitkuMerchant')}
          htmlFor="duitku-merchant"
          hint={t('fieldDuitkuMerchantHint')}
          error={state.fieldErrors?.duitku_merchant_code?.[0]}
        >
          <Input
            id="duitku-merchant"
            name="duitku_merchant_code"
            type="text"
            defaultValue={initial.duitku_merchant_code ?? ''}
            placeholder="D12345"
          />
        </FormField>

        <FormField
          label={t('fieldDuitkuApiKey')}
          htmlFor="duitku-api-key"
          hint={
            initial.duitku_api_key_masked
              ? t('fieldDuitkuApiKeyHintCurrent', { masked: initial.duitku_api_key_masked })
              : t('fieldDuitkuApiKeyHintNew')
          }
          error={state.fieldErrors?.duitku_api_key?.[0]}
        >
          <Input
            id="duitku-api-key"
            name="duitku_api_key"
            type="password"
            defaultValue=""
            placeholder={initial.duitku_api_key_masked ?? '••••••••'}
            autoComplete="off"
          />
        </FormField>

        <FormField
          label={t('fieldDuitkuMode')}
          htmlFor="duitku-mode"
          hint={t('fieldDuitkuModeHint')}
        >
          <SelectSearch
            name="duitku_mode"
            defaultValue={initial.duitku_mode ?? 'sandbox'}
            options={modeOptions}
            placeholder={t('modePlaceholder')}
            clearable={false}
          />
        </FormField>

        <FormActions>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t('submitPending') : t('submitDuitku')}
          </Button>
        </FormActions>
      </form>
    </Card>
  );
}
