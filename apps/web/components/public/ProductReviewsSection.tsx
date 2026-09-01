'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { SectionContainer } from './SectionContainer';
import { reviewApi, ProductReviewsResponse } from '@/lib/review-api';
import { formatDate } from '@/lib/format';
import type { Review, ProductRatingSummary } from '@/lib/types';
import { Eyebrow } from '@/components/ui/neobrutal';
import { StatusPill } from '@/components/ui/StatusPill';

interface Props {
  productSlug: string;
  initialSummary?: ProductRatingSummary;
}

export function ProductReviewsSection({ productSlug, initialSummary }: Props) {
  const t = useTranslations('reviews');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ProductRatingSummary>(
    initialSummary || {
      average: 0,
      count: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    }
  );
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      setLoading(true);
      try {
        const res = await reviewApi.getProductReviews(productSlug, page, filterRating);
        if (!mounted) return;
        setReviews(res.data || []);
        if (res.summary) setSummary(res.summary);
        if (res.meta) setLastPage(res.meta.last_page || 1);
      } catch {
        if (!mounted) return;
        setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [productSlug, page, filterRating]);

  const totalReviews = summary.count;

  return (
    <section id="reviews" className="border-b-4 border-ink bg-surface">
      <SectionContainer py="lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <Eyebrow size="md" color="accent" className="mb-2">
              {t('eyebrow')}
            </Eyebrow>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink leading-tight">
              {t('sectionTitle')}
            </h2>
          </div>
          {totalReviews > 0 && (
            <p className="text-sm font-bold text-ink/70">
              {t('basedOnReviews', { count: totalReviews })}
            </p>
          )}
        </div>

        {/* Rating Breakdown Card */}
        <Card variant="surface" hoverable={false} className="p-6 md:p-8 mb-8 bg-accent/10 border-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Score box */}
            <div className="text-center md:text-left border-b-2 md:border-b-0 md:border-r-2 border-ink/20 pb-6 md:pb-0 md:pr-6">
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="font-display text-5xl sm:text-6xl font-black text-ink font-mono">
                  {summary.average.toFixed(1)}
                </span>
                <span className="text-2xl text-ink/60 font-bold">/ 5</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-2xl text-accent my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      Math.round(summary.average) >= star
                        ? 'text-accent drop-shadow-[1px_1px_0_var(--color-ink)]'
                        : 'text-ink/20'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink/70">
                {t('verifiedBuyersScore')}
              </p>
            </div>

            {/* Star Distribution Bars */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = summary.distribution[String(stars) as keyof typeof summary.distribution] || 0;
                const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const isSelected = filterRating === stars;

                return (
                  <Button
                    key={stars}
                    type="button"
                    variant={isSelected ? 'primary' : 'surface'}
                    size="sm"
                    onClick={() => {
                      setFilterRating(isSelected ? undefined : stars);
                      setPage(1);
                    }}
                    className={`w-full gap-3 text-xs font-bold py-1 px-2 text-left ${
                      isSelected ? 'bg-primary text-surface' : 'hover:bg-accent/30 text-ink'
                    }`}
                  >
                    <span className="w-12 font-mono shrink-0 flex items-center gap-0.5">
                      {stars} <span className="text-accent">★</span>
                    </span>
                    <div className="flex-1 h-3 bg-ink/10 border border-ink overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-14 text-right font-mono shrink-0">
                      {count} ({percent}%)
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          <Button
            variant={filterRating === undefined ? 'primary' : 'surface'}
            size="sm"
            onClick={() => {
              setFilterRating(undefined);
              setPage(1);
            }}
          >
            {t('filterAll')} ({totalReviews})
          </Button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <Button
              key={stars}
              variant={filterRating === stars ? 'primary' : 'surface'}
              size="sm"
              onClick={() => {
                setFilterRating(filterRating === stars ? undefined : stars);
                setPage(1);
              }}
            >
              {stars} ★ ({summary.distribution[String(stars) as keyof typeof summary.distribution] || 0})
            </Button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-12 text-center text-ink/60 font-bold">
            {t('loadingReviews')}
          </div>
        ) : reviews.length === 0 ? (
          <Card variant="surface" hoverable={false} className="p-8 text-center space-y-3">
            <span className="text-4xl" role="img" aria-label="reviews">💬</span>
            <p className="font-bold text-base text-ink">{t('emptyTitle')}</p>
            <p className="text-xs text-ink/70 max-w-md mx-auto leading-relaxed">
              {t('emptyHint')}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <Card key={rev.id} variant="surface" hoverable={false} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink/10 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-ink">{rev.buyer_name}</p>
                      <StatusPill tone="success">
                        ✓ {t('verifiedBuyer')}
                      </StatusPill>
                    </div>
                    <p className="text-[11px] text-ink/50 mt-0.5">
                      {rev.created_at ? formatDate(rev.created_at) : '-'}
                    </p>
                  </div>
                  <div className="flex items-center text-accent text-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={
                          rev.rating >= star
                            ? 'text-accent drop-shadow-[1px_1px_0_var(--color-ink)]'
                            : 'text-ink/20'
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-sm text-ink/80 leading-relaxed font-body whitespace-pre-line">
                    {rev.comment}
                  </p>
                )}
              </Card>
            ))}

            {lastPage > 1 && (
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="surface"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← {t('prev')}
                </Button>
                <span className="text-xs font-mono font-bold text-ink">
                  {page} / {lastPage}
                </span>
                <Button
                  variant="surface"
                  size="sm"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                >
                  {t('next')} →
                </Button>
              </div>
            )}
          </div>
        )}
      </SectionContainer>
    </section>
  );
}
