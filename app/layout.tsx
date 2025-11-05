import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from '@/components/ui/toaster';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tinkerbell.gr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Τινκερμπελ - Παιδικά & Εφηβικά Ρούχα και Παπούτσια | Καλαμάτα",
    template: "%s | Τινκερμπελ"
  },
  description: "Ανακαλύψτε τη μοναδική μας συλλογή από παιδικά ρούχα, παπούτσια, και βαπτιστικά πακέτα στην Καλαμάτα. Βαπτιστικά, στολισμοί εκδηλώσεων και παιδικά είδη με αγάπη και φροντίδα.",
  keywords: [
    "Τινκερμπελ",
    "Τινκερμπελ Καλαμάτα",
    "παιδικά ρούχα",
    "παιδικά παπούτσια", 
    "βαπτιστικά",
    "βαπτιστικά πακέτα",
    "στολισμοί βάπτισης",
    "στολισμοί εκδηλώσεων",
    "Καλαμάτα",
    "παιδικά είδη",
    "εφηβικά ρούχα",
    "μπομπονιέρες",
    "λαμπάδες",
    "Tinkerbell",
    "baptism packages",
    "kids clothing",
    "kids shoes"
  ],
  authors: [{ name: "Τινκερμπελ Καλαμάτα" }],
  creator: "Τινκερμπελ",
  publisher: "Τινκερμπελ",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'el_GR',
    alternateLocale: ['en_US'],
    url: siteUrl,
    siteName: 'Τινκερμπελ',
    title: 'Τινκερμπελ - Παιδικά & Εφηβικά Ρούχα και Παπούτσια',
    description: 'Ανακαλύψτε τη μοναδική μας συλλογή από παιδικά ρούχα, παπούτσια, και βαπτιστικά πακέτα. Βαπτιστικά, στολισμοί εκδηλώσεων με αγάπη και φροντίδα.',
    images: [
      {
        url: `${siteUrl}/logo.webp`,
        width: 1200,
        height: 630,
        alt: 'Τινκερμπελ - Παιδικά Ρούχα και Βαπτιστικά',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Τινκερμπελ - Παιδικά & Εφηβικά Ρούχα και Παπούτσια',
    description: 'Ανακαλύψτε τη μοναδική μας συλλογή από παιδικά ρούχα, παπούτσια, και βαπτιστικά πακέτα.',
    images: [`${siteUrl}/logo.webp`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'el-GR': `${siteUrl}/el`,
      'en-US': `${siteUrl}/en`,
    },
  },
  category: 'shopping',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#db2777" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Τινκερμπελ" />
        
        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "Τινκερμπελ",
              "alternateName": "Tinkerbell",
              "description": "Παιδικά & Εφηβικά Ρούχα, Παπούτσια και Βαπτιστικά",
              "image": `${siteUrl}/logo.webp`,
              "url": siteUrl,
              "telephone": "+30-2721-406303",
              "email": "tinkerbellkalamatas@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Γεωργούλη 8",
                "addressLocality": "Καλαμάτα",
                "addressCountry": "GR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "37.0390",
                "longitude": "22.1142"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "17:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "09:00",
                  "closes": "14:00"
                }
              ],
              "priceRange": "€€",
              "servesCuisine": null,
              "paymentAccepted": "Cash, Credit Card, Debit Card",
              "currenciesAccepted": "EUR"
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

