import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const alt = 'EnStudio · Discover · Develop · Display';

/**
 * Mark logo dibaca dari filesystem (bukan fetch jaringan, bukan URL eksternal)
 * lalu dikonversi ke data URL. Aset nyata: `public/logo/enstudio-mark-light.png`.
 */
function logoDataUrl(): string | null {
  try {
    const buf = readFileSync(
      join(process.cwd(), 'public', 'logo', 'enstudio-mark-light.png')
    );
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export default function OpenGraphImage() {
  const logo = logoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          backgroundColor: '#F3F3F3',
          color: '#040303',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            backgroundColor: '#F3F3F3',
            border: '8px solid #040303',
            boxShadow: '16px 16px 0 0 #040303',
            display: 'flex',
            flexDirection: 'row',
            gap: 64,
            padding: '72px 88px',
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              src={logo}
              width={220}
              height={220}
              alt=""
              style={{ display: 'flex', objectFit: 'contain' }}
            />
          ) : null}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 36,
            }}
          >
            <div
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 112,
                fontWeight: 900,
                letterSpacing: -4,
                textTransform: 'uppercase',
              }}
            >
              EnStudio
            </div>
            <div
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 40,
                fontWeight: 700,
              }}
            >
              Discover · Develop · Display
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
