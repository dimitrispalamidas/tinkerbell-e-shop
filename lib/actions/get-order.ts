"use server"

import { createClient as createServiceClient } from '@supabase/supabase-js';

// Create Supabase admin client for server-side operations
const getSupabaseAdmin = () => {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export type OrderItem = {
  product_name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

export type OrderData = {
  id: string;
  viva_order_code: string;
  viva_transaction_id?: string;
  total: number;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  created_at: string;
  boxnow_tracking_code?: string;
  items?: OrderItem[];
};

export async function getOrderByVivaCode(vivaOrderCode: string): Promise<OrderData | null> {
  try {
    console.log('🔍 [Server] Fetching order by Viva order code:', vivaOrderCode);
    
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('viva_order_code', vivaOrderCode)
      .single();

    if (error) {
      console.error('❌ [Server] Error fetching order:', error);
      return null;
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_name, quantity, price, size, color')
      .eq('order_id', data.id);

    if (itemsError) {
      console.error('❌ [Server] Error fetching order items:', itemsError);
    }

    console.log('✅ [Server] Order found:', data?.id);
    return { ...data, items: items || [] } as OrderData;
  } catch (error) {
    console.error('❌ [Server] Exception fetching order:', error);
    return null;
  }
}

export async function getOrderByTransactionId(transactionId: string): Promise<OrderData | null> {
  try {
    console.log('🔍 [Server] Fetching order by transaction ID:', transactionId);
    
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('viva_transaction_id', transactionId)
      .single();

    if (error) {
      console.error('❌ [Server] Error fetching order:', error);
      return null;
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_name, quantity, price, size, color')
      .eq('order_id', data.id);

    if (itemsError) {
      console.error('❌ [Server] Error fetching order items:', itemsError);
    }

    console.log('✅ [Server] Order found:', data?.id);
    return { ...data, items: items || [] } as OrderData;
  } catch (error) {
    console.error('❌ [Server] Exception fetching order:', error);
    return null;
  }
}

export async function getLatestPaidOrder(): Promise<OrderData | null> {
  try {
    console.log('🔍 [Server] Fetching latest paid order');
    
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ [Server] Error fetching latest order:', error);
      return null;
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_name, quantity, price, size, color')
      .eq('order_id', data.id);

    if (itemsError) {
      console.error('❌ [Server] Error fetching order items:', itemsError);
    }

    console.log('✅ [Server] Latest order found:', data?.id);
    return { ...data, items: items || [] } as OrderData;
  } catch (error) {
    console.error('❌ [Server] Exception fetching latest order:', error);
    return null;
  }
}

