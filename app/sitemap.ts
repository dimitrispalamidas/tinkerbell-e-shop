import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tinkerbell.gr'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          el: `${baseUrl}/el`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          el: `${baseUrl}/el/shop`,
          en: `${baseUrl}/en/shop`,
        },
      },
    },
    {
      url: `${baseUrl}/gallery/baptism`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          el: `${baseUrl}/el/gallery/baptism`,
          en: `${baseUrl}/en/gallery/baptism`,
        },
      },
    },
    {
      url: `${baseUrl}/gallery/decorations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          el: `${baseUrl}/el/gallery/decorations`,
          en: `${baseUrl}/en/gallery/decorations`,
        },
      },
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          el: `${baseUrl}/el/contact`,
          en: `${baseUrl}/en/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          el: `${baseUrl}/el/cart`,
          en: `${baseUrl}/en/cart`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
      alternates: {
        languages: {
          el: `${baseUrl}/el/privacy-policy`,
          en: `${baseUrl}/en/privacy-policy`,
        },
      },
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
      alternates: {
        languages: {
          el: `${baseUrl}/el/terms-and-conditions`,
          en: `${baseUrl}/en/terms-and-conditions`,
        },
      },
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
      alternates: {
        languages: {
          el: `${baseUrl}/el/return-policy`,
          en: `${baseUrl}/en/return-policy`,
        },
      },
    },
  ]
}

