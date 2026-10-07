import { Skeleton, SkeletonCard } from './Skeleton';

/**
 * PageLoader — skeleton default generik (header banner + konten 2 kolom).
 *
 * Dipakai sebagai fallback `loading.tsx` untuk rute yang belum punya bentuk
 * skeleton khusus. Bentuknya representatif: banner header full-width
 * (eyebrow + judul) lalu grid 2 kolom (konten utama + sidebar), bukan satu
 * card kecil centered yang monoton.
 */
export function PageLoader() {
  return (
    <main className="min-h-screen bg-surface animate-pulse">
      {/* Header banner */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-20">
          <Skeleton variant="block" height="text" width="narrow" className="h-4 bg-accent/40 mb-4" />
          <Skeleton variant="block" height="input" width="wide" className="bg-ink/20" />
          <Skeleton variant="block" height="text" className="mt-4 max-w-2xl bg-ink/10" />
        </div>
      </section>

      {/* 2-col content */}
      <section className="mx-auto max-w-screen-2xl px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
        {/* Konten utama */}
        <div className="space-y-6">
          <SkeletonCard className="p-6 md:p-8">
            <div className="space-y-4">
              <Skeleton variant="text" lines={3} className="[&>div]:h-4" />
            </div>
          </SkeletonCard>
          <SkeletonCard className="p-6 md:p-8">
            <div className="space-y-4">
              <Skeleton variant="text" lines={4} className="[&>div]:h-4" />
            </div>
          </SkeletonCard>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <SkeletonCard className="p-5">
            <div className="space-y-3">
              <Skeleton variant="block" height="text" width="medium" className="bg-ink/20" />
              <Skeleton variant="text" lines={2} className="[&>div]:h-3" />
            </div>
          </SkeletonCard>
          <Skeleton variant="block" height="media" className="border-2 border-ink bg-primary/10" />
        </aside>
      </section>
    </main>
  );
}

export function AdminListLoader() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <SkeletonCard key={index} className="p-4">
            <Skeleton variant="block" height="panel" className="bg-ink/5" />
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard className="p-12 text-center">
        <Skeleton variant="text" width="narrow" className="mx-auto" />
      </SkeletonCard>
    </div>
  );
}

export function AdminTableLoader() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" width="medium" className="[&>div]:h-14" />
      <div className="space-y-3">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} variant="block" height="input" className="border-2 border-ink/20" />
        ))}
      </div>
    </div>
  );
}
