import { Card } from '@/components/ui/neobrutal';

/**
 * Reusable skeleton untuk halaman form admin (new/edit).
 * Dipakai sebagai loading.tsx di route segment form — context-agnostic.
 *
 * Topbar sudah di-handle oleh layout (sticky AdminTopbar), jadi di sini
 * cuma render content skeleton.
 *
 * Props:
 * - fieldCount: jumlah baris field skeleton (default 6)
 * - includeTextarea: kalau true, render 1 textarea lebih besar
 * - includeActions: kalau true, render baris tombol submit di bawah
 */
interface Props {
  fieldCount?: number;
  includeTextarea?: boolean;
  includeActions?: boolean;
}

export function PageFormLoading({
  fieldCount = 6,
  includeTextarea = true,
  includeActions = true,
}: Props) {
  return (
    <div className="p-8 max-w-4xl">
      <Card variant="surface" hoverable={false} className="p-6 animate-pulse space-y-5">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-24 bg-ink/10 mb-2" />
            <div className="h-10 bg-ink/10" />
          </div>
        ))}
        {includeTextarea && (
          <div>
            <div className="h-3 w-32 bg-ink/10 mb-2" />
            <div className="h-24 bg-ink/10" />
          </div>
        )}
        {includeActions && (
          <div className="flex gap-2 pt-2 border-t-2 border-ink/10">
            <div className="h-10 w-32 bg-ink/10" />
            <div className="h-10 w-24 bg-ink/10" />
          </div>
        )}
      </Card>
    </div>
  );
}
