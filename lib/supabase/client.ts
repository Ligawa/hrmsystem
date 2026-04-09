import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null during build time if credentials are missing
  if (!url || !key) {
    if (typeof window === 'undefined') {
      console.warn('Supabase credentials not available during build time. This is expected for static generation.')
      return null
    }
    throw new Error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }

  return createBrowserClient(url, key)
}
