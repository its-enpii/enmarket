import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // `npm run dev` di dalam container dengan bind mount host (Windows host
  // + Linux container). fs.inotify watcher bawaan sering tidak mendeteksi
  // perubahan di bind mount cross-OS — pakai polling fallback.
  // Hanya aktif di dev: production build tidak butuh.
  webpack: (config, { dev }) => {
    if (!dev) return config;
    config.watchOptions = {
      // Poll setiap 500ms. Cukup responsif tanpa bikin CPU spike.
      poll: 500,
      // Abaikan noise dari deps besar & build artifacts.
      // Webpack 5 minta string glob, bukan array RegExp.
      ignored: [
        '**/.next/**',
        '**/node_modules/**',
        '**/package-lock.json',
      ],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
