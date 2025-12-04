import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role to update credits
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
  process.env.SUPABASE_AUTH_SERVICE_ROLE_KEY!,
)

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[AUTH CALLBACK] Started - Code exists:", !!code)

  if (code) {
    const { createBrowserClient } = await import("@supabase/ssr")
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY!,
    )

    console.log("[AUTH CALLBACK] Exchanging code for session...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[AUTH CALLBACK] Exchange error:", error.message)
      return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
    }

    if (data?.user) {
      console.log("[AUTH CALLBACK] User authenticated:", data.user.email)

      // Check if profile exists
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, credits")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.log("[AUTH CALLBACK] Profile error (might be new user):", profileError.message)
      }

      console.log("[AUTH CALLBACK] Profile status:", profile ? `Exists with ${profile.credits} credits` : "Does not exist (NEW USER)")

      // Only give credits to NEW users (no profile exists)
      if (!profile) {
        console.log("[AUTH CALLBACK] NEW USER DETECTED - Creating profile with 5 credits...")
        
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .upsert({ 
            id: data.user.id, 
            credits: 5 
          })

        if (updateError) {
          console.error("[AUTH CALLBACK] Failed to give credits:", updateError.message)
        } else {
          console.log("[AUTH CALLBACK] SUCCESS - Gave 5 credits to:", data.user.email)
        }
      } else {
        console.log("[AUTH CALLBACK] EXISTING USER - Has", profile.credits, "credits already")
      }
    }
  }

  console.log("[AUTH CALLBACK] Redirecting to home...")
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}