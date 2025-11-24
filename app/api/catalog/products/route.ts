import { NextResponse } from 'next/server'
import { createPublicRouteClient } from '@/lib/supabase/public-route-client'
import { enforceRateLimit } from '@/lib/utils/rate-limit'
import type { Category } from '@/lib/types/database'

// ✅ Cache 30 seconds - balance between performance and freshness
// Cache invalidation happens via revalidatePath in server actions
const CACHE_HEADER = 's-maxage=30, stale-while-revalidate=60'

export async function GET(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, 'catalog_products', {
    maxRequests: 120,
    windowMs: 60_000,
  })

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const supabase = createPublicRouteClient()
  const sanitizeSearchTerm = (value: string) =>
    value
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}\s\-_'’.]/gu, '')
      .trim()
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')
  const limitParam = url.searchParams.get('limit')

  const limit = limitParam ? Number(limitParam) : undefined

  if (limit !== undefined && (Number.isNaN(limit) || limit <= 0)) {
    return NextResponse.json(
      { error: 'Invalid limit parameter' },
      { status: 400 }
    )
  }

  let query = supabase
    .from('products')
    .select(
      `
        id,
        sku,
        price,
        status,
        is_active,
        archived_at,
        category_id,
        sizes,
        colors,
        images,
        name_el,
        name_en,
        description_el,
        description_en,
        created_at,
        updated_at,
        product_variants (
          id,
          product_id,
          size,
          color,
          stock,
          sold_count,
          created_at,
          updated_at
        ),
        categories:category_id (
          id,
          slug,
          type,
          name_el,
          name_en,
          description_el,
          description_en
        ),
        product_discounts (
          id,
          discount_type,
          discount_value,
          starts_at,
          ends_at,
          is_active,
          can_combine_with_codediscount
        )
      `
    )
    .eq('is_active', true)
    .in('status', ['active', 'sold_out'])

  if (category) {
    query = query.eq('category_id', category)
  } else if (type) {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .eq('type', type)

    if (categoriesError) {
      console.error('Failed to fetch categories for type filter', categoriesError)
      return NextResponse.json(
        { error: 'Unable to apply type filter' },
        { status: 500 }
      )
    }

    const typedCategories = (categories ?? []) as Category[]
    const categoryIds = typedCategories.map((cat) => cat.id).filter(Boolean) ?? []

    if (categoryIds.length === 0) {
      const response = NextResponse.json({ products: [] })
      response.headers.set('Cache-Control', CACHE_HEADER)
      return response
    }

    query = query.in('category_id', categoryIds)
  }

  if (search) {
    const sanitized = sanitizeSearchTerm(search)
    if (sanitized) {
      query = query.or(
        `name_el.ilike.%${sanitized}%,name_en.ilike.%${sanitized}%,description_el.ilike.%${sanitized}%,description_en.ilike.%${sanitized}%,sku.ilike.%${sanitized}%`
      )
    }
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  })

  if (error) {
    console.error('Failed to fetch catalog products', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }

  // Filter product_discounts to only include active, valid ones
  const now = new Date()
  const productsWithFilteredDiscounts = (data ?? []).map((product: any) => {
    if (product.product_discounts && Array.isArray(product.product_discounts)) {
      product.product_discounts = product.product_discounts.filter((discount: any) => {
        if (!discount.is_active) return false
        if (discount.starts_at && new Date(discount.starts_at) > now) return false
        if (discount.ends_at && new Date(discount.ends_at) < now) return false
        return true
      })
    }
    return product
  })

  const response = NextResponse.json({ products: productsWithFilteredDiscounts })
  response.headers.set('Cache-Control', CACHE_HEADER)
  return response
}


