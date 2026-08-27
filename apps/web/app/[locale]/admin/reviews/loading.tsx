import { Card } from '@/components/ui/neobrutal';

export default function AdminReviewsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="surface" hoverable={false} className="p-4 h-24 bg-ink/5" />
        ))}
      </div>
      <Card variant="surface" hoverable={false} className="p-12 text-center">
        <p className="text-sm font-bold text-ink/60">Memuat data ulasan…</p>
      </Card>
    </div>
  );
}
