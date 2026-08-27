'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { AuthProvider } from '@/components/customer/AuthProvider';
import { OtpRequestForm } from '@/components/customer/OtpRequestForm';
import { OtpVerifyForm } from '@/components/customer/OtpVerifyForm';

interface Props {
  locale?: string;
}

export function MasukForm({ locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/akun';

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [cooldown, setCooldown] = useState(60);

  const handleRequestSuccess = (submittedPhone: string, cooldownSecs: number) => {
    setPhone(submittedPhone);
    setCooldown(cooldownSecs);
    setStep('verify');
  };

  const handleVerifySuccess = () => {
    router.push(next as any);
    router.refresh();
  };

  return (
    <AuthProvider>
      {step === 'verify' ? (
        <OtpVerifyForm
          phone={phone}
          initialCooldown={cooldown}
          onSuccess={handleVerifySuccess}
          onChangePhone={() => setStep('phone')}
          locale={locale}
        />
      ) : (
        <OtpRequestForm
          initialPhone={phone}
          onSuccess={handleRequestSuccess}
          locale={locale}
        />
      )}
    </AuthProvider>
  );
}
