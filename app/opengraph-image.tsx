import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mundial 2026 Predictor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)',
            left: 80,
            top: 65,
          }}
        />

        {/* Left: Ball */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 260, height: 260, position: 'relative', marginRight: 60 }}>
          {/* Outer circle */}
          <div style={{
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: '#0d0d0d',
            border: '4px solid #00E676',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 60px rgba(0,230,118,0.2)',
          }}>
            {/* Center pentagon */}
            <div style={{
              width: 80,
              height: 80,
              background: '#00E676',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }} />
          </div>
        </div>

        {/* Right: Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#00E676', letterSpacing: 6, textTransform: 'uppercase' }}>
            Mundial 2026
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: -2 }}>
            PREDICTOR
          </div>
          <div style={{ fontSize: 20, color: '#555', letterSpacing: 2, marginTop: 4 }}>
            Monte Carlo · Dixon-Coles · Claude AI
          </div>
          <div style={{
            marginTop: 24,
            display: 'flex',
            gap: 12,
          }}>
            {['48 equipos', '300k simulaciones', 'Datos en tiempo real'].map((tag) => (
              <div key={tag} style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid #333',
                color: '#888',
                fontSize: 14,
                background: '#111',
              }}>
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #00E676, transparent)',
        }} />
      </div>
    ),
    size
  );
}
