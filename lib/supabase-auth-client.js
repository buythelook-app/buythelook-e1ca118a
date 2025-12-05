import { createClient } from "@supabase/supabase-js"

const SUPABASE_AUTH_URL = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL
const SUPABASE_AUTH_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY

console.log(" Supabase Auth: Initializing client")

if (!SUPABASE_AUTH_URL || !SUPABASE_AUTH_ANON_KEY) {
  console.warn(" Supabase Auth: Missing environment variables. Please add them in the Vars sidebar.")
}

// Only create client if keys exist (or use placeholder to prevent crash before config)
export const supabaseAuth =
  SUPABASE_AUTH_URL && SUPABASE_AUTH_ANON_KEY
    ? createClient(SUPABASE_AUTH_URL, SUPABASE_AUTH_ANON_KEY)
    : createClient("https://placeholder.supabase.co", "placeholder")

console.log("[v0] Supabase Auth: Clients created successfully")
