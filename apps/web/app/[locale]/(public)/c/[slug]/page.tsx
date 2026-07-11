import { redirect } from 'next/navigation';

/**
 * Alias /c/[slug] → /katalog?category=[slug].
 * Single source of truth: katalog page handle filter.
 */
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryAliasPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/katalog?category=${encodeURIComponent(slug)}`);
}