import { createClient } from '@/lib/supabase/client';

/**
 * Get available stock for a product variant
 */
export async function getVariantStock(
  productId: string,
  size?: string,
  color?: string
): Promise<number> {
  try {
    const supabase = createClient();

    if (!size || !color) {
      // If no size/color, can't check variant stock
      return 0;
    }

    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('product_id', productId)
      .eq('size', size)
      .eq('color', color)
      .single();

    if (error || !variant) {
      console.error('Error fetching variant stock:', error);
      return 0;
    }

    return variant.stock;
  } catch (error) {
    console.error('Error in getVariantStock:', error);
    return 0;
  }
}

/**
 * Validate if quantity is available in stock
 */
export async function validateStock(
  productId: string,
  requestedQuantity: number,
  size?: string,
  color?: string
): Promise<{ valid: boolean; availableStock: number; message?: string }> {
  const availableStock = await getVariantStock(productId, size, color);

  if (requestedQuantity > availableStock) {
    return {
      valid: false,
      availableStock,
      message: availableStock === 0 
        ? 'Out of stock' 
        : `Only ${availableStock} available`,
    };
  }

  return {
    valid: true,
    availableStock,
  };
}

