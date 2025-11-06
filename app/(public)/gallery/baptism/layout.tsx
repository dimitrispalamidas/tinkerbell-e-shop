import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Βαπτιστικά | Τινκερμπελ',
  description: 'Ανακαλύψτε τη συλλογή μας από βαπτιστικά πακέτα, στολισμούς βάπτισης, μπομπονιέρες και λαμπάδες στην Καλαμάτα.',
  openGraph: {
    title: 'Βαπτιστικά | Τινκερμπελ',
    description: 'Ανακαλύψτε τη συλλογή μας από βαπτιστικά πακέτα, στολισμούς βάπτισης, μπομπονιέρες και λαμπάδες.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Βαπτιστικά | Τινκερμπελ',
    description: 'Ανακαλύψτε τη συλλογή μας από βαπτιστικά πακέτα, στολισμούς βάπτισης, μπομπονιέρες και λαμπάδες.',
  },
};

export default function BaptismGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

