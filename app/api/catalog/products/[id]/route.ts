import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createPublicRouteClient } from '@/lib/supabase/public-route-client'
import { enforceRateLimit } from '@/lib/utils/rate-limit'
import type { CatalogProduct } from '@/lib/types/catalog'

// ✅ Cache 30 seconds - cache invalidation via revalidatePath in server actions
const CACHE_HEADER = 's-maxage=30, stale-while-revalidate=60'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const url = request.nextUrl
  const fallbackId = url.pathname.split('/').pop() ?? ''
  const id = params?.id ?? fallbackId

  if (!id) {
    return NextResponse.json(
      { error: 'Product id is required' },
      { status: 400 }
    )
  }

  const rateLimitResponse = enforceRateLimit(request, 'catalog_product_detail', {
    maxRequests: 120,
    windowMs: 60_000,
  })

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const supabase = createPublicRouteClient()

  const { data, error } = await supabase
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
    .eq('id', id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch product detail', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Filter product_discounts to only include active, valid ones
  const now = new Date()
  const product = data as CatalogProduct & { product_discounts?: any[] }
  if (product.product_discounts && Array.isArray(product.product_discounts)) {
    product.product_discounts = product.product_discounts.filter((discount: any) => {
      if (!discount.is_active) return false
      if (discount.starts_at && new Date(discount.starts_at) > now) return false
      if (discount.ends_at && new Date(discount.ends_at) < now) return false
      return true
    })
  }

  const response = NextResponse.json({
    product,
    variants: product.product_variants ?? [],
  })

  response.headers.set('Cache-Control', CACHE_HEADER)
  return response
}


