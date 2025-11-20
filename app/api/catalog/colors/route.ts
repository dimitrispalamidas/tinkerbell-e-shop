import { NextResponse } from 'next/server'
import { createPublicRouteClient } from '@/lib/supabase/public-route-client'
import { enforceRateLimit } from '@/lib/utils/rate-limit'

// ✅ No cache - always fresh colors
const CACHE_HEADER = 'no-store, no-cache, must-revalidate'

export async function GET(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, 'catalog_colors', {
    maxRequests: 120,
    windowMs: 60_000,
  })

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const supabase = createPublicRouteClient()

  const { data, error } = await supabase
    .from('colors')
    .select(
      `
        id,
        name_el,
        name_en,
        hex_value,
        is_active,
        created_at,
        updated_at
      `
    )
    .eq('is_active', true)
    .order('name_el', { ascending: true })

  if (error) {
    console.error('Failed to fetch colors', error)
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    )
  }

  const response = NextResponse.json({ colors: data ?? [] })
  response.headers.set('Cache-Control', CACHE_HEADER)
  return response
}


