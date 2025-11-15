import { createClient } from '@supabase/supabase-js'

declare global {
  var __PUBLIC_SUPABASE_CLIENT:
    | ReturnType<typeof createClient>
    | undefined
}

export function createPublicRouteClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  if (!globalThis.__PUBLIC_SUPABASE_CLIENT) {
    globalThis.__PUBLIC_SUPABASE_CLIENT = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }

  return globalThis.__PUBLIC_SUPABASE_CLIENT
}


