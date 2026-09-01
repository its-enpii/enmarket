'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/neobrutal';

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  layer?: 'modal' | 'lightbox';
  labelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
};

export function ModalShell({
  open,
  onClose,
  layer = 'modal',
  labelledBy,
  ariaLabel,
  children,
  className,
}: ModalShellProps) {
  if (!open) return null;

  if (layer === 'lightbox') {
    return (
      <div
        className="fixed inset-0 z-lightbox bg-ink/95 flex items-center justify-center p-4 md:p-12 cursor-pointer"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
    >
      <Button
        type="button"
        variant="surface"
        size="sm"
        tabIndex={-1}
        aria-label={ariaLabel}
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 cursor-default animate-fade-in"
      />
      {children}
    </div>
  );
}
