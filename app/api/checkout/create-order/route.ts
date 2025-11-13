import { NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCartStock } from '@/lib/actions/validate-cart'
import { createVivaPaymentOrder, createOrder } from '@/lib/actions/viva-wallet'
import { createClient as createServiceClient } from '@supabase/supabase-js'

declare global {
  // eslint-disable-next-line no-var
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

    const { locale, cartItems, formData } = parsed.data
    const supabase = getSupabaseAdmin()

    const productIds = [...new Set(cartItems.map((item) => item.id))]

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
    const shippingCost = formData.deliveryMethod === 'home' ? HOME_DELIVERY_COST : 0
    const total = subtotal + shippingCost

    const fullName = `${formData.firstName} ${formData.lastName}`

    const { orderCode, checkoutUrl } = await createVivaPaymentOrder({
      amount: total,
      orderId: `TMP-${Date.now()}`,
      customerEmail: formData.email,
      customerName: fullName,
      customerPhone: formData.phone,
    })

    await createOrder({
      items: validationItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        product_name: item.productName,
      })),
      total,
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

    return NextResponse.json({ checkoutUrl, orderCode })
  } catch (error) {
    console.error('Checkout creation failed:', error)
    return NextResponse.json({ message: 'Checkout failed' }, { status: 500 })
  }
}


