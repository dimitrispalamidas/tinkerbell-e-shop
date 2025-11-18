import { getLocale } from 'next-intl/server';
import { getRequestBaseUrl } from '@/lib/utils/base-url';
import type { CatalogProduct, CatalogCategory } from '@/lib/types/catalog';
import { ShopClient } from './shop-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  
  return {
    title: locale === 'el' ? 'Κατάστημα - Παιδικά & Εφηβικά Ρούχα και Παπούτσια' : 'Shop - Kids & Teen Clothing and Shoes',
    description: locale === 'el' 
      ? 'Ανακαλύψτε τη μοναδική μας συλλογή από παιδικά ρούχα, παπούτσια και αξεσουάρ. Βαπτιστικά ρούχα, casual ρούχα και παπούτσια για κάθε περίσταση.'
      : 'Discover our unique collection of kids clothing, shoes and accessories. Baptism outfits, casual wear and shoes for every occasion.',
    openGraph: {
      title: locale === 'el' ? 'Κατάστημα | Τινκερμπελ' : 'Shop | Tinkerbell',
      description: locale === 'el' 
        ? 'Ανακαλύψτε τη μοναδική μας συλλογή από παιδικά ρούχα, παπούτσια και αξεσουάρ.'
        : 'Discover our unique collection of kids clothing, shoes and accessories.',
    },
  };
}

async function fetchCategories() {
  try {
    const baseUrl = await getRequestBaseUrl();
    const response = await fetch(`${baseUrl}/api/catalog/categories`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error('Failed to fetch categories', await response.text());
      return [];
    }

    const payload = (await response.json()) as {
      categories?: CatalogCategory[];
    };

    return payload.categories ?? [];
  } catch (error) {
    console.error('Catalog categories fetch error', error);
    return [];
  }
}

async function fetchProducts(params: { type?: string; category?: string }) {
  try {
    const baseUrl = await getRequestBaseUrl();
    const search = new URLSearchParams();
    if (params.type) search.set('type', params.type);
    if (params.category) search.set('category', params.category);

    const query = search.toString();
    const url = query
      ? `${baseUrl}/api/catalog/products?${query}`
      : `${baseUrl}/api/catalog/products`;

    const response = await fetch(url, { next: { revalidate: 120 } });

    if (!response.ok) {
      console.error('Failed to fetch products', await response.text());
      return [];
    }

    const payload = (await response.json()) as { products?: CatalogProduct[] };
    return payload.products ?? [];
  } catch (error) {
    console.error('Catalog products fetch error', error);
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const locale = await getLocale();
  const { type, category } = await searchParams;

  const [allCategories, products] = await Promise.all([
    fetchCategories(),
    fetchProducts({ type, category }),
  ]);

  return (
    <ShopClient
      locale={locale}
      products={products}
      allCategories={allCategories}
      type={type}
      category={category}
    />
  );
}

