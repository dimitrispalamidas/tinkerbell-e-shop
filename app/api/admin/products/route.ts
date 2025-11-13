import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const requireAdmin = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return { errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase };
};

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (!supabase) {
    return errorResponse!;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch admin products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function PATCH(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (!supabase) {
    return errorResponse!;
  }

  try {
    const payload = await request.json();
    const { action, productId } = payload ?? {};

    if (!productId || !action) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (action === 'archive') {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', productId);

      if (error) {
        console.error('Failed to archive product:', error);
        return NextResponse.json({ error: 'Failed to archive product' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'restore') {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('product_id', productId);

      if (variantsError) {
        console.error('Failed to fetch product variants:', variantsError);
        return NextResponse.json({ error: 'Failed to restore product' }, { status: 500 });
      }

      const totalStock = variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) ?? 0;
      const newStatus = totalStock > 0 ? 'active' : 'sold_out';

      const { error } = await supabase
        .from('products')
        .update({
          status: newStatus,
          is_active: newStatus === 'active',
          archived_at: null,
        })
        .eq('id', productId);

      if (error) {
        console.error('Failed to restore product:', error);
        return NextResponse.json({ error: 'Failed to restore product' }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: newStatus });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Admin products action failed:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

