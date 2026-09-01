import type { OrderStatus } from './types';

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-accent border-warning text-warning',
  paid: 'bg-accent border-success text-success',
  failed: 'bg-accent border-danger text-danger',
  expired: 'bg-surface border-ink text-ink/70',
  refunded: 'bg-purple-100 border-purple-600 text-purple-900',
  preorder_deposit_paid: 'bg-blue-100 border-blue-600 text-blue-900',
  free: 'bg-accent border-success text-success',
};

export const POST_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-surface text-ink',
  published: 'bg-accent text-ink',
  archived: 'bg-ink text-surface',
};
