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

import { Button } from '@/components/admin/Button';
import { Card } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
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
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await updatePayment(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    INITIAL,
  );

  const modeOptions = [
    { value: 'sandbox', label: 'Sandbox — testing, transaksi tidak nyata' },
    { value: 'production', label: 'Production — live, transaksi nyata' },
  ];

  return (
    <>
      {/* Mode indicator */}
      <Card variant="surface" className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
              ✎ Mode
            </p>
            <p className="mt-1 font-display text-2xl font-black uppercase text-ink leading-tight">
              {initial.tripay_mode === 'production' ? 'Production' : 'Sandbox'}
            </p>
            <p className="mt-1 font-body text-body-sm text-ink/60">
              {initial.tripay_mode === 'production'
                ? 'Transaksi nyata. Pastikan credentials valid.'
                : 'Transaksi tidak nyata. Untuk testing flow.'}
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
              ● {initial.tripay_mode === 'production' ? 'LIVE' : 'TEST'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tripay credentials */}
      <Card variant="surface" className="p-6 space-y-5">
        <div className="border-b-2 border-ink pb-3">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
            ✎ Tripay
          </p>
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
            Credentials
          </h2>
        </div>

        <form action={action} className="space-y-4">
          <FormError variant="box">{state.error}</FormError>

          <FormField
            label="Merchant Code"
            htmlFor="tripay-merchant"
            required
            hint="Kode merchant dari dashboard Tripay."
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
            label="API Key"
            htmlFor="tripay-api-key"
            hint={
              initial.tripay_api_key_masked
                ? `Saat ini: ${initial.tripay_api_key_masked}. Kosongkan untuk keep, atau ketik nilai baru untuk replace.`
                : 'Disimpan terenkripsi. Tidak akan ditampilkan setelah disimpan.'
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
            label="Private Key"
            htmlFor="tripay-private-key"
            hint={
              initial.tripay_private_key_masked
                ? `Saat ini: ${initial.tripay_private_key_masked}. Kosongkan untuk keep.`
                : 'Untuk signature generation. JANGAN share ke siapapun.'
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
            label="Mode"
            htmlFor="tripay-mode"
            hint="Pilih sandbox untuk testing, production untuk live."
          >
            <select
              id="tripay-mode"
              name="tripay_mode"
              defaultValue={initial.tripay_mode}
              className="block w-full border-2 border-ink bg-surface px-3 py-2 text-base font-body text-ink focus:outline-none focus:ring-0 focus:border-primary"
            >
              {modeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex gap-2 pt-2 border-t-2 border-ink">
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              {pending ? 'Menyimpan…' : 'Simpan Tripay Config'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

// ───── Channels section ─────

function ChannelsSection({ initial }: { initial: SiteChannels }) {
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
          ✎ Channels
        </p>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
          Payment Channels
        </h2>
      </div>

      <form action={action} className="space-y-3">
        <FormError variant="box">{state.error}</FormError>

        <ToggleRow
          name="channel_qris"
          label="QRIS"
          description="Quick Response Code Indonesian Standard."
          defaultEnabled={initial.qris}
        />
        <ToggleRow
          name="channel_va"
          label="Virtual Account"
          description="BCA, BNI, BRI, Mandiri, dll."
          defaultEnabled={initial.va}
        />
        <ToggleRow
          name="channel_ewallet"
          label="E-Wallet"
          description="OVO, DANA, GoPay, ShopeePay."
          defaultEnabled={initial.ewallet}
        />
        <ToggleRow
          name="channel_convenience_store"
          label="Convenience Store"
          description="Indomaret, Alfamart."
          defaultEnabled={initial.convenience_store}
        />

        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? 'Menyimpan…' : 'Simpan Channels'}
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
    <label className="flex items-center gap-4 p-3 border-2 border-ink bg-surface cursor-pointer hover:bg-accent transition-colors">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultEnabled}
        className="w-5 h-5 accent-primary"
      />
      <div className="flex-1 min-w-0">
        <p className="font-display font-black uppercase text-sm text-ink">
          {label}
        </p>
        <p className="font-body text-xs text-ink/60 mt-0.5">{description}</p>
      </div>
    </label>
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
