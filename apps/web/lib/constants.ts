export const ADMIN_TOKEN_COOKIE = 'admin_token';
export const CUSTOMER_TOKEN_COOKIE = 'customer_token';
export const CART_SESSION_COOKIE = 'cart_session';
export const WISHLIST_SESSION_COOKIE = 'wishlist_session';

/** z-index layers terpusat — modal dialog harus di atas TopNav/Sidebar (z-50). */
export const Z_INDEX = {
  nav: 50,
  lightbox: 60,
  modal: 120,
} as const;

/** localStorage key prefix reaksi display (dipakai ReactionStrip). */
export const REACTION_STORAGE_PREFIX = 'enpii-display-reaction:';
