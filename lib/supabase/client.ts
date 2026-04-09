import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null during build/SSR time if credentials are missing
  if (!url || !key) {
    if (typeof window === 'undefined') {
      console.warn('[v0] Supabase credentials not available during build/SSR. Pages must be marked as dynamic.')
      return null as any
    }
    throw new Error('Missing Supabase credentials in browser. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }

  return createBrowserClient(url, key)
}
