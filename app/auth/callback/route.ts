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
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log(" Auth callback received:")
  console.log(" Code:", code ? "✓ Present" : "✗ Missing")
  console.log(" Request URL:", request.url)
  console.log(" Error:", error || "None")
  console.log(" Error Description:", errorDescription || "None")
  console.log(" Origin:", requestUrl.origin)
  console.log(" Supabase Auth URL:", process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL)

  if (error) {
    console.log(" ✗ OAuth Error:", error, "-", errorDescription)
    return NextResponse.redirect(
      new URL(`/?error=${error}&error_description=${encodeURIComponent(errorDescription || "")}`, requestUrl.origin),
    )
  }

  if (code) {
    try {
      // Create a client-side supabase instance for the auth exchange
      const { createBrowserClient } = await import("@supabase/ssr")
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY!,
      )

      console.log(" Attempting to exchange code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.log(" ✗ Exchange Error:", exchangeError.message)
        console.log(" ✗ Exchange Error Status:", exchangeError.status)
        console.log(" ✗ Exchange Error Details:", exchangeError)
        return NextResponse.redirect(
          new URL(
            `/?error=exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}`,
            requestUrl.origin,
          ),
        )
      }

      if (!data?.user) {
        console.log(" ✗ No user returned from exchange")
        return NextResponse.redirect(new URL("/?error=no_user", requestUrl.origin))
      }

      console.log(" ✓ Successfully exchanged code for session")
      console.log(" User ID:", data.user.id)
      console.log(" User Email:", data.user.email)

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

        // If no completed payments, this is a new user - give them starting credits
        if (!payments || payments.length === 0) {
          const DEFAULT_STARTING_CREDITS = 3

          await supabaseAdmin.from("profiles").update({ credits: DEFAULT_STARTING_CREDITS }).eq("id", data.user.id)

          console.log(` Gave ${DEFAULT_STARTING_CREDITS} starting credits to new Google user: ${data.user.email}`)
        }
      }
    } catch (err) {
      console.log(" ✗ Unexpected error in auth callback:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      return NextResponse.redirect(
        new URL(`/?error=callback_error&error_description=${encodeURIComponent(errorMessage)}`, requestUrl.origin),
      )
    }
  } else {
    console.log(" ✗ No code provided to callback")
  }

  // Redirect to home page after successful verification
  console.log(" Redirecting to home page")
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
