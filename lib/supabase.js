import { createClient } from "@supabase/supabase-js"

let supabaseClient = null

export const supabase = (() => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Only warn at runtime, not build time
    if (typeof window !== "undefined") {
      console.warn("[v0] Supabase Products: Missing environment variables.")
    }
    supabaseClient = createClient("https://placeholder.supabase.co", "placeholder")
  } else {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
})()
