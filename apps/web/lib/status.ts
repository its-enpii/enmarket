import type { OrderStatus } from './types';

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 border-yellow-600 text-yellow-900',
  paid: 'bg-green-100 border-green-600 text-green-900',
  failed: 'bg-red-100 border-red-600 text-red-900',
  expired: 'bg-gray-100 border-gray-600 text-gray-800',
  refunded: 'bg-purple-100 border-purple-600 text-purple-900',
  preorder_deposit_paid: 'bg-blue-100 border-blue-600 text-blue-900',
  free: 'bg-green-100 border-green-600 text-green-900',
};

export const POST_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-surface text-ink',
  published: 'bg-accent text-ink',
  archived: 'bg-ink text-surface',
};
