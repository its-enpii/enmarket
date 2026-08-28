import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';
import { Input } from '@/components/ui/Input';
import type { PaymentGateway } from '@/lib/types';

interface Props {
  enabledGateways: Array<{ key: PaymentGateway }>;
  selectedGateway: PaymentGateway;
  onSelectGateway: (gateway: PaymentGateway) => void;
  paymentMethod: string;
  onChangePaymentMethod: (method: string) => void;
}

export function PaymentMethodSelector({
  enabledGateways,
  selectedGateway,
  onSelectGateway,
  paymentMethod,
  onChangePaymentMethod,
}: Props) {
  const t = useTranslations('payment');
  const tCheckout = useTranslations('checkout');

  if (enabledGateways.length <= 1 && enabledGateways[0]?.key === 'tripay') {
    return (
      <input type="hidden" name="payment_gateway" value={selectedGateway} />
    );
  }

  return (
    <div className="space-y-4 border-t-2 border-ink/10 pt-4">
      <div>
        <p className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
          {t('gateway')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {enabledGateways.map(({ key }) => {
            const isSelected = selectedGateway === key;
            return (
              <Card
                key={key}
                as="label"
                variant={isSelected ? 'filled-accent' : 'surface'}
                hoverable={false}
                className={`flex items-center gap-3 p-3 cursor-pointer border-2 border-ink transition-colors ${
                  isSelected ? 'shadow-[2px_2px_0px_#000]' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment_gateway"
                  value={key}
                  checked={isSelected}
                  onChange={() => onSelectGateway(key)}
                  className="accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black uppercase text-sm text-ink">
                    {t(`gateways.${key}` as any)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedGateway === 'duitku' && (
        <div>
          <label htmlFor="payment_method" className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5">
            {tCheckout('paymentMethod')}
          </label>
          <Input
            id="payment_method"
            name="payment_method"
            type="text"
            value={paymentMethod}
            onChange={(e) => onChangePaymentMethod(e.target.value)}
            placeholder="VC, QR, OVO, etc."
            className="font-bold uppercase tracking-wide"
          />
        </div>
      )}
    </div>
  );
}
