import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
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

export default async function BaptismGalleryPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  
  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('category', 'baptism')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const allPhotos = items ? items.map((item) => item.image).filter(Boolean) : [];

  return <BaptismGalleryClient locale={locale} photos={allPhotos} />;
}
