/**
 * Display Detail — long-form editorial article (zine-style).
 *
 * Brief: feel like reading an independent publication feature — large cover,
 * oversized headline, byline strip, structured reading column, related posts.
 *
 * 5 sections:
 *   1. Breadcrumb — minimal "← Back to Display"
 *   2. Cover — full-width image with hard border + hard shadow, oversized
 *      title overlay (image+title zine-style)
 *   3. Byline strip — gold tag chip + date + reading time + author mark
 *   4. Article body — narrow column (~720px), PostContent with .prose-content
 *      styling, pull-quote callout mid-article if content has <blockquote>
 *   5. Related notes — 2-3 smaller bordered cards from latest posts
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button, Card } from '@/components/ui/neobrutal';
import { PostContent } from '@/components/public/PostContent';
import { ReactionStrip } from '@/components/public/ReactionStrip';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import type { Post } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

type TagLabels = {
  design: string;
  process: string;
  devLog: string;
  note: string;
};

async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const res = await publicApi.post(slug);
    return res.data;
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'displayPost' });
  const post = await fetchPost(slug);
  if (!post) {
    return {
      title: t('notFound'),
      robots: { index: false },
    };
  }

  const description = post.excerpt ?? post.title;
  const ogImage = post.thumbnail ?? undefined;

  return {
    title: `${post.title} — Display enpiistudio`,
    description,
    keywords: post.excerpt ? [post.title, post.excerpt] : [post.title],
    alternates: { canonical: `/display/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `/display/${post.slug}`,
      ...(ogImage ? { images: [{ url: ogImage, alt: post.title }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default async function DisplayDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  const t = await getTranslations('displayPost');
  const tList = await getTranslations('displayList');
  const tagLabels: TagLabels = {
    design: tList('tags.design'),
    process: tList('tags.process'),
    devLog: tList('tags.devLog'),
    note: tList('tags.note'),
  };

  const date = post.published_at ? formatDateLong(post.published_at, locale) : '';
  const primaryTag = post.excerpt ? pickTag(post.excerpt, tagLabels) : tagLabels.note;
  const tags = deriveTags(post, primaryTag, {
    studioNotes: t('tagStudioNotes'),
    tools: t('tagTools'),
    typography: t('tagTypography'),
    experiment: t('tagExperiment'),
  });

  // Fetch related — fallback to latest, exclude current
  const related = await fetchRelated(slug);

  return (
    <>
      {/* ───── 1. BREADCRUMB ───── */}
      <div className="relative z-0 bg-surface border-b-2 border-ink/20">
        <div className="px-6 md:px-12 py-4">
          <Link
            href="/display"
            className="inline-flex items-center gap-2 font-label text-label-sm uppercase font-bold text-ink/70 hover:text-primary transition-colors"
          >
            {t('backToJournal')}
          </Link>
        </div>
      </div>

      {/* ───── 2. COVER ───── */}
      {post.thumbnail && (
        <section className="border-b-4 border-ink bg-surface relative overflow-hidden">
          <div className="px-6 md:px-12 py-8 md:py-12">
            <div className="relative">
              <div className="bg-surface border-4 border-ink shadow-[12px_12px_0_0_var(--color-ink)] overflow-hidden -rotate-1 hover:rotate-0 transition-transform">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>
              {/* Decorative accent block — bottom-right, partially off-edge */}
              <div className="hidden md:block absolute -bottom-6 -right-6 w-24 h-24 bg-accent border-4 border-ink shadow-[6px_6px_0_0_var(--color-ink)] rotate-12 -z-0" />
              {/* Small offset marker — top-left, signature stamp feel */}
              <div className="hidden md:flex absolute -top-5 -left-4 w-14 h-14 bg-ink border-4 border-ink shadow-[4px_4px_0_0_var(--color-accent)] items-center justify-center font-display text-surface text-xl font-black uppercase -rotate-6">
                №
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cover fallback — zine-style blockquote sebagai visual anchor saat
          tidak ada thumbnail. Tone konsisten dengan brief "raw studio feel". */}
      {!post.thumbnail && (
        <section className="border-b-4 border-ink bg-primary text-surface">
          <div className="px-6 md:px-12 py-12 md:py-16">
            <div className="border-4 border-ink bg-primary shadow-[12px_12px_0_0_var(--color-accent)] p-10 md:p-16 -rotate-1 max-w-4xl">
              <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
                {t('fallbackEyebrow')}
              </p>
              <p className="font-display text-3xl md:text-5xl font-black uppercase leading-tight tracking-tight">
                {t('fallbackCover')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ───── 3. TITLE + BYLINE ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-12 md:py-16">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
            ✎ Display
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] tracking-tight text-ink max-w-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-8 font-body text-body-xl text-ink/80 max-w-3xl border-l-4 border-accent pl-6 italic leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta strip — thin bordered box (per brief item 2) */}
          <div className="mt-10 inline-flex flex-wrap items-center gap-x-5 gap-y-2 border-2 border-ink bg-surface px-5 py-3 shadow-[3px_3px_0_0_var(--color-ink)]">
            <span className="inline-flex items-center bg-accent text-ink border-2 border-ink px-2.5 py-0.5 font-label text-label-sm font-black uppercase tracking-wider">
              {primaryTag}
            </span>
            <span className="font-label text-label-sm uppercase tracking-wider text-ink">
              {date}
            </span>
            {post.reading_time_minutes ? (
              <>
                <span aria-hidden="true" className="font-bold text-ink/30">·</span>
                <span className="font-label text-label-sm uppercase tracking-wider text-ink">
                  {t('minutes', { count: post.reading_time_minutes })}
                </span>
              </>
            ) : null}
            <span aria-hidden="true" className="font-bold text-ink/30">·</span>
            <span className="font-label text-label-sm uppercase tracking-wider text-ink/70">
              {t('studioNotes')}
            </span>
          </div>
        </div>
      </section>

      {/* ───── 4. ARTICLE BODY ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <article className="prose-content">
              <PostContent content={post.content ?? ''} />
            </article>

            {/* Pull-quote callout jika tidak ada blockquote di content */}
            {!post.content?.includes('<blockquote') && post.excerpt && (
              <aside className="mt-12 border-l-8 border-accent pl-6 py-4">
                <p className="font-display text-2xl md:text-3xl font-black uppercase leading-tight text-ink">
                  &ldquo;{post.excerpt}&rdquo;
                </p>
              </aside>
            )}

            {/* End-of-article signature mark */}
            <div className="mt-16 flex items-center gap-3 font-label text-label-sm uppercase tracking-[0.3em] text-ink/40">
              <span aria-hidden="true">— ✎ —</span>
              <span>{t('end')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TAGS — small bordered pills (per brief item 5) */}
      {tags.length > 0 && (
        <section className="border-b-4 border-ink bg-surface">
          <div className="px-6 md:px-12 py-8 md:py-10">
            <div className="max-w-3xl mx-auto">
              <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mb-4">
                {t('filedUnder')}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((t, i) => (
                  <span
                    key={t}
                    className={[
                      'inline-flex items-center px-3 py-1.5 font-label text-label-sm font-bold uppercase tracking-wider border-2 border-ink',
                      i === 0
                        ? 'bg-accent text-ink shadow-[3px_3px_0_0_var(--color-ink)]'
                        : 'bg-surface text-ink',
                    ].join(' ')}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. REACTION STRIP — "Was this helpful?" + chunky icon buttons (per brief item 7) */}
      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-10 md:py-12">
          <div className="max-w-3xl mx-auto">
            <ReactionStrip postSlug={post.slug} />
          </div>
        </div>
      </section>

      {/* ───── 5. RELATED NOTES ───── */}
      {related.length > 0 && (
        <section className="border-t-4 border-ink bg-surface">
          <div className="px-6 md:px-12 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
                  {t('moreEyebrow')}
                </p>
                <h2 className="font-display text-headline-lg-mobile md:text-headline-lg font-extrabold uppercase tracking-tight text-ink">
                  {t('moreTitle')}
                </h2>
              </div>
              <Link
                href="/display"
                className="font-label text-label-sm uppercase font-bold text-primary hover:text-ink underline decoration-2 underline-offset-4"
              >
                {t('allEntries')}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <RelatedNote
                  key={p.id}
                  post={p}
                  locale={locale}
                  tagLabels={tagLabels}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA — back to Display */}
      <section className="bg-primary text-surface">
        <div className="px-6 md:px-12 py-12 md:py-16 text-center">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-4">
            {t('finalEyebrow')}
          </p>
          <h2 className="font-display text-2xl md:text-4xl font-black uppercase leading-tight mb-6 max-w-3xl mx-auto">
            {t('finalTitle')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="surface"
              size="md"
              href="/display"
              shadowColor="accent"
              className="inline-flex items-center gap-2"
            >
              {t('backDisplay')}
            </Button>
            <Button
              variant="outline"
              size="md"
              href="/develop"
              className="inline-flex items-center gap-2 border-surface text-surface hover:bg-surface hover:text-ink"
            >
              {t('viewDevelop')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

// ───── Helpers ─────

function formatDateLong(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
    month: 'long',
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

/**
 * deriveTags — primary tag dari pickTag + 1-2 secondary tags berdasarkan
 * keyword overlap. Selalu sertakan "Studio notes" sebagai default supaya
 * section Tags tidak pernah kosong (konsisten dengan tone).
 */
function deriveTags(
  post: Post,
  primary: string,
  labels: {
    studioNotes: string;
    tools: string;
    typography: string;
    experiment: string;
  },
): string[] {
  const tags = new Set<string>();
  if (post.excerpt) tags.add(primary);
  tags.add(labels.studioNotes);

  const lower = ((post.excerpt ?? '') + ' ' + (post.title ?? '')).toLowerCase();
  if (lower.includes('typescript') || lower.includes('next.js') || lower.includes('laravel')) {
    tags.add(labels.tools);
  } else if (lower.includes('typography')) {
    tags.add(labels.typography);
  } else if (lower.includes('eksperimen') || lower.includes('experiment')) {
    tags.add(labels.experiment);
  }

  return Array.from(tags);
}

async function fetchRelated(currentSlug: string): Promise<Post[]> {
  try {
    const res = await publicApi.posts({ page: 1, per_page: 6 });
    return (res.data ?? []).filter((p) => p.slug !== currentSlug).slice(0, 3);
  } catch {
    return [];
  }
}

function RelatedNote({
  post,
  locale,
  tagLabels,
}: {
  post: Post;
  locale: string;
  tagLabels: TagLabels;
}) {
  const date = post.published_at ? formatDateShort(post.published_at, locale) : '';
  const tag = post.excerpt ? pickTag(post.excerpt, tagLabels) : tagLabels.note;
  const tagTone: 'accent' | 'primary' = post.id % 2 === 0 ? 'accent' : 'primary';

  return (
    <Card
      variant="surface"
      href={`/display/${post.slug}`}
      className="group overflow-hidden"
    >
      <div className="aspect-square bg-primary/10 border-b-2 border-ink overflow-hidden">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-surface font-display uppercase text-lg text-center px-3">
            {post.title}
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex items-center px-2 py-0.5 font-label text-[10px] font-black uppercase tracking-wider border border-ink',
              tagTone === 'accent'
                ? 'bg-accent text-ink'
                : 'bg-primary text-surface',
            ].join(' ')}
          >
            {tag}
          </span>
          <span className="font-label text-[10px] text-ink/60 uppercase tracking-wider">
            {date}
          </span>
        </div>
        <h3 className="font-display text-lg font-black uppercase tracking-tight text-ink leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
      </div>
    </Card>
  );
}

function formatDateShort(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', { month: 'short', day: 'numeric' });
}