import { NextResponse } from 'next/server'
import { createPublicRouteClient } from '@/lib/supabase/public-route-client'
import { enforceRateLimit } from '@/lib/utils/rate-limit'

// ✅ Cache 30 seconds - categories don't change often
const CACHE_HEADER = 's-maxage=30, stale-while-revalidate=60'

export async function GET(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, 'catalog_categories', {
    maxRequests: 120,
    windowMs: 60_000,
  })

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const supabase = createPublicRouteClient()

  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        id,
        slug,
        type,
        parent_id,
        name_el,
        name_en,
        description_el,
        description_en,
        created_at,
        updated_at
      `
    )
    .order('type', { ascending: true })
    .order('name_el', { ascending: true })

  if (error) {
    console.error('Failed to fetch categories', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }

  const response = NextResponse.json({ categories: data ?? [] })
  response.headers.set('Cache-Control', CACHE_HEADER)
  // Vercel handles compression automatically
  return response
}


