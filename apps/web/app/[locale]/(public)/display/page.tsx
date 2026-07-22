/**
 * Display — editorial journal / zine of studio writing (enpiistudio).
 * Translated via next-intl 'display' / 'displayList' namespaces.
 */

import { getTranslations } from 'next-intl/server';

import { Button, Card } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';

import { SearchBar } from '@/components/public/SearchBar';
import { PageHeader } from '@/components/public/PageHeader';
import { SectionContainer } from '@/components/public/SectionContainer';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import type { PaginatedResponse, Post } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; q?: string }>;
}

const TAG_KEYS = ['devLog', 'design', 'behindScenes', 'process'] as const;

type TagLabels = {
  design: string;
  process: string;
  devLog: string;
  note: string;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'displayList' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/display` },
  };
}

async function fetchPosts(): Promise<PaginatedResponse<Post> | null> {
  try {
    return await publicApi.posts({ page: 1, per_page: 12 });
  } catch (err) {
    if (err instanceof PublicFetchError) {
      return {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 },
      };
    }
    throw err;
  }
}

export default async function DisplayPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : undefined;

  const t = await getTranslations('displayList');
  const tPost = await getTranslations('displayPost');
  const tCommon = await getTranslations('common.search');

  const tagLabels: TagLabels = {
    design: t('tags.design'),
    process: t('tags.process'),
    devLog: t('tags.devLog'),
    note: t('tags.note'),
  };

  const postsData = await fetchPosts();
  const posts = postsData?.data ?? [];
  const total = postsData?.meta?.total ?? 0;

  const featured = posts[0] ?? null;
  const rest = posts.slice(1);

  return (
    <>
      {/* HEADER */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitleLong')}
      />

      {/* TAG PILLS + SEARCH */}
      <section className="border-b-4 border-ink bg-surface">
        <SectionContainer py="sm" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mr-2">
              {t('tagsLabel')}
            </span>
            {TAG_KEYS.map((tag) => {
              const tone = tag === 'devLog' || tag === 'process' ? 'primary' : 'accent';
              return (
                <span
                  key={tag}
                  className={[
                    'inline-flex items-center px-3 py-1.5 font-label text-label-sm uppercase font-bold border-2 border-ink cursor-default',
                    tone === 'accent'
                      ? 'bg-accent text-ink'
                      : 'bg-primary text-surface',
                  ].join(' ')}
                >
                  {t(`tags.${tag}`)}
                </span>
              );
            })}
            <span className="ml-2 font-label text-label-sm uppercase tracking-[0.2em] text-ink/60">
              {total} {t('itemsSuffix')}
            </span>
          </div>

          <div className="w-full lg:w-80 lg:shrink-0">
            <SearchBar
              defaultValue={q ?? ''}
              variant="default"
              basePath="/display"
              placeholder={tCommon('placeholder')}
              submitLabel={tCommon('placeholder')}
              showIcon={false}
            />
          </div>
        </SectionContainer>
      </section>

      {featured && (
        <section className="border-b-4 border-ink bg-surface">
          <SectionContainer py="md">
            <FeaturedCover
              post={featured}
              readEntryLabel={tPost('readEntry')}
              minutesLabel={t('minutesShort')}
              locale={locale}
              featuredLabel={t('featured')}
              tagLabels={tagLabels}
            />
          </SectionContainer>
        </section>
      )}

      {!featured && rest.length === 0 ? (
        <section className="border-b-4 border-ink">
          <SectionContainer py="xl" className="text-center">
            <p className="font-display text-headline-md uppercase text-ink/60 mb-6">
              {q
                ? `${t('noResultsFor')} "${q}"`
                : t('empty')}
            </p>
            <p className="font-body text-body-md text-ink/60 max-w-md mx-auto">
              {q
                ? t('hintNoResults')
                : t('hintEmpty')}
            </p>
          </SectionContainer>
        </section>
      ) : rest.length > 0 ? (
        <section className="border-b-4 border-ink">
          <SectionContainer py="md">
            <div className="space-y-10">
              {rest.map((post, i) => (
                <PostCardZine
                  key={post.id}
                  post={post}
                  variant={pickVariant(i, rest.length)}
                  readEntryLabel={tPost('readEntry')}
                  readLabel={tPost('readShort')}
                  locale={locale}
                  tagLabels={tagLabels}
                />
              ))}
            </div>
          </SectionContainer>
        </section>
      ) : null}

      {/* FOOTER TEASER */}
      <section className="bg-primary text-surface">
        <SectionContainer py="lg" className="text-center">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-4">
            {t('footerEyebrow')}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase leading-tight mb-6 max-w-3xl mx-auto">
            {t('footerTitle1')}{' '}
            <span className="inline-block bg-accent text-ink px-2 py-0.5 -rotate-1">
              {t('footerTitleHighlight')}
            </span>{' '}
            {t('footerTitle2')}
          </h2>
          <p className="font-body text-body-md text-surface/80 max-w-xl mx-auto mb-8">
            {t('footerBody')}
          </p>
          <Button
            variant="surface"
            size="lg"
            href="/develop"
            shadowColor="accent"
            className="inline-flex items-center gap-2"
          >
            {t('footerCta')}
          </Button>
        </SectionContainer>
      </section>
    </>
  );
}

function FeaturedCover({
  post,
  readEntryLabel,
  minutesLabel,
  locale,
  featuredLabel,
  tagLabels,
}: {
  post: Post;
  readEntryLabel: string;
  minutesLabel: string;
  locale: string;
  featuredLabel: string;
  tagLabels: TagLabels;
}) {
  const date = post.published_at ? formatDate(post.published_at, locale) : '';
  const tag = post.excerpt ? pickTag(post.excerpt, tagLabels) : tagLabels.note;

  return (
    <Card
      variant="surface"
      thick
      href={`/display/${post.slug}`}
      className="group overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 relative bg-primary/10 border-b-4 lg:border-b-0 lg:border-r-4 border-ink overflow-hidden">
          {post.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full aspect-[4/3] lg:aspect-auto lg:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : (
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px] flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-3xl md:text-5xl text-center px-8 tracking-tighter">
              {post.title}
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <Badge tone="accent" size="md">
              {featuredLabel}
            </Badge>
            <Badge tone="ink" size="md" shadow={false} className="font-bold">
              {tag}
            </Badge>
          </div>
        </div>

        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center gap-5 bg-surface">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-ink/60">
            {date}
            {post.reading_time_minutes ? ` · ${post.reading_time_minutes} ${minutesLabel}` : ''}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] text-ink group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="font-body text-body-lg text-ink/75 leading-relaxed border-l-4 border-accent pl-4 italic">
              {post.excerpt}
            </p>
          )}
          <span className="inline-flex items-center gap-2 font-label text-label-sm uppercase font-black text-primary mt-2">
            {readEntryLabel}
            <span aria-hidden="true" className="text-xl">→</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

type ZineVariant = 'wide' | 'square' | 'narrow';

function pickVariant(index: number, total: number): ZineVariant {
  const pattern: ZineVariant[] = ['wide', 'square', 'narrow', 'square', 'wide'];
  if (index === total - 1 && total % 5 !== 0) {
    return 'square';
  }
  return pattern[index % pattern.length];
}

function PostCardZine({
  post,
  variant,
  readEntryLabel,
  readLabel,
  locale,
  tagLabels,
}: {
  post: Post;
  variant: ZineVariant;
  readEntryLabel: string;
  readLabel: string;
  locale: string;
  tagLabels: TagLabels;
}) {
  const date = post.published_at ? formatDate(post.published_at, locale) : '';
  const tag = post.excerpt ? pickTag(post.excerpt, tagLabels) : tagLabels.note;
  const tagTone: 'accent' | 'primary' = post.id % 2 === 0 ? 'accent' : 'primary';
  const href = `/display/${post.slug}`;

  if (variant === 'wide') {
    return (
      <Card
        variant="surface"
        thick
        href={href}
        className="group overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-7 bg-primary/10 border-b-4 md:border-b-0 md:border-r-4 border-ink overflow-hidden">
            {post.thumbnail ? (
              <img src={post.thumbnail} alt={post.title} loading="lazy"
                className="w-full aspect-[16/9] object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
            ) : (
              <div className="aspect-[16/9] flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-2xl md:text-4xl text-center px-6 tracking-tighter">
                {post.title}
              </div>
            )}
          </div>
          <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-center gap-4 bg-surface">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 font-label text-label-sm font-black uppercase tracking-wider border-2 border-ink ${tagTone === 'accent' ? 'bg-accent text-ink' : 'bg-primary text-surface'}`}>{tag}</span>
              <span className="font-label text-label-sm text-ink/60 uppercase tracking-wider">{date}</span>
            </div>
            <h3 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-ink leading-[0.95] group-hover:text-primary transition-colors">{post.title}</h3>
            {post.excerpt && <p className="font-body text-body-md text-ink/75 leading-snug">{post.excerpt}</p>}
            <span className="inline-flex items-center gap-2 font-label text-label-sm uppercase font-bold text-primary mt-1">
              {readEntryLabel} <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'square') {
    return (
      <Card
        variant="surface"
        thick
        href={href}
        className="group overflow-hidden"
      >
        <div className="aspect-square bg-primary/10 border-b-4 border-ink overflow-hidden">
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} loading="lazy"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-2xl md:text-3xl text-center px-4 tracking-tighter">
              {post.title}
            </div>
          )}
        </div>
        <div className="p-5 md:p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 font-label text-label-sm font-black uppercase tracking-wider border-2 border-ink ${tagTone === 'accent' ? 'bg-accent text-ink' : 'bg-primary text-surface'}`}>{tag}</span>
            <span className="font-label text-label-sm text-ink/60 uppercase tracking-wider">{date}</span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-ink leading-[0.95] group-hover:text-primary transition-colors">{post.title}</h3>
          {post.excerpt && <p className="font-body text-body-sm text-ink/70 leading-snug line-clamp-3">{post.excerpt}</p>}
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="surface"
      thick
      href={href}
      className="group overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3">
        <div className="sm:col-span-1 bg-primary/10 border-b-4 sm:border-b-0 sm:border-r-4 border-ink overflow-hidden">
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} loading="lazy"
              className="w-full aspect-square sm:aspect-auto sm:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
          ) : (
            <div className="aspect-square sm:aspect-auto sm:h-full min-h-[160px] flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-xl md:text-2xl text-center px-3 tracking-tighter">
              {post.title}
            </div>
          )}
        </div>
        <div className="sm:col-span-2 p-5 md:p-6 space-y-3 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 font-label text-label-sm font-black uppercase tracking-wider border-2 border-ink ${tagTone === 'accent' ? 'bg-accent text-ink' : 'bg-primary text-surface'}`}>{tag}</span>
            <span className="font-label text-label-sm text-ink/60 uppercase tracking-wider">{date}</span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-ink leading-[0.95] group-hover:text-primary transition-colors">{post.title}</h3>
          {post.excerpt && <p className="font-body text-body-sm text-ink/70 leading-snug line-clamp-3">{post.excerpt}</p>}
          <span className="inline-flex items-center gap-1 font-label text-label-sm uppercase font-bold text-primary">
            {readLabel} <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function pickTag(excerpt: string, labels: TagLabels): string {
  const lower = excerpt.toLowerCase();
  if (lower.includes('design') || lower.includes('desain') || lower.includes('ui')) {
    return labels.design;
  }
  if (lower.includes('behind') || lower.includes('scenes') || lower.includes('process')) {
    return labels.process;
  }
  if (lower.includes('dev') || lower.includes('code') || lower.includes('kode') || lower.includes('build')) {
    return labels.devLog;
  }
  return labels.note;
}