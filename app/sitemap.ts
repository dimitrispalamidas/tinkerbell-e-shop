import { MetadataRoute } from 'next'
import { createPublicRouteClient } from '@/lib/supabase/public-route-client'

type ProductForSitemap = {
  id: string
  updated_at: string | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tinkerbell.gr'
  const supabase = createPublicRouteClient()

  // Fetch active products for dynamic sitemap
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)
    .in('status', ['active', 'sold_out'])
    .order('updated_at', { ascending: false })
    .limit(1000) // Limit to prevent sitemap from being too large

  const typedProducts = (products ?? []) as ProductForSitemap[]

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
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

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = typedProducts.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        el: `${baseUrl}/el/product/${product.id}`,
        en: `${baseUrl}/en/product/${product.id}`,
      },
    },
  }))

  return [...staticPages, ...productPages]
}

