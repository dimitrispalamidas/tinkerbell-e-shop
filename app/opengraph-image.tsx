import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Τινκερμπελ - Παιδικά & Εφηβικά Ρούχα και Παπούτσια';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Αυτό θα πάρει την υπάρχουσα εικόνα
export default async function Image() {
  // Επιστρέφουμε την εικόνα που ήδη υπάρχει
  const imageUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tinkerbell.gr';
  
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#db2777',
              marginBottom: '20px',
              letterSpacing: '-2px',
            }}
          >
            Τινκερμπελ
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#831843',
              maxWidth: '800px',
              lineHeight: '1.4',
            }}
          >
            Παιδικά & Εφηβικά Ρούχα και Παπούτσια
          </p>
          <p
            style={{
              fontSize: '24px',
              color: '#9d174d',
              marginTop: '20px',
            }}
          >
            Καλαμάτα • 2721 406303
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

