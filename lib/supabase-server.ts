import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  const SUPABASE_AUTH_URL = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL
  const SUPABASE_AUTH_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY

  if (!SUPABASE_AUTH_URL || !SUPABASE_AUTH_ANON_KEY) {
    throw new Error("Missing Supabase Auth environment variables")
  }

  return createServerClient(SUPABASE_AUTH_URL, SUPABASE_AUTH_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Server component, cookie setting may fail
        }
      },
    },
  })
}
