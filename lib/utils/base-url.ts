import { headers } from 'next/headers'

const FALLBACK_URL = 'http://localhost:3000'

export async function getRequestBaseUrl() {
  const explicit =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL

  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const headerList = await headers()
  const host = headerList.get('host')

  if (!host) {
    return FALLBACK_URL
  }

  const isLocalhost = host.includes('localhost') || host.startsWith('127.0.0.1')
  const protocol = isLocalhost ? 'http' : 'https'

  return `${protocol}://${host}`
}


