/**
 * Backward-compat re-export.
 *
 * Historically admin page pakai `<Button>` dari `@/components/admin/Button`
 * dengan variant primary/accent/ghost. Sekarang primitives sudah dipindah
 * ke shared `@/components/ui/neobrutal`. File ini hanya re-export agar
 * existing import sites tidak perlu diubah — prefer migration ke shared
 * path untuk kode baru.
 */

export { Button } from '@/components/ui/neobrutal';
export type { ButtonProps } from '@/components/ui/neobrutal';
