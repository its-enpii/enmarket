'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/neobrutal';

export interface FormFooterProps {
  pending?: boolean;
  submitLabel: string;
  cancelHref?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
}

const noRoute = () => undefined;

export function FormFooter({
  pending = false,
  submitLabel,
  cancelHref,
  cancelLabel,
  onCancel,
  className = '',
}: FormFooterProps) {
  const router = useRouter();
  const showCancel = !!cancelLabel && (!!cancelHref || !!onCancel);
  const cancelRoute = onCancel ?? (cancelHref ? () => router.push(cancelHref) : noRoute);

  return (
    <div className={`flex gap-3 pt-2 ${className}`}>
      <Button type="submit" variant="primary" size="md" disabled={pending}>
        {submitLabel}
      </Button>
      {showCancel && (
        <Button
          type="button"
          variant="ghost"
          size="md"
          flat
          onClick={cancelRoute}
        >
          {cancelLabel}
        </Button>
      )}
    </div>
  );
}
