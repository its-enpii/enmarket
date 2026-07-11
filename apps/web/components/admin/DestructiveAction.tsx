'use client';

/**
 * DestructiveAction — Button wrapper yang minta konfirmasi sebelum trigger action.
 *
 * Use case: revoke license, regenerate token, hapus, atau action lain yang
 * impact-nya tidak bisa di-undo. Lebih generic dari DeleteButton (yang
 * hardcoded ke delete + id-based).
 *
 * Pattern: render `<Button variant="accent" size="sm">`, onClick → confirm
 * dialog → kalau confirmed → call `onConfirm()` (async). Toast feedback
 * di-handle oleh caller (return value dari onConfirm).
 *
 * @example
 *   <DestructiveAction
 *     label="Cabut"
 *     confirmMessage="Cabut license ini? Tidak bisa dibatalkan."
 *     onConfirm={async () => { await revokeAction(id); toast.success('Dicabut.'); }}
 *   />
 */

import { useTransition } from 'react';

import { confirmDialog } from '@/components/ui/dialog-store';
import { Button } from '@/components/ui/neobrutal';

interface Props {
  /** Label tombol (misal: "Cabut", "Regenerate"). */
  label: string;
  /** Pesan konfirmasi yang muncul di dialog. */
  confirmMessage: string;
  /** Title dialog (default: "Konfirmasi"). */
  confirmTitle?: string;
  /** Confirm button label (default: "Lanjutkan"). */
  confirmLabel?: string;
  /** Async callback yang dipanggil kalau user konfirmasi. */
  onConfirm: () => Promise<void> | void;
  /** Variant button (default: 'accent' — gold background). */
  variant?: 'accent' | 'primary';
  /** Size button (default: 'sm'). */
  size?: 'sm' | 'md';
  /** Disabled state — biasanya saat pending. */
  disabled?: boolean;
}

export function DestructiveAction({
  label,
  confirmMessage,
  confirmTitle = 'Konfirmasi',
  confirmLabel = 'Lanjutkan',
  onConfirm,
  variant = 'accent',
  size = 'sm',
  disabled,
}: Props) {
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const ok = await confirmDialog({
      title: confirmTitle,
      message: confirmMessage,
      confirmLabel,
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      await onConfirm();
    });
  }

  return (
    <Button
      variant={variant}
      size={size}
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
    >
      {pending ? '…' : label}
    </Button>
  );
}