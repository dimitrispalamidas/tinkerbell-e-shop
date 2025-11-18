import { getLocale } from 'next-intl/server';
import { getRequestBaseUrl } from '@/lib/utils/base-url';
import { DecorationsGalleryClient } from './decorations-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  
  return {
    title: locale === 'el' ? 'Στολισμοί Εκδηλώσεων' : 'Event Decorations',
    description: locale === 'el' 
      ? 'Δημιουργούμε πρωτότυπες ιδέες για τη διοργάνωση του γάμου σας ή της βάπτισης με προσκλητήρια, μπομπονιέρες και στολισμούς. Ανακαλύψτε τη συλλογή μας!'
      : 'We create original ideas for organizing your wedding or baptism with invitations, favors, and decorations. Discover our collection!',
    openGraph: {
      title: locale === 'el' ? 'Στολισμοί Εκδηλώσεων | Τινκερμπελ' : 'Event Decorations | Tinkerbell',
      description: locale === 'el' 
        ? 'Δημιουργούμε πρωτότυπες ιδέες για τη διοργάνωση του γάμου σας ή της βάπτισης.'
        : 'We create original ideas for organizing your wedding or baptism.',
    },
  };
}

async function fetchGalleryPhotos(category: 'decoration') {
  try {
    const baseUrl = await getRequestBaseUrl();
    const response = await fetch(`${baseUrl}/api/catalog/gallery/${category}`, {
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      console.error('Failed to fetch gallery photos', await response.text());
      return [];
    }

    const payload = (await response.json()) as { photos?: string[] };
    return payload.photos ?? [];
  } catch (error) {
    console.error('Gallery fetch error', error);
    return [];
  }
}

export default async function DecorationsGalleryPage() {
  const locale = await getLocale();
  const photos = await fetchGalleryPhotos('decoration');

  return <DecorationsGalleryClient locale={locale} photos={photos} />;
}
