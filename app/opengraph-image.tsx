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
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundImage: 'linear-gradient(135deg, rgba(240, 147, 251, 0.9) 0%, rgba(245, 87, 108, 0.9) 100%)',
        }}
      >
        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '80px',
            color: 'white',
            textAlign: 'center',
          }}
        >
          {/* Main Title */}
          <div
            style={{
              fontSize: 90,
              fontWeight: 'bold',
              marginBottom: 30,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            Τινκερμπελ
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 48,
              opacity: 0.95,
              marginBottom: 40,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            Παιδικά & Εφηβικά Ρούχα και Παπούτσια
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              fontSize: 32,
              opacity: 0.9,
              marginBottom: 40,
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <div>✨ Βαπτιστικά</div>
            <div>🎈 Στολισμοί</div>
            <div>👕 Ρούχα</div>
          </div>

          {/* Location & Phone */}
          <div
            style={{
              fontSize: 34,
              opacity: 0.85,
              display: 'flex',
              gap: 30,
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <div>📍 Καλαμάτα</div>
            <div>📞 2721 406303</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

