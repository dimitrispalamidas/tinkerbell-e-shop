import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sanitizeDiscountCode } from '@/lib/utils/discounts'

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

const createDiscountCodeSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data === 'object') {
      return {
        ...data,
        starts_at: data.starts_at !== undefined ? normalizeDateTime(data.starts_at) : data.starts_at,
        expires_at: data.expires_at !== undefined ? normalizeDateTime(data.expires_at) : data.expires_at,
      }
    }
    return data
  },
  z.object({
    code: z.string().min(1).max(50),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().positive(),
    starts_at: z.string().datetime().nullable().optional(),
    expires_at: z.string().datetime().nullable().optional(),
    is_active: z.boolean().optional().default(true),
    can_combine_with_productdiscount: z.boolean().optional().default(false),
    can_combine_with_codediscount: z.boolean().optional().default(false),
    max_uses: z.number().int().positive().nullable().optional(),
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
      if (data.starts_at && data.expires_at) {
        return new Date(data.expires_at) >= new Date(data.starts_at)
      }
      return true
    },
    { message: 'Expiration date must be after start date' }
  )
)

const updateDiscountCodeSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data === 'object') {
      return {
        ...data,
        starts_at: data.starts_at !== undefined ? normalizeDateTime(data.starts_at) : data.starts_at,
        expires_at: data.expires_at !== undefined ? normalizeDateTime(data.expires_at) : data.expires_at,
      }
    }
    return data
  },
  z.object({
    code: z.string().min(1).max(50).optional(),
    discount_type: z.enum(['percentage', 'fixed']).optional(),
    discount_value: z.number().positive().optional(),
    starts_at: z.string().datetime().nullable().optional(),
    expires_at: z.string().datetime().nullable().optional(),
    is_active: z.boolean().optional(),
    can_combine_with_productdiscount: z.boolean().optional(),
    can_combine_with_codediscount: z.boolean().optional(),
    max_uses: z.number().int().positive().nullable().optional(),
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
      if (data.starts_at && data.expires_at) {
        return new Date(data.expires_at) >= new Date(data.starts_at)
      }
      return true
    },
    { message: 'Expiration date must be after start date' }
  )
)

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch discount codes:', error)
    return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 })
  }

  return NextResponse.json({ discountCodes: data ?? [] })
}

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  try {
    const payload = await request.json()
    const parsed = createDiscountCodeSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const sanitizedCode = sanitizeDiscountCode(data.code)

    if (!sanitizedCode) {
      return NextResponse.json(
        { error: 'Invalid discount code format' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('discount_codes')
      .select('id')
      .eq('code', sanitizedCode)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      )
    }

    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .insert({
        code: sanitizedCode,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        starts_at: data.starts_at || null,
        expires_at: data.expires_at || null,
        is_active: data.is_active ?? true,
        can_combine_with_productdiscount: data.can_combine_with_productdiscount ?? false,
        can_combine_with_codediscount: data.can_combine_with_codediscount ?? false,
        max_uses: data.max_uses ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create discount code:', error)
      return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 })
    }

    return NextResponse.json({ discountCode }, { status: 201 })
  } catch (error) {
    console.error('Create discount code failed:', error)
    return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 })
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
      return NextResponse.json({ error: 'Discount code ID is required' }, { status: 400 })
    }

    const parsed = updateDiscountCodeSchema.safeParse(updateData)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const updatePayload: any = {}

    if (data.code !== undefined) {
      const sanitizedCode = sanitizeDiscountCode(data.code)
      if (!sanitizedCode) {
        return NextResponse.json(
          { error: 'Invalid discount code format' },
          { status: 400 }
        )
      }

      // Check if code already exists (excluding current record)
      const { data: existing } = await supabase
        .from('discount_codes')
        .select('id')
        .eq('code', sanitizedCode)
        .neq('id', id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: 'Discount code already exists' },
          { status: 400 }
        )
      }

      updatePayload.code = sanitizedCode
    }

    if (data.discount_type !== undefined) updatePayload.discount_type = data.discount_type
    if (data.discount_value !== undefined) updatePayload.discount_value = data.discount_value
    if (data.starts_at !== undefined) updatePayload.starts_at = data.starts_at
    if (data.expires_at !== undefined) updatePayload.expires_at = data.expires_at
    if (data.is_active !== undefined) updatePayload.is_active = data.is_active
    if (data.can_combine_with_productdiscount !== undefined) updatePayload.can_combine_with_productdiscount = data.can_combine_with_productdiscount
    if (data.can_combine_with_codediscount !== undefined) updatePayload.can_combine_with_codediscount = data.can_combine_with_codediscount
    if (data.max_uses !== undefined) updatePayload.max_uses = data.max_uses

    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update discount code:', error)
      return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 })
    }

    return NextResponse.json({ discountCode })
  } catch (error) {
    console.error('Update discount code failed:', error)
    return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  // IMPORTANT: This endpoint does SOFT DELETE (sets is_active = false) instead of hard delete
  // to preserve order history. We NEVER hard delete discount codes because:
  // 1. order_discounts table tracks which discount codes were used in each order
  // 2. If we hard delete, order_discounts.discount_code_id becomes NULL (via ON DELETE SET NULL)
  // 3. We lose the ability to see which discount code was applied to historical orders
  // 4. This breaks analytics and order history integrity
  // 
  // Soft delete preserves full discount code details while making them inactive.
  const { supabase, errorResponse } = await requireAdmin()
  if (!supabase) {
    return errorResponse!
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Discount code ID is required' }, { status: 400 })
    }

    // Verify the discount code exists
    const { data: existingCode, error: checkError } = await supabase
      .from('discount_codes')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingCode) {
      console.error('Discount code not found or check failed:', checkError)
      return NextResponse.json(
        { error: 'Discount code not found', details: checkError?.message },
        { status: 404 }
      )
    }

    // Soft delete: set is_active = false (preserves order_discounts history)
    // This way we can always see which discount code was applied to each order
    const { error, data } = await supabase
      .from('discount_codes')
      .update({ is_active: false })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Failed to deactivate discount code:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to deactivate discount code', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Deactivate discount code failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to deactivate discount code', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

