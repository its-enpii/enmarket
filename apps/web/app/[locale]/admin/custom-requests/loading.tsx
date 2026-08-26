import { TableSkeleton } from '@/components/admin/TableSkeleton';

export default function CustomRequestsLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="border-b-4 border-ink pb-6 animate-pulse">
        <div className="h-4 w-24 bg-ink/10 mb-3" />
        <div className="h-14 w-64 bg-ink/10" />
      </div>
      <TableSkeleton columnCount={6} count={8} />
    </div>
  );
}
