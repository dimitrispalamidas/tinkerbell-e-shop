import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const locale = await getLocale();
  const { type, category } = await searchParams;

  const supabase = await createClient();
  
  // Fetch all categories for filters
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('type', { ascending: true })
    .order('name_el', { ascending: true });
  
  let query = supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('status', 'active');

  if (type) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('type', type);
    
    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id);
      query = query.in('category_id', categoryIds);
    }
  }

  if (category) {
    query = query.eq('category_id', category);
  }

  const { data: products } = await query.order('created_at', { ascending: false });

  return (
    <ShopClient
      locale={locale}
      products={products || []}
      allCategories={allCategories || []}
      type={type}
      category={category}
    />
  );
}

