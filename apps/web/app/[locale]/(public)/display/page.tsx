/**
 * Display — editorial journal / zine of studio writing (enpiistudio).
 * Translated via next-intl 'display' / 'displayList' namespaces.
 */

import { getTranslations } from 'next-intl/server';

import { Button, Card, Eyebrow } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';

import { SearchBar } from '@/components/public/SearchBar';
import { PageHeader } from '@/components/public/PageHeader';
import { SectionContainer } from '@/components/public/SectionContainer';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import { formatDateShort } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import type { PaginatedResponse, Post } from '@/lib/types';

import { HoverImage } from '@/components/ui/HoverImage';
import { MetaLabel, SectionBand, SectionTitle } from '@/components/ui';
import { ImagePlaceholder } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: 'id' | 'en' }>;
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
    ...buildMetadata({
      title: t('title'),
      description: t('subtitle'),
    }),
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
      <SectionBand>
        <SectionContainer py="sm" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow as="span" size="label-sm" color="ink-muted" className="mr-2">
              {t('tagsLabel')}
            </Eyebrow>
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
            <Eyebrow as="span" size="label-sm" color="ink-muted" className="ml-2">
              {total} {t('itemsSuffix')}
            </Eyebrow>
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
      </SectionBand>

      {featured && (
        <SectionBand>
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
        </SectionBand>
      )}

      {!featured && rest.length === 0 ? (
        <SectionBand>
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
        </SectionBand>
      ) : rest.length > 0 ? (
        <SectionBand>
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
        </SectionBand>
      ) : null}

      {/* FOOTER TEASER */}
      <section className="bg-primary text-surface">
        <SectionContainer py="lg" className="text-center">
          <Eyebrow size="md" color="accent" className="mb-4">
            {t('footerEyebrow')}
          </Eyebrow>
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
  locale: 'id' | 'en';
  featuredLabel: string;
  tagLabels: TagLabels;
}) {
  const date = post.published_at ? formatDateShort(post.published_at, locale) : '';
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
            <HoverImage
              src={post.thumbnail}
              alt={post.title}
              className="w-full aspect-43 lg:aspect-auto lg:h-full"
            />
          ) : (
            <div className="aspect-43 lg:aspect-auto lg:h-full min-h-[300px] flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-3xl md:text-5xl text-center px-8 tracking-tighter">
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
          <Eyebrow size="md" color="ink-muted">
            {date}
            {post.reading_time_minutes ? ` · ${post.reading_time_minutes} ${minutesLabel}` : ''}
          </Eyebrow>
          <SectionTitle size="xl" className="group-hover:text-primary transition-colors">
            {post.title}
          </SectionTitle>
          {post.excerpt && (
            <p className="font-body text-body-lg text-ink/75 leading-relaxed border-l-4 border-accent pl-4 italic">
              {post.excerpt}
            </p>
          )}
          <MetaLabel as="span" size="sm" color="primary" className="inline-flex items-center gap-2 font-black mt-2">
            {readEntryLabel}
            <span aria-hidden="true" className="text-xl">→</span>
          </MetaLabel>
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
  locale: 'id' | 'en';
  tagLabels: TagLabels;
}) {
  const date = post.published_at ? formatDateShort(post.published_at, locale) : '';
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
              <HoverImage src={post.thumbnail} alt={post.title}
                className="w-full aspect-video" />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-2xl md:text-4xl text-center px-6 tracking-tighter">
                {post.title}
              </div>
            )}
          </div>
          <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-center gap-4 bg-surface">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 font-label text-label-sm font-black uppercase tracking-wider border-2 border-ink ${tagTone === 'accent' ? 'bg-accent text-ink' : 'bg-primary text-surface'}`}>{tag}</span>
              <MetaLabel as="span" size="sm">{date}</MetaLabel>
            </div>
            <h3 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-ink leading-[0.95] group-hover:text-primary transition-colors">{post.title}</h3>
            {post.excerpt && <p className="font-body text-body-md text-ink/75 leading-snug">{post.excerpt}</p>}
            <MetaLabel as="span" size="sm" color="primary" className="inline-flex items-center gap-2 font-bold mt-1">
              {readEntryLabel} <span aria-hidden="true">→</span>
            </MetaLabel>
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
            <HoverImage src={post.thumbnail} alt={post.title}
              className="w-full h-full" />
          ) : (
            <ImagePlaceholder className="font-display font-black uppercase text-2xl md:text-3xl text-center px-4 tracking-tighter">
              {post.title}
            </ImagePlaceholder>
          )}
        </div>
        <div className="p-5 md:p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 font-label text-label-sm font-black uppercase tracking-wider border-2 border-ink ${tagTone === 'accent' ? 'bg-accent text-ink' : 'bg-primary text-surface'}`}>{tag}</span>
            <MetaLabel as="span" size="sm">{date}</MetaLabel>
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
            <HoverImage src={post.thumbnail} alt={post.title}
              className="w-full aspect-square sm:aspect-auto sm:h-full" />
          ) : (
            <div className="aspect-square sm:aspect-auto sm:h-full min-h-[160px] flex items-center justify-center bg-primary text-surface font-display font-black uppercase text-xl md:text-2xl text-center px-3 tracking-tighter">
              {post.title}
            </div>
          )}
        </div>
        <div className="sm:col-span-2 p-5 md:p-6 space-y-3 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 font-label text-label-sm font-black uppercase tracking-wider border-2 border-ink ${tagTone === 'accent' ? 'bg-accent text-ink' : 'bg-primary text-surface'}`}>{tag}</span>
            <MetaLabel as="span" size="sm">{date}</MetaLabel>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-ink leading-[0.95] group-hover:text-primary transition-colors">{post.title}</h3>
          {post.excerpt && <p className="font-body text-body-sm text-ink/70 leading-snug line-clamp-3">{post.excerpt}</p>}
          <MetaLabel as="span" size="sm" color="primary" className="inline-flex items-center gap-1 font-bold">
            {readLabel} <span aria-hidden="true">→</span>
          </MetaLabel>
        </div>
      </div>
    </Card>
  );
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
