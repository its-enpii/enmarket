/**
 * Alias /c/[slug] → /develop.
 *
 * Pengalihan 301 ditangani `middleware.ts` — di sana status benar-benar
 * terpancar. Redirect di level segmen tidak bisa mengubah status karena
 * `loading.tsx` (leluhur) mem-stream 200 sebelum render selesai.
 */
export default function CategoryAliasPage() {
  return null;
}
