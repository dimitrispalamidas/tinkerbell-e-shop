import { DiscountCode, ProductDiscount } from '@/lib/types/database'

/**
 * Calculate discount amount based on discount type and value
 * @param discountType - 'percentage' or 'fixed'
 * @param discountValue - percentage (0-100) or fixed amount in euros
 * @param baseAmount - the amount to apply discount to
 * @returns the discount amount (never exceeds baseAmount)
 */
export function calculateDiscountAmount(
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  baseAmount: number
): number {
  if (baseAmount <= 0) return 0

  let discountAmount = 0

  if (discountType === 'percentage') {
    discountAmount = (baseAmount * discountValue) / 100
  } else {
    // fixed amount
    discountAmount = discountValue
  }

  // Never allow discount to exceed the base amount
  return Math.min(discountAmount, baseAmount)
}

/**
 * Validate discount code is active and can be used
 * @param discountCode - the discount code to validate
 * @returns validation result with error message if invalid
 */
export function validateDiscountCode(discountCode: DiscountCode | null): {
  valid: boolean
  error?: string
} {
  if (!discountCode) {
    return { valid: false, error: 'Discount code not found' }
  }

  if (!discountCode.is_active) {
    return { valid: false, error: 'Discount code is not active' }
  }

  // Check start date
  if (discountCode.starts_at) {
    const startsAt = new Date(discountCode.starts_at)
    if (startsAt > new Date()) {
      return { valid: false, error: 'Discount code has not started yet' }
    }
  }

  // Check expiration
  if (discountCode.expires_at) {
    const expiresAt = new Date(discountCode.expires_at)
    if (expiresAt < new Date()) {
      return { valid: false, error: 'Discount code has expired' }
    }
  }

  // Check usage limits
  if (discountCode.max_uses !== null && discountCode.usage_count >= discountCode.max_uses) {
    return { valid: false, error: 'Discount code has reached maximum uses' }
  }

  return { valid: true }
}

/**
 * Validate product discount is active and can be used
 * @param productDiscount - the product discount to validate
 * @returns validation result with error message if invalid
 */
export function validateProductDiscount(productDiscount: ProductDiscount | null): {
  valid: boolean
  error?: string
} {
  if (!productDiscount) {
    return { valid: false, error: 'Product discount not found' }
  }

  if (!productDiscount.is_active) {
    return { valid: false, error: 'Product discount is not active' }
  }

  const now = new Date()

  // Check start date
  if (productDiscount.starts_at) {
    const startsAt = new Date(productDiscount.starts_at)
    if (startsAt > now) {
      return { valid: false, error: 'Product discount has not started yet' }
    }
  }

  // Check end date
  if (productDiscount.ends_at) {
    const endsAt = new Date(productDiscount.ends_at)
    if (endsAt < now) {
      return { valid: false, error: 'Product discount has expired' }
    }
  }

  return { valid: true }
}

/**
 * Apply discounts to cart items
 * Returns the total discount amount and breakdown
 */
