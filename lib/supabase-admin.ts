import { createClient } from "@supabase/supabase-js"

let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const SUPABASE_AUTH_URL = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL
    const SUPABASE_AUTH_SERVICE_KEY = process.env.SUPABASE_AUTH_SERVICE_ROLE_KEY

    if (!SUPABASE_AUTH_URL || !SUPABASE_AUTH_SERVICE_KEY) {
      throw new Error(
        "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_AUTH_URL and SUPABASE_AUTH_SERVICE_ROLE_KEY are set.",
      )
    }

    _supabaseAdmin = createClient(SUPABASE_AUTH_URL, SUPABASE_AUTH_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _supabaseAdmin
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseAdmin()
    return client[prop as keyof typeof client]
  },
})
