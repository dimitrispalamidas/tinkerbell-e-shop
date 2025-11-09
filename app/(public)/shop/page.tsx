import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ShopClient } from './shop-client';

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

