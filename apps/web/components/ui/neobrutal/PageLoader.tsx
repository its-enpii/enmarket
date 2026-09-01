import { Skeleton, SkeletonCard } from './Skeleton';

export function PageLoader() {
  return (
    <main className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-md space-y-6">
        <SkeletonCard className="p-8">
          <Skeleton variant="text" width="medium" className="[&>div]:h-3" />
          <div className="mt-6 space-y-5">
            <Skeleton variant="block" height="input" />
            <Skeleton variant="block" height="input" className="bg-accent/50" />
          </div>
        </SkeletonCard>
        <Skeleton variant="text" width="narrow" className="mx-auto" />
      </div>
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
