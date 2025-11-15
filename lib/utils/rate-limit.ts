import { NextResponse } from 'next/server'

type RateLimitEntry = {
  count: number
  expiresAt: number
}

declare global {
  var __CATALOG_RATE_LIMIT_MAP: Map<string, RateLimitEntry> | undefined
}

const rateLimitMap =
  globalThis.__CATALOG_RATE_LIMIT_MAP ?? new Map<string, RateLimitEntry>()

globalThis.__CATALOG_RATE_LIMIT_MAP = rateLimitMap

function getClientIdentifier(request: Request) {
  const trustedHeaders = [
    'x-real-ip',
    'x-vercel-forwarded-for',
    'x-forwarded-for',
  ]

  for (const headerName of trustedHeaders) {
    const value = request.headers.get(headerName)
    if (value) {
      return value.split(',')[0]?.trim() ?? 'anonymous'
    }
  }

  return 'anonymous'
}

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export function enforceRateLimit(
  request: Request,
  bucket: string,
  options: RateLimitOptions
) {
  const identifier = getClientIdentifier(request)
  const key = `${bucket}:${identifier}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(key, {
      count: 1,
      expiresAt: now + options.windowMs,
    })
    return null
  }

  if (entry.count >= options.maxRequests) {
    const retryAfter = Math.max(
      1,
      Math.ceil((entry.expiresAt - now) / 1000)
    ).toString()

    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter,
        },
      }
    )
  }

  entry.count += 1
  rateLimitMap.set(key, entry)

  return null
}


