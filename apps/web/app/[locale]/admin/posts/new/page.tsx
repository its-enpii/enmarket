import { Card } from '@/components/ui/neobrutal';

import { PostForm } from '../PostForm';

export const metadata = {
  title: 'Catatan Baru — Admin',
};

export default function NewPostPage() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          ✎ Studio / Catatan
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          Catatan Baru<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Tulis pengumuman, changelog, atau tulisan panjang. Publish kapan
          saja setelah draft siap.
        </p>
      </header>

      <Card variant="surface" className="p-6 md:p-8">
        <PostForm />
      </Card>
    </div>
  );
}
