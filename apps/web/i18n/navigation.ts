import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Navigation helpers yang sudah locale-aware.
 *
 * Pakai ini (bukan `next/link`, `next/navigation`) untuk:
 * - `<Link>` — auto-prefix locale
 * - `redirect()` — locale-aware redirect
 * - `usePathname()` — return path TANPA locale prefix
 * - `useRouter()` — router dengan locale switching
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);