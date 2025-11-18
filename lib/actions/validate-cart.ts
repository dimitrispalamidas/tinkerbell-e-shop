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

  if (cartItems.length === 0) {
    return { valid: true, errors: [] };
  }

  // Batch fetch all products in one query
  const productIds = Array.from(new Set(cartItems.map((item) => item.id)));
  
  // Batch fetch all variants in one query (optimized)
  const variantItems = cartItems.filter((item) => item.size && item.color);
  const variantProductIds = Array.from(new Set(variantItems.map((item) => item.id)));

  // Parallel queries for better performance
  const [productsResult, variantsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, name_el, name_en, is_active, status')
      .in('id', productIds),
    variantProductIds.length > 0
      ? supabase
          .from('product_variants')
          .select('product_id, size, color, stock')
          .in('product_id', variantProductIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (productsResult.error) {
    console.error('❌ [Validation] Failed to load products:', productsResult.error);
    return {
      valid: false,
      errors: [],
      message: 'Αποτυχία ελέγχου αποθέματος',
    };
  }

  if (variantsResult.error) {
    console.error('❌ [Validation] Failed to load product variants:', variantsResult.error);
    return {
      valid: false,
      errors: [],
      message: 'Αποτυχία ελέγχου αποθέματος',
    };
  }

  const productMap = new Map(productsResult.data?.map((product) => [product.id, product]) ?? []);
  
  const variantMap = new Map(
    (variantsResult.data ?? []).map((variant) => [
      `${variant.product_id}::${variant.size}::${variant.color}`,
      { stock: variant.stock },
    ])
  );

  for (const item of cartItems) {
    const product = productMap.get(item.id);

    if (!product) {
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

    // Check if product is active and available
    if (!product.is_active || product.status === 'archived') {
      errors.push({
        productId: item.id,
        productName: item.name,
        requestedQuantity: item.quantity,
        availableStock: 0,
        issue: 'product_not_found',
      });
      continue;
    }

    if (item.size && item.color) {
      const variantKey = `${item.id}::${item.size}::${item.color}`;
      const variant = variantMap.get(variantKey);

      if (!variant) {
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

