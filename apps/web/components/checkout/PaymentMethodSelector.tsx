import { useTranslations } from 'next-intl';

import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { DUITKU_CHANNELS } from '@/lib/constants';
import type { DuitkuChannelCode, PaymentGateway } from '@/lib/types';

interface Props {
  enabledGateways: Array<{ key: PaymentGateway }>;
  selectedGateway: PaymentGateway;
  onSelectGateway: (gateway: PaymentGateway) => void;
  paymentMethod: DuitkuChannelCode;
  onChangePaymentMethod: (method: DuitkuChannelCode) => void;
}

export function PaymentMethodSelector({
  enabledGateways,
  selectedGateway,
  onSelectGateway,
  paymentMethod,
  onChangePaymentMethod,
}: Props) {
  const t = useTranslations('checkout');

const firstEnabledGateway = enabledGateways[0]?.key ?? 'tripay';

if (firstEnabledGateway !== 'duitku') {
    return <input type="hidden" name="payment_gateway" value={firstEnabledGateway} />;
  }

  return (
    <div className="space-y-4 border-t-2 border-ink/10 pt-4">
      <input type="hidden" name="payment_gateway" value={firstEnabledGateway} />
      <FormField label={t('paymentChannel')} htmlFor="payment_method">
        <Select
          id="payment_method"
          name="payment_method"
          value={paymentMethod}
          onChange={(event) => onChangePaymentMethod(event.target.value as DuitkuChannelCode)}
        >
          {DUITKU_CHANNELS.map((channel) => (
            <option key={channel.code} value={channel.code}>
              {channel.label}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
