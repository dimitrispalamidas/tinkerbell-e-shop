import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createPublicRouteClient } from '@/lib/supabase/public-route-client'
import { enforceRateLimit } from '@/lib/utils/rate-limit'
import type { CatalogProduct } from '@/lib/types/catalog'

const CACHE_HEADER = 's-maxage=120, stale-while-revalidate=600'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const url = request.nextUrl
  const fallbackId = url.pathname.split('/').pop() ?? ''
  const id = context?.params?.id ?? fallbackId

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

  const product = data as CatalogProduct

  const response = NextResponse.json({
    product,
    variants: product.product_variants ?? [],
  })

  response.headers.set('Cache-Control', CACHE_HEADER)
  return response
}


