import { getLocale } from 'next-intl/server';
import { getRequestBaseUrl } from '@/lib/utils/base-url';
import { BaptismGalleryClient } from './baptism-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  
  return {
    title: locale === 'el' ? 'Βαπτιστικά Πακέτα' : 'Baptism Packages',
    description: locale === 'el' 
      ? 'Δημιουργούμε ολοκληρωμένα βαπτιστικά πακέτα με αγάπη και φροντίδα. Από λαμπάδες και λαδόπανα μέχρι ρούχα και μπομπονιέρες για τη μοναδική μέρα του μικρού σας αγγέλου!'
      : 'We create complete baptism packages with love and care. From candles and oil sets to clothes and favors for your little angel\'s unique day!',
    openGraph: {
      title: locale === 'el' ? 'Βαπτιστικά Πακέτα | Τινκερμπελ' : 'Baptism Packages | Tinkerbell',
      description: locale === 'el' 
        ? 'Δημιουργούμε ολοκληρωμένα βαπτιστικά πακέτα με αγάπη και φροντίδα.'
        : 'We create complete baptism packages with love and care.',
    },
  };
}

async function fetchGalleryPhotos(category: 'baptism') {
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

export default async function BaptismGalleryPage() {
  const locale = await getLocale();
  const photos = await fetchGalleryPhotos('baptism');

  return <BaptismGalleryClient locale={locale} photos={photos} />;
}
