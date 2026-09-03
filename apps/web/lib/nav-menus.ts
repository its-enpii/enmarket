export const DEFAULT_NAV_ITEMS = [
  { key: 'discover', href: '/discover' },
  { key: 'develop', href: '/develop' },
  { key: 'display', href: '/display' },
  { key: 'layanan', href: '/layanan' },
  { key: 'topup', href: '/topup' },
] as const;

export type DefaultNavKey = 'discover' | 'develop' | 'display' | 'layanan' | 'topup';

const NAV_HREFS: Record<DefaultNavKey, string> = {
  discover: '/discover',
  develop: '/develop',
  display: '/display',
  layanan: '/layanan',
  topup: '/topup',
};

export interface NavMenuItem {
  key: DefaultNavKey;
  label: string | null;
  href: string;
}

export function normalizeNavMenus(menus: unknown): NavMenuItem[] {
  if (!Array.isArray(menus)) return [];

  return menus.flatMap((menu) => {
    if (typeof menu !== 'object' || menu === null) return [];
    const { key, label } = menu as { key?: unknown; label?: unknown };
    if (typeof key !== 'string' || !Object.hasOwn(NAV_HREFS, key)) return [];
    if (label !== null && typeof label !== 'string') return [];

    const navKey = key as DefaultNavKey;
    return [{ key: navKey, label: label ?? null, href: NAV_HREFS[navKey] }];
  });
}
