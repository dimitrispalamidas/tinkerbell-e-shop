import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
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

export default async function DecorationsGalleryPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  
  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('category', 'decoration')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const allPhotos = items ? items.map((item) => item.image).filter(Boolean) : [];

  return <DecorationsGalleryClient locale={locale} photos={allPhotos} />;
}
