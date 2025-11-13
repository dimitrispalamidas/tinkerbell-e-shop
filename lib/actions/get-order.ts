"use server"

import { createClient } from '@/lib/supabase/server';

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

const getAuthorizedAdminClient = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    throw new Error('Forbidden');
  }

  return supabase;
};

export async function getOrderByVivaCode(vivaOrderCode: string): Promise<OrderData | null> {
  try {
    const supabase = await getAuthorizedAdminClient();
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

    return { ...data, items: items || [] } as OrderData;
  } catch (error) {
    console.error('❌ [Server] Exception fetching order:', error);
    return null;
  }
}

export async function getOrderByTransactionId(transactionId: string): Promise<OrderData | null> {
  try {
    const supabase = await getAuthorizedAdminClient();
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

    return { ...data, items: items || [] } as OrderData;
  } catch (error) {
    console.error('❌ [Server] Exception fetching order:', error);
    return null;
  }
}

export async function getLatestPaidOrder(): Promise<OrderData | null> {
  try {
    const supabase = await getAuthorizedAdminClient();
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

    return { ...data, items: items || [] } as OrderData;
  } catch (error) {
    console.error('❌ [Server] Exception fetching latest order:', error);
    return null;
  }
}

