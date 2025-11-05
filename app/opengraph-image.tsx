import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'Τινκερμπελ - Παιδικά & Εφηβικά Ρούχα και Παπούτσια'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: 20 }}>
          Τινκερμπελ
        </div>
        <div style={{ fontSize: 40, opacity: 0.9 }}>
          Παιδικά & Εφηβικά Ρούχα
        </div>
        <div style={{ fontSize: 32, opacity: 0.8, marginTop: 10 }}>
          Καλαμάτα • 2721 406303
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

