/**
 * Footer publik — branding enpiistudio.
 */
export function Footer() {
  return (
    <footer className="border-t-4 border-ink bg-surface mt-12">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-ink">
            <span className="bg-primary text-surface border-2 border-ink px-2 py-0.5 text-sm mr-2">
              enpii
            </span>
            enpiistudio
          </p>
          <p className="mt-2 text-xs text-ink/60">
            © {new Date().getFullYear()} enpiistudio — Discover · Develop · Display
          </p>
        </div>
        <div className="flex gap-3 text-xs text-ink/60">
          <span>Powered by Laravel + Next.js</span>
        </div>
      </div>
    </footer>
  );
}