import { permanentRedirect } from 'next/navigation';

/**
 * Alias /c/[slug] → /develop.
 */
export default function CategoryAliasPage() {
  permanentRedirect('/develop');
}
