import type { MetadataRoute } from 'next';

/**
 * Web app manifest (route metadata Next.js).
 *
 * Literal hex diizinkan di sini: manifest tidak bisa membaca CSS custom
 * property — warna disamakan dengan token `--background` di globals.css.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EnStudio',
    short_name: 'EnStudio',
    description: 'Studio solo · Showcase karya digital, riset, dan layanan custom.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F3F3F3',
    theme_color: '#F3F3F3',
    icons: [
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon.png', sizes: '64x64', type: 'image/png' },
    ],
  };
}
