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

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
};

type ValidationError = {
  productId: string;
  productName: string;
  size?: string;
  color?: string;
  requestedQuantity: number;
  availableStock: number;
  issue: 'product_not_found' | 'variant_not_found' | 'insufficient_stock' | 'no_stock';
};

export type CartValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  message?: string;
};

/**
 * Validates cart items against database stock
 * This is called before payment to prevent overselling
 */
export async function validateCartStock(
  cartItems: CartItem[]
): Promise<CartValidationResult> {
  const supabase = getSupabaseAdmin();
  const errors: ValidationError[] = [];

  for (const item of cartItems) {
    // 1. Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name_el, name_en')
      .eq('id', item.id)
      .single();

    if (productError || !product) {
      console.error('❌ [Validation] Product not found:', item.id);
      errors.push({
        productId: item.id,
        productName: item.name,
        requestedQuantity: item.quantity,
        availableStock: 0,
        issue: 'product_not_found',
      });
      continue;
    }

    // 2. Check variant stock if size and color are specified
    if (item.size && item.color) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('stock, size, color')
        .eq('product_id', item.id)
        .eq('size', item.size)
        .eq('color', item.color)
        .single();

      if (variantError || !variant) {
        console.error('❌ [Validation] Variant not found:', {
          product: item.id,
          size: item.size,
          color: item.color,
        });
        errors.push({
          productId: item.id,
          productName: item.name,
          size: item.size,
          color: item.color,
          requestedQuantity: item.quantity,
          availableStock: 0,
          issue: 'variant_not_found',
        });
        continue;
      }

      // 3. Check if enough stock is available
      if (variant.stock === 0) {
        console.error('❌ [Validation] No stock available:', {
          product: item.name,
          size: item.size,
          color: item.color,
        });
        errors.push({
          productId: item.id,
          productName: item.name,
          size: item.size,
          color: item.color,
          requestedQuantity: item.quantity,
          availableStock: 0,
          issue: 'no_stock',
        });
      } else if (variant.stock < item.quantity) {
        console.error('❌ [Validation] Insufficient stock:', {
          product: item.name,
          size: item.size,
          color: item.color,
          requested: item.quantity,
          available: variant.stock,
        });
        errors.push({
          productId: item.id,
          productName: item.name,
          size: item.size,
          color: item.color,
          requestedQuantity: item.quantity,
          availableStock: variant.stock,
          issue: 'insufficient_stock',
        });
      }
    }
  }

  if (errors.length > 0) {
    console.error('❌ [Validation] Cart validation failed with', errors.length, 'errors');
    return {
      valid: false,
      errors,
      message: 'Κάποια προϊόντα δεν είναι πλέον διαθέσιμα ή έχουν ανεπαρκές stock',
    };
  }

  return {
    valid: true,
    errors: [],
  };
}

