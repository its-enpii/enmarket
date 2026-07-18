import { Card } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';

import { formatDate } from '@/lib/format';
import type { Post } from '@/lib/types';

interface Props {
  post: Post;
  /** Compact: ukuran lebih kecil untuk homepage section (1 dari 2 kolom). */
  compact?: boolean;
}

/**
 * Card blog post — NeoBrutalism style.
 * Thumbnail dengan aspect 16:9, badge Published (kalau applicable),
 * title, excerpt, metadata (tanggal + reading time).
 */
export function PostCard({ post, compact = false }: Props) {
  const thumb = post.thumbnail;
  const isPublished = post.status === 'published';

  return (
    <Card
      href={`/display/${post.slug}`}
      variant="surface"
      hoverable
      className="overflow-hidden"
    >
      <div
        className={
          'bg-primary/10 border-b-2 border-ink overflow-hidden relative ' +
          (compact ? 'aspect-[16/9]' : 'aspect-[16/9]')
        }
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-surface">
            <span className="font-bold text-sm uppercase tracking-wider opacity-80">
              ✎ Catatan
            </span>
          </div>
        )}
        {isPublished && (
          <Badge tone="accent" size="sm" className="absolute top-2 right-2 font-bold">
            Published
          </Badge>
        )}
      </div>

      <div className={compact ? 'p-4' : 'p-5'}>
        <h3
          className={
            'font-bold leading-tight line-clamp-2 text-ink group-hover:text-primary transition-colors ' +
            (compact ? 'text-base' : 'text-lg sm:text-xl')
          }
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p
            className={
              'mt-2 text-ink/70 leading-relaxed ' +
              (compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3')
            }
          >
            {post.excerpt}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-ink/60 uppercase tracking-wide">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.reading_time_minutes && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.reading_time_minutes} mnt baca</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
