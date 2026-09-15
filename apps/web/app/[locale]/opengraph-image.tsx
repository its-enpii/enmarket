import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const alt = 'EnStudio — Discover · Develop · Display';

export default function OpenGraphImage() {
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
            flexDirection: 'column',
            gap: 36,
            padding: '92px 104px',
          }}
        >
          <div
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 120,
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
    ),
    size
  );
}
