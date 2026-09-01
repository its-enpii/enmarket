export const ADMIN_TOKEN_COOKIE = 'admin_token';
export const CUSTOMER_TOKEN_COOKIE = 'customer_token';
export const CART_SESSION_COOKIE = 'cart_session';
export const WISHLIST_SESSION_COOKIE = 'wishlist_session';
export const LAST_ORDER_CODE_COOKIE = 'last_order_code';

export const COOKIE_MAX_AGE = {
  day: 86_400,
  week: 604_800,
  month30: 2_592_000,
  year: 31_536_000,
} as const;

export const ADMIN_LIST_PER_PAGE = 100;
export const OTP_LENGTH = 6;

export const DEFAULT_GATEWAY = 'tripay' as const;

/** z-index layers terpusat — modal dialog harus di atas TopNav/Sidebar (z-50). */
export const Z_INDEX = {
  nav: 50,
  lightbox: 60,
  modal: 120,
} as const;

/** localStorage key prefix reaksi display (dipakai ReactionStrip). */
export const REACTION_STORAGE_PREFIX = 'enpii-display-reaction:';
