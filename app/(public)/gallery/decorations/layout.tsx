import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Στολισμοί Εκδηλώσεων | Τινκερμπελ',
  description: 'Ανακαλύψτε τη συλλογή μας από στολισμούς εκδηλώσεων, γενεθλίων και παιδικών πάρτι στην Καλαμάτα.',
  openGraph: {
    title: 'Στολισμοί Εκδηλώσεων | Τινκερμπελ',
    description: 'Ανακαλύψτε τη συλλογή μας από στολισμούς εκδηλώσεων, γενεθλίων και παιδικών πάρτι.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Στολισμοί Εκδηλώσεων | Τινκερμπελ',
    description: 'Ανακαλύψτε τη συλλογή μας από στολισμούς εκδηλώσεων, γενεθλίων και παιδικών πάρτι.',
  },
};

export default function DecorationsGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

