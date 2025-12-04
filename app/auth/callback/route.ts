import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role to ensure we can update credits
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
  process.env.SUPABASE_AUTH_SERVICE_ROLE_KEY!,
)

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Create a client-side supabase instance for the auth exchange
    const { createBrowserClient } = await import("@supabase/ssr")
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY!,
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Check if this user has a profile with credits
      // If they have 0 credits and no payment history, give them 5 starting credits
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, credits")
        .eq("id", data.user.id)
        .single()

      if (profile && profile.credits === 0) {
        // Check if they have any payment history
        const { data: payments } = await supabaseAdmin
          .from("payment_transactions")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("status", "completed")
          .limit(1)

        // If no completed payments, this is a new user - give them 5 credits
        if (!payments || payments.length === 0) {
          await supabaseAdmin.from("profiles").update({ credits: 5 }).eq("id", data.user.id)

          console.log(`[v0] Gave 5 starting credits to new Google user: ${data.user.email}`)
        }
      }
    }
  }

  // Redirect to home page after successful verification
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
