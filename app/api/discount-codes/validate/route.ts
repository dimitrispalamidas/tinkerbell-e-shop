import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sanitizeDiscountCode, validateDiscountCode } from '@/lib/utils/discounts'

declare global {
  var __DISCOUNT_VALIDATE_RATE_LIMIT: Map<string, { count: number; expiresAt: number }> | undefined
}

const MAX_REQUESTS_PER_WINDOW = 10
const WINDOW_MS = 60_000 // 1 minute
const rateLimitMap =
  globalThis.__DISCOUNT_VALIDATE_RATE_LIMIT ?? new Map<string, { count: number; expiresAt: number }>()
globalThis.__DISCOUNT_VALIDATE_RATE_LIMIT = rateLimitMap

const validateSchema = z.object({
  code: z.string().min(1).max(50),
  existingCodeIds: z.array(z.string()).optional().default([]),
  productIds: z.array(z.string()).optional().default([]), // Product IDs from cart to check for product discounts
})

const getSupabaseAdmin = () => {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'anonymous'

    const now = Date.now()
    const entry = rateLimitMap.get(identifier)

    if (!entry || now > entry.expiresAt) {
      rateLimitMap.set(identifier, { count: 1, expiresAt: now + WINDOW_MS })
    } else if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.max(0, Math.ceil((entry.expiresAt - now) / 1000))
      return NextResponse.json(
        { valid: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          },
        }
      )
    } else {
      entry.count += 1
    }

    const payload = await request.json()
    const parsed = validateSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: 'Invalid request' },
        { status: 400 }
      )
    }

    const { code, existingCodeIds, productIds } = parsed.data
    const sanitizedCode = sanitizeDiscountCode(code)

    if (!sanitizedCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid discount code format' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Check if code already exists in existing codes (prevent duplicates)
    if (existingCodeIds && existingCodeIds.length > 0) {
      // Fetch existing codes to check their codes
      const { data: existingCodes } = await supabase
        .from('discount_codes')
        .select('id, code')
        .in('id', existingCodeIds)

      if (existingCodes?.some(c => c.code === sanitizedCode)) {
        return NextResponse.json(
          { valid: false, error: 'Discount code already applied' },
          { status: 200 }
        )
      }
    }

    // Fetch discount code from database
    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', sanitizedCode)
      .single()

    if (error || !discountCode) {
      return NextResponse.json(
        { valid: false, error: 'Discount code not found' },
        { status: 200 } // Return 200 to not reveal if code exists
      )
    }

    // Validate discount code
    const validation = validateDiscountCode(discountCode)

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 200 }
      )
    }

    // Check combination with existing codes
    if (existingCodeIds && existingCodeIds.length > 0) {
      // Fetch existing codes to check their can_combine_with_codediscount field
      const { data: existingCodes } = await supabase
        .from('discount_codes')
        .select('id, can_combine_with_codediscount')
        .in('id', existingCodeIds)

      if (existingCodes) {
        // Check if all existing codes can combine with other codes
        const allCanCombine = existingCodes.every(c => c.can_combine_with_codediscount === true)
        
        if (!allCanCombine) {
          return NextResponse.json(
            { valid: false, error: 'Cannot combine with existing discount codes' },
            { status: 200 }
          )
        }

        // Check if the new code can combine with other codes
        if (!discountCode.can_combine_with_codediscount) {
          return NextResponse.json(
            { valid: false, error: 'This discount code cannot be combined with other discount codes' },
            { status: 200 }
          )
        }
      }
    }

    // Check combination with product discounts
    if (productIds && productIds.length > 0) {
      // Fetch active product discounts for cart items
      const { data: productDiscounts } = await supabase
        .from('product_discounts')
        .select('product_id, can_combine_with_codediscount, is_active, starts_at, ends_at')
        .in('product_id', productIds)
        .eq('is_active', true)

      if (productDiscounts && productDiscounts.length > 0) {
        const now = new Date()
        // Filter to only valid, active discounts
        const validProductDiscounts = productDiscounts.filter(discount => {
          if (!discount.is_active) return false
          if (discount.starts_at && new Date(discount.starts_at) > now) return false
          if (discount.ends_at && new Date(discount.ends_at) < now) return false
          return true
        })

        // If there are valid product discounts, check if they can combine with discount codes
        if (validProductDiscounts.length > 0) {
          // Check if any product discount cannot combine with discount codes
          const productDiscountsCannotCombine = validProductDiscounts.some(
            discount => discount.can_combine_with_codediscount === false
          )

          const codeCannotCombineWithProducts = !discountCode.can_combine_with_productdiscount

          // Both need to allow combination for it to work
          if (codeCannotCombineWithProducts && productDiscountsCannotCombine) {
            // Both don't allow combination
            return NextResponse.json(
              { valid: false, error: 'discount_code_and_product_cannot_combine' },
              { status: 200 }
            )
          } else if (codeCannotCombineWithProducts) {
            // Only the discount code doesn't allow combination
            return NextResponse.json(
              { valid: false, error: 'discount_code_cannot_combine_with_products' },
              { status: 200 }
            )
          } else if (productDiscountsCannotCombine) {
            // Only the product discount doesn't allow combination
            return NextResponse.json(
              { valid: false, error: 'product_discount_cannot_combine_with_codes' },
              { status: 200 }
            )
          }
        }
      }
    }

    // Return discount code info (without sensitive fields)
    return NextResponse.json({
      valid: true,
      discount: {
        id: discountCode.id,
        code: discountCode.code,
        discount_type: discountCode.discount_type,
        discount_value: Number(discountCode.discount_value),
        can_combine_with_productdiscount: discountCode.can_combine_with_productdiscount,
        can_combine_with_codediscount: discountCode.can_combine_with_codediscount,
        starts_at: discountCode.starts_at,
        expires_at: discountCode.expires_at,
      },
    })
  } catch (error) {
    console.error('Discount code validation failed:', error)
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    )
  }
}

