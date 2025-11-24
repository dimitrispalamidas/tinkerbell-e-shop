import { NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCartStock } from '@/lib/actions/validate-cart'
import { createVivaPaymentOrder, createOrder } from '@/lib/actions/viva-wallet'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sanitizeDiscountCode, validateDiscountCode, applyDiscountsToCart, validateProductDiscount } from '@/lib/utils/discounts'
import type { DiscountCode, ProductDiscount } from '@/lib/types/database'

declare global {
  var __CHECKOUT_RATE_LIMIT: Map<string, { count: number; expiresAt: number }> | undefined
}

const MAX_REQUESTS_PER_WINDOW = 3
const WINDOW_MS = 60_000
const rateLimitMap =
  globalThis.__CHECKOUT_RATE_LIMIT ?? new Map<string, { count: number; expiresAt: number }>()
globalThis.__CHECKOUT_RATE_LIMIT = rateLimitMap

const HOME_DELIVERY_COST = 3.5

const checkoutSchema = z.object({
  locale: z.string().min(2).max(5),
  cartItems: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
      size: z.string().min(1).optional(),
      color: z.string().min(1).optional(),
    })
  ).min(1),
  discountCodes: z.array(z.string()).optional().default([]),
  formData: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(4),
    deliveryMethod: z.enum(['boxnow', 'home']),
    address: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    boxnowLockerId: z.string().optional(),
    boxnowLockerAddress: z.string().optional(),
    boxnowLockerPostalCode: z.string().optional(),
  }),
}).superRefine((data, ctx) => {
  if (data.formData.deliveryMethod === 'home') {
    if (!data.formData.address) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['formData', 'address'], message: 'Address is required' })
    }
    if (!data.formData.city) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['formData', 'city'], message: 'City is required' })
    }
    if (!data.formData.region) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['formData', 'region'], message: 'Region is required' })
    }
    if (!data.formData.postalCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['formData', 'postalCode'], message: 'Postal code is required' })
    }
  } else {
    if (!data.formData.boxnowLockerId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['formData', 'boxnowLockerId'], message: 'BOXNOW locker is required' })
    }
  }
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
        { message: 'Too many requests. Please try again later.' },
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
    const parsed = checkoutSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { locale, cartItems, formData, discountCodes } = parsed.data
    const supabase = getSupabaseAdmin()

    const productIds = [...new Set(cartItems.map((item) => item.id))]

    // Fetch and validate all discount codes
    const discountCodeRecords: DiscountCode[] = []
    if (discountCodes && discountCodes.length > 0) {
      const sanitizedCodes = discountCodes.map(code => sanitizeDiscountCode(code)).filter(Boolean) as string[]
      
      if (sanitizedCodes.length > 0) {
        const { data: codes, error: codesError } = await supabase
          .from('discount_codes')
          .select('*')
          .in('code', sanitizedCodes)

        if (codesError || !codes || codes.length !== sanitizedCodes.length) {
          return NextResponse.json(
            { message: 'Invalid discount code(s)' },
            { status: 400 }
          )
        }

        // Validate each code
        for (const code of codes) {
          const validation = validateDiscountCode(code)
          if (!validation.valid) {
            return NextResponse.json(
              { message: validation.error },
              { status: 400 }
            )
          }
          discountCodeRecords.push(code)
        }

        // Check if all codes can combine with each other
        const allCanCombine = discountCodeRecords.every(code => code.can_combine_with_codediscount === true)
        if (!allCanCombine && discountCodeRecords.length > 1) {
          return NextResponse.json(
            { message: 'Cannot combine these discount codes' },
            { status: 400 }
          )
        }
      }
    }

    // Fetch product discounts for cart items
    const { data: productDiscounts, error: productDiscountsError } = await supabase
      .from('product_discounts')
      .select('*')
      .in('product_id', productIds)
      .eq('is_active', true)

    if (productDiscountsError) {
      console.error('Failed to fetch product discounts:', productDiscountsError)
    }

    // Filter and validate product discounts
    const validProductDiscounts = new Map<string, ProductDiscount>()
    if (productDiscounts) {
      for (const discount of productDiscounts) {
        const validation = validateProductDiscount(discount)
        if (validation.valid) {
          validProductDiscounts.set(discount.product_id, discount)
        }
      }
    }

    // Note: Combination rules are handled by applyDiscountsToCart function
    // It will automatically use the best discount if they cannot combine

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, name_el, name_en')
      .in('id', productIds)

    if (productsError) {
      console.error('Failed to fetch products for checkout:', productsError)
      return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 })
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ message: 'Some products are no longer available' }, { status: 400 })
    }

    const productMap = new Map(products.map((product) => [product.id, product]))

    const validationItems = cartItems.map((item) => {
      const product = productMap.get(item.id)!
      const productName = locale === 'el' ? product.name_el : product.name_en
      return {
        id: item.id,
        name: productName,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: product.price,
        productName,
      }
    })

    const validation = await validateCartStock(validationItems)
    if (!validation.valid) {
      return NextResponse.json(
        {
          message: validation.message ?? 'Cart validation failed',
          validationErrors: validation.errors,
        },
        { status: 400 }
      )
    }

    const subtotal = validationItems.reduce((total, item) => total + item.price * item.quantity, 0)

    // Apply discounts
    const discountResult = applyDiscountsToCart({
      cartItems: validationItems.map((item) => ({
        productId: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
      discountCodes: discountCodeRecords,
      productDiscounts: validProductDiscounts,
      subtotal,
    })

    const discountAmount = discountResult.totalDiscount
    const shippingCost = formData.deliveryMethod === 'home' ? HOME_DELIVERY_COST : 0
    const total = Math.max(0, subtotal - discountAmount + shippingCost) // Ensure total is never negative

    const fullName = `${formData.firstName} ${formData.lastName}`

    const { orderCode, checkoutUrl } = await createVivaPaymentOrder({
      amount: total,
      orderId: `TMP-${Date.now()}`,
      customerEmail: formData.email,
      customerName: fullName,
      customerPhone: formData.phone,
    })

    // Atomically update discount code usage count if used
    for (const discountCodeRecord of discountCodeRecords) {
      const { error: updateUsageError } = await supabase.rpc('increment_discount_code_usage', {
        code_id: discountCodeRecord.id,
      })

      if (updateUsageError) {
        // If update fails, try manual update with atomic check
        const { error: manualUpdateError } = await supabase
          .from('discount_codes')
          .update({ usage_count: discountCodeRecord.usage_count + 1 })
          .eq('id', discountCodeRecord.id)
          .lt('usage_count', discountCodeRecord.max_uses ?? 999999)

        if (manualUpdateError) {
          console.error('Failed to update discount code usage:', manualUpdateError)
          // Continue anyway - we'll track it in order_discounts
        }
      }
    }

    const order = await createOrder({
      items: validationItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        product_name: item.productName,
      })),
      total,
      discount_amount: discountAmount,
      discount_code_id: discountCodeRecords.length > 0 ? discountCodeRecords[0].id : null,
      customer_email: formData.email,
      customer_name: fullName,
      customer_phone: formData.phone,
      shipping_address: {
        name: fullName,
        address: formData.deliveryMethod === 'home' ? formData.address ?? '' : '',
        city: formData.deliveryMethod === 'home' ? formData.city ?? '' : '',
        postal_code:
          formData.deliveryMethod === 'home'
            ? formData.postalCode ?? ''
            : formData.boxnowLockerPostalCode ?? '',
        region: formData.deliveryMethod === 'home' ? formData.region ?? '' : '',
        country: 'GR',
        phone: formData.phone,
        delivery_method: formData.deliveryMethod,
        boxnow_locker_address:
          formData.deliveryMethod === 'boxnow' ? formData.boxnowLockerAddress : undefined,
      },
      boxnow_locker_id: formData.deliveryMethod === 'boxnow' ? formData.boxnowLockerId : undefined,
      viva_order_code: orderCode,
    })

    // Create order_discounts records for tracking
    const orderDiscountsToInsert = []

    // Calculate individual discount amounts for each code (sequential application)
    if (discountCodeRecords.length > 0 && discountResult.discountBreakdown.codeDiscount > 0) {
      let remainingAmount = subtotal - discountResult.discountBreakdown.productDiscounts
      
      for (const discountCodeRecord of discountCodeRecords) {
        const codeDiscount = discountCodeRecord.discount_type === 'percentage'
          ? (remainingAmount * discountCodeRecord.discount_value) / 100
          : discountCodeRecord.discount_value
        
        const actualDiscount = Math.min(codeDiscount, remainingAmount)
        if (actualDiscount > 0) {
          orderDiscountsToInsert.push({
            order_id: order.id,
            discount_code_id: discountCodeRecord.id,
            discount_amount: actualDiscount,
          })
          remainingAmount -= actualDiscount
          remainingAmount = Math.max(0, remainingAmount)
        }
      }
    }

    // Add product discounts (only if they were actually applied)
    if (discountResult.discountBreakdown.productDiscounts > 0) {
      for (const item of validationItems) {
        const productDiscount = validProductDiscounts.get(item.id)
        if (productDiscount) {
          const itemTotal = item.price * item.quantity
          let itemDiscount = 0

          if (discountResult.canCombine) {
            // If can combine, calculate the discount for this item
            itemDiscount = Math.min(
              productDiscount.discount_type === 'percentage'
                ? (itemTotal * productDiscount.discount_value) / 100
                : productDiscount.discount_value * item.quantity, // Fixed discount per item
              itemTotal
            )
          } else if (discountCodeRecords.length === 0 || discountResult.discountBreakdown.productDiscounts > discountResult.discountBreakdown.codeDiscount) {
            // If cannot combine, only add if product discount is higher than code discount
            itemDiscount = Math.min(
              productDiscount.discount_type === 'percentage'
                ? (itemTotal * productDiscount.discount_value) / 100
                : productDiscount.discount_value * item.quantity,
              itemTotal
            )
          }

          if (itemDiscount > 0) {
            orderDiscountsToInsert.push({
              order_id: order.id,
              product_discount_id: productDiscount.id,
              discount_amount: itemDiscount,
            })
          }
        }
      }
    }

    if (orderDiscountsToInsert.length > 0) {
      const { error: orderDiscountsError } = await supabase
        .from('order_discounts')
        .insert(orderDiscountsToInsert)

      if (orderDiscountsError) {
        console.error('Failed to create order discounts:', orderDiscountsError)
        // Don't fail the order if tracking fails
      }
    }

    return NextResponse.json({ checkoutUrl, orderCode })
  } catch (error) {
    console.error('Checkout creation failed:', error)
    return NextResponse.json({ message: 'Checkout failed' }, { status: 500 })
  }
}


