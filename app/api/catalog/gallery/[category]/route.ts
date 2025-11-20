import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createPublicRouteClient } from '@/lib/supabase/public-route-client'
import { enforceRateLimit } from '@/lib/utils/rate-limit'
import type { GalleryItem } from '@/lib/types/database'

// ✅ No cache - always fresh gallery items
const CACHE_HEADER = 'no-store, no-cache, must-revalidate'
const ALLOWED_CATEGORIES = new Set(['baptism', 'decoration'])

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ category: string }> }
) {
  const rateLimitResponse = enforceRateLimit(request, 'catalog_gallery', {
    maxRequests: 120,
    windowMs: 60_000,
  })

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const params = await context.params
  const fallbackCategory = request.nextUrl.pathname.split('/').pop() ?? ''
  const category = params?.category ?? fallbackCategory

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 })
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createPublicRouteClient()

  const { data, error } = await supabase
    .from('gallery_items')
    .select(
      `
        id,
        category,
        image,
        display_order,
        is_active,
        created_at,
        updated_at
      `
    )
    .eq('is_active', true)
    .eq('category', category)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch gallery items', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }

  const items = (data ?? []) as GalleryItem[]
  const photos = items.map((item) => item.image).filter(Boolean)

  const response = NextResponse.json({ photos })
  response.headers.set('Cache-Control', CACHE_HEADER)
  return response
}