export function applyDiscountsToCart(params: {
  cartItems: Array<{ productId: string; price: number; quantity: number }>
  discountCodes: DiscountCode[] // Array of discount codes
  productDiscounts: Map<string, ProductDiscount> // productId -> ProductDiscount
  subtotal: number
}): {
  totalDiscount: number
  discountBreakdown: {
    codeDiscount: number
    productDiscounts: number
  }
  canCombine: boolean
} {
  const { cartItems, discountCodes, productDiscounts, subtotal } = params

  let productDiscountsTotal = 0
  let canCombineWithProductDiscounts = true

  // Calculate product discounts FIRST (sequential approach)
  for (const item of cartItems) {
    const productDiscount = productDiscounts.get(item.productId)
    if (productDiscount) {
      const validation = validateProductDiscount(productDiscount)
      if (validation.valid) {
        const itemTotal = item.price * item.quantity
        const itemDiscount = calculateDiscountAmount(
          productDiscount.discount_type,
          productDiscount.discount_value,
          itemTotal
        )
        productDiscountsTotal += itemDiscount

        // Check if product discount can combine with discount codes
        if (!productDiscount.can_combine_with_codediscount) {
          canCombineWithProductDiscounts = false
        }
      }
    }
  }

  // Calculate subtotal after product discounts
  let currentAmount = subtotal - productDiscountsTotal

  // Apply discount codes sequentially
  let codeDiscount = 0
  const validDiscountCodes = discountCodes.filter(code => {
    const validation = validateDiscountCode(code)
    return validation.valid
  })

  // Check if all discount codes can combine with each other
  const allCodesCanCombine = validDiscountCodes.every(code => code.can_combine_with_codediscount === true)
  
  // Check if discount codes can combine with product discounts
  const codesCanCombineWithProducts = validDiscountCodes.every(code => code.can_combine_with_productdiscount === true)
  const productsCanCombineWithCodes = canCombineWithProductDiscounts

  const canCombine = allCodesCanCombine && (codesCanCombineWithProducts && productsCanCombineWithCodes)

  if (canCombine && validDiscountCodes.length > 0) {
    // Apply discount codes sequentially
    for (const discountCode of validDiscountCodes) {
      const discountAmount = calculateDiscountAmount(
        discountCode.discount_type,
        discountCode.discount_value,
        currentAmount
      )
      codeDiscount += discountAmount
      currentAmount -= discountAmount
      // Ensure amount doesn't go negative
      currentAmount = Math.max(0, currentAmount)
    }
  } else if (validDiscountCodes.length > 0) {
    // If cannot combine, use only the highest discount
    // Compare product discounts total vs best discount code
    let bestCodeDiscount = 0
    for (const discountCode of validDiscountCodes) {
      const discountAmount = calculateDiscountAmount(
        discountCode.discount_type,
        discountCode.discount_value,
        subtotal - productDiscountsTotal
      )
      bestCodeDiscount = Math.max(bestCodeDiscount, discountAmount)
    }
    
    if (bestCodeDiscount > productDiscountsTotal) {
      codeDiscount = bestCodeDiscount
      productDiscountsTotal = 0
    } else {
      codeDiscount = 0
    }
  }

  // Calculate total discount
  const totalDiscount = codeDiscount + productDiscountsTotal
  // Ensure total discount doesn't exceed subtotal
  const finalTotalDiscount = Math.min(totalDiscount, subtotal)

  return {
    totalDiscount: finalTotalDiscount,
    discountBreakdown: {
      codeDiscount: canCombine ? codeDiscount : (codeDiscount >= productDiscountsTotal ? codeDiscount : 0),
      productDiscounts: canCombine ? productDiscountsTotal : (productDiscountsTotal >= codeDiscount ? productDiscountsTotal : 0),
    },
    canCombine,
  }
}

/**
 * Get active product discount and calculate final price
 * @param price - the base price of the product (or total for cart items: price * quantity)
 * @param productDiscounts - array of product discounts
 * @param quantity - optional quantity for fixed discounts (default: 1)
 * @returns object with active discount, discount amount, and final price
 */
export function getProductDiscountInfo(
  price: number,
  productDiscounts?: Array<{
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    starts_at: string | null
    ends_at: string | null
    is_active: boolean
  }> | null,
  quantity: number = 1
): {
  activeDiscount: {
    discount_type: 'percentage' | 'fixed'
    discount_value: number
  } | null
  discountAmount: number
  finalPrice: number
} {
  if (!productDiscounts || productDiscounts.length === 0 || price <= 0) {
    return {
      activeDiscount: null,
      discountAmount: 0,
      finalPrice: price,
    }
  }

  const now = new Date()

  // Find the first valid active discount
  const activeDiscount = productDiscounts.find((discount) => {
    if (!discount.is_active) return false
    if (discount.starts_at && new Date(discount.starts_at) > now) return false
    if (discount.ends_at && new Date(discount.ends_at) < now) return false
    return true
  })

  if (!activeDiscount) {
    return {
      activeDiscount: null,
      discountAmount: 0,
      finalPrice: price,
    }
  }

  // For fixed discounts, multiply by quantity (per item discount)
  // For percentage discounts, calculate on the total price
  let discountAmount = 0
  if (activeDiscount.discount_type === 'percentage') {
    discountAmount = calculateDiscountAmount(
      activeDiscount.discount_type,
      activeDiscount.discount_value,
      price
    )
  } else {
    // Fixed discount: discount per item * quantity
    discountAmount = Math.min(activeDiscount.discount_value * quantity, price)
  }

  return {
    activeDiscount: {
      discount_type: activeDiscount.discount_type,
      discount_value: activeDiscount.discount_value,
    },
    discountAmount,
    finalPrice: Math.max(0, price - discountAmount),
  }
}

/**
 * Sanitize discount code input
 * - Uppercase
 * - Trim whitespace
 * - Remove special characters (keep only alphanumeric and hyphens)
 */
export function sanitizeDiscountCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
}

