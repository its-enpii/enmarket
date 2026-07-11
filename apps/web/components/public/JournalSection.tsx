'use client';

import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';
import { NLink } from '@/components/ui/neobrutal';

import { formatDate } from '@/lib/format';
import type { Post } from '@/lib/types';

interface Props {
  posts: Post[];
}

/**
 * Latest / Display — Neobrutalism enpiistudio.
 */
export function JournalSection({ posts }: Props) {
  const t = useTranslations('home');
  const tPost = useTranslations('displayPost');
  const tProduct = useTranslations('product.card');
  const data: JournalItem[] = posts.length >= 2
    ? posts.slice(0, 2).map((p) => ({
        title: p.title,
        body: p.excerpt ?? '',
        date: p.published_at ? formatDate(p.published_at) : '—',
        image: p.thumbnail ?? null,
        href: `/display/${p.slug}`,
        category: 'Journal',
      }))
    : PLACEHOLDER_ENTRIES;

  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      <div className="flex items-center gap-4 mb-20">
        <h2 className="font-display text-headline-lg text-ink uppercase shrink-0">
          {t('journalTitle')}
        </h2>
        <div className="h-1 bg-ink w-full" />
      </div>

      <div className="flex flex-col gap-16">
        {data.map((entry, i) => (
          <JournalEntry
            key={entry.title}
            entry={entry}
            flip={i % 2 === 1}
            readMore={tPost('readMore')}
            publishedOn={tPost('publishedOn')}
          />
        ))}
      </div>
    </section>
  );
}

interface JournalItem {
  title: string;
  body: string;
  date: string;
  image: string | null;
  href: string;
  category: string;
}

function JournalEntry({
  entry,
  flip,
  readMore,
  publishedOn,
}: {
  entry: JournalItem;
  flip: boolean;
  readMore: string;
  publishedOn: string;
}) {
  return (
    <article className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center group">
      {/* Image col */}
      <div className={`md:col-span-5 ${flip ? 'md:order-2' : 'md:order-1'}`}>
        <Card
          href={entry.href}
          variant="surface"
          hoverable
          thick
          className="aspect-[4/3]"
        >
          {entry.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.image}
              alt={entry.title}
              loading="lazy"
              className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <div className="h-full w-full bg-primary/10 flex items-center justify-center font-display text-headline-md text-primary uppercase text-center px-6">
              {entry.title}
            </div>
          )}
        </Card>
      </div>

      {/* Text col */}
      <div className={`md:col-span-7 ${flip ? 'md:order-1' : 'md:order-2'} flex flex-col gap-4`}>
        <div className="flex items-center gap-4">
          <span className="bg-primary text-surface px-3 py-1 font-label text-label-sm uppercase">
            {entry.category}
          </span>
          <span className="font-label text-label-sm text-ink/70 uppercase">
            {entry.date}
          </span>
        </div>
        <h3 className="font-display text-headline-lg text-primary uppercase group-hover:underline underline-offset-8 decoration-4">
          {entry.title}
        </h3>
        <p className="font-body text-body-lg text-ink/70">{entry.body}</p>
        <NLink
          href={entry.href}
          variant="primary"
          underline="hover"
          arrow
          className="mt-4 font-label text-label-sm font-black uppercase text-xl"
        >
          {readMore}
        </NLink>
      </div>
    </article>
  );
}

const PLACEHOLDER_ENTRIES: JournalItem[] = [
  {
    title: 'The Honesty of Raw Concrete',
    body: 'How architectural brutalism informs modern digital interface logic through hierarchy and material truth.',
    date: 'Oct 24, 2026',
    image: null,
    href: '/display',
    category: 'Journal',
  },
  {
    title: 'Coding with Intentional Flaws',
    body: 'Embracing the glitch and the irregular to create digital spaces that feel human and crafted.',
    date: 'Sep 12, 2026',
    image: null,
    href: '/display',
    category: 'Journal',
  },
];
