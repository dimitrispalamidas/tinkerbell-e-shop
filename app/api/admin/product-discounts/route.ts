import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

const requireAdmin = async () => {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminRecord) {
    return { errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase }
}

// Helper to convert datetime-local to ISO string
const normalizeDateTime = (value: string | null | undefined): string | null => {
  if (!value || value === '') return null
  // If already ISO format (has timezone), return as is
  if (value.includes('Z') || value.includes('+') || (value.match(/-/g) || []).length > 2) {
    return value
  }
  // If datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00.000Z`
  }
  // Try to parse as date
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date.toISOString()
}

const createProductDiscountSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data === 'object') {
      return {
        ...data,
        starts_at: normalizeDateTime(data.starts_at),
        ends_at: normalizeDateTime(data.ends_at),
      }
    }
    return data
  },
  z.object({
    product_id: z.string().uuid(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().positive(),
    starts_at: z.string().datetime().nullable().optional(),
    ends_at: z.string().datetime().nullable().optional(),
    is_active: z.boolean().optional().default(false),
    can_combine_with_codediscount: z.boolean().optional().default(false),
  }).refine(
    (data) => {
      if (data.discount_type === 'percentage') {
        return data.discount_value >= 0 && data.discount_value <= 100
      }
      return true
    },
    { message: 'Percentage must be between 0 and 100' }
  ).refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return new Date(data.ends_at) >= new Date(data.starts_at)
      }
      return true
    },
    { message: 'End date must be after start date' }
  )
)

const updateProductDiscountSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data === 'object') {
      return {
        ...data,
        starts_at: data.starts_at !== undefined ? normalizeDateTime(data.starts_at) : data.starts_at,
        ends_at: data.ends_at !== undefined ? normalizeDateTime(data.ends_at) : data.ends_at,
      }
    }
    return data
  },
  z.object({
    product_id: z.string().uuid().optional(),
    discount_type: z.enum(['percentage', 'fixed']).optional(),
    discount_value: z.number().positive().optional(),
    starts_at: z.string().datetime().nullable().optional(),
    ends_at: z.string().datetime().nullable().optional(),
    is_active: z.boolean().optional(),
    can_combine_with_codediscount: z.boolean().optional(),
  }).refine(
    (data) => {
      if (data.discount_type === 'percentage' && data.discount_value !== undefined) {
        return data.discount_value >= 0 && data.discount_value <= 100
      }
      return true
    },
    { message: 'Percentage must be between 0 and 100' }
  ).refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return new Date(data.ends_at) >= new Date(data.starts_at)
      }
      return true
    },
    { message: 'End date must be after start date' }
  )
)

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  const { data, error } = await supabase
    .from('product_discounts')
    .select('*, products(id, name_el, name_en, sku)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch product discounts:', error)
    return NextResponse.json({ error: 'Failed to fetch product discounts' }, { status: 500 })
  }

  return NextResponse.json({ productDiscounts: data ?? [] })
}

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  try {
    const payload = await request.json()
    const parsed = createProductDiscountSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', data.product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 400 }
      )
    }

    const { data: productDiscount, error } = await supabase
      .from('product_discounts')
      .insert({
        product_id: data.product_id,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
        is_active: data.is_active ?? true,
        can_combine_with_codediscount: data.can_combine_with_codediscount ?? false,
      })
      .select('*, products(id, name_el, name_en, sku)')
      .single()

    if (error) {
      console.error('Failed to create product discount:', error)
      return NextResponse.json({ error: 'Failed to create product discount' }, { status: 500 })
    }

    // Clear cache so discount appears immediately
    revalidateTag('catalog-products', 'page')
    revalidateTag(`product-${data.product_id}`, 'page')
    revalidatePath('/shop', 'page')
    revalidatePath('/', 'page')
    revalidatePath(`/product/${data.product_id}`, 'page')

    return NextResponse.json({ productDiscount }, { status: 201 })
  } catch (error) {
    console.error('Create product discount failed:', error)
    return NextResponse.json({ error: 'Failed to create product discount' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  try {
    const payload = await request.json()
    const { id, ...updateData } = payload

    if (!id) {
      return NextResponse.json({ error: 'Product discount ID is required' }, { status: 400 })
    }

    const parsed = updateProductDiscountSchema.safeParse(updateData)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const updatePayload: any = {}

    if (data.product_id !== undefined) {
      // Verify product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', data.product_id)
        .single()

      if (productError || !product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 400 }
        )
      }

      updatePayload.product_id = data.product_id
    }

    if (data.discount_type !== undefined) updatePayload.discount_type = data.discount_type
    if (data.discount_value !== undefined) updatePayload.discount_value = data.discount_value
    if (data.starts_at !== undefined) updatePayload.starts_at = data.starts_at
    if (data.ends_at !== undefined) updatePayload.ends_at = data.ends_at
    if (data.is_active !== undefined) updatePayload.is_active = data.is_active
    if (data.can_combine_with_codediscount !== undefined) updatePayload.can_combine_with_codediscount = data.can_combine_with_codediscount

    const { data: productDiscount, error } = await supabase
      .from('product_discounts')
      .update(updatePayload)
      .eq('id', id)
      .select('*, products(id, name_el, name_en, sku)')
      .single()

    if (error) {
      console.error('Failed to update product discount:', error)
      return NextResponse.json({ error: 'Failed to update product discount' }, { status: 500 })
    }

    // Clear cache so discount changes appear immediately
    if (productDiscount?.product_id) {
      revalidateTag('catalog-products', 'page')
      revalidateTag(`product-${productDiscount.product_id}`, 'page')
      revalidatePath('/shop', 'page')
      revalidatePath('/', 'page')
      revalidatePath(`/product/${productDiscount.product_id}`, 'page')
    }

    return NextResponse.json({ productDiscount })
  } catch (error) {
    console.error('Update product discount failed:', error)
    return NextResponse.json({ error: 'Failed to update product discount' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  // IMPORTANT: This endpoint does SOFT DELETE (sets is_active = false) instead of hard delete
  // to preserve complete order history and tracking.
  // 
  // We need to keep product_discounts records for proper tracking because:
  // 1. order_discounts.product_discount_id references which discount was used in each order
  // 2. We need to see the full discount details (discount_type, discount_value, etc.) for historical orders
  // 3. If we hard delete, order_discounts.product_discount_id becomes NULL (via ON DELETE SET NULL)
  // 4. We lose the ability to see what discount was applied (was it 20%? 10€ fixed? etc.)
  // 5. We only keep discount_amount but lose the discount details (type, value, etc.)
  //
  // Soft delete preserves full discount details while making them inactive.
  // This allows us to see complete order history: which discount, what type, what value, etc.
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product discount ID is required' }, { status: 400 })
    }

    // Verify the discount exists and get product_id for cache clearing
    const { data: existingDiscount, error: checkError } = await supabase
      .from('product_discounts')
      .select('id, product_id')
      .eq('id', id)
      .single()

    if (checkError || !existingDiscount) {
      console.error('Product discount not found or check failed:', checkError)
      return NextResponse.json(
        { error: 'Product discount not found', details: checkError?.message },
        { status: 404 }
      )
    }

    // Soft delete: set is_active = false (preserves order_discounts history with full details)
    // This way we can always see which discount was applied to each order with full details:
    // - discount_type (percentage/fixed)
    // - discount_value (20% or 10€)
    // - starts_at, ends_at
    // - can_combine
    const { error, data } = await supabase
      .from('product_discounts')
      .update({ is_active: false })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Failed to deactivate product discount:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to deactivate product discount', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    // Clear cache so discount removal appears immediately
    if (existingDiscount?.product_id) {
      revalidateTag('catalog-products', 'page')
      revalidateTag(`product-${existingDiscount.product_id}`, 'page')
      revalidatePath('/shop', 'page')
      revalidatePath('/', 'page')
      revalidatePath(`/product/${existingDiscount.product_id}`, 'page')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Deactivate product discount failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to deactivate product discount', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

