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

  console.log("🔵 [Callback] Started, code:", code ? "exists" : "missing")

  if (code) {
    const { createBrowserClient } = await import("@supabase/ssr")
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY!,
    )

    console.log("🔵 [Callback] Exchanging code for session...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.log("🔴 [Callback] Error exchanging code:", error.message)
    }

    if (!error && data?.user) {
      console.log("🟢 [Callback] User logged in:", data.user.email)

      // Check if profile exists
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, credits")
        .eq("id", data.user.id)
        .single()

      console.log("🔵 [Callback] Profile check:", profile ? `Found with ${profile.credits} credits` : "Not found")
      
      if (profileError) {
        console.log("🟡 [Callback] Profile error:", profileError.message)
      }

      // Only give credits to NEW users (no profile exists)
      if (!profile) {
        console.log("🟢 [Callback] New user! Giving 5 credits...")
        
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from("profiles")
          .upsert({ 
            id: data.user.id, 
            credits: 5 
          })

        if (updateError) {
          console.log("🔴 [Callback] Error updating credits:", updateError.message)
        } else {
          console.log("✅ [Callback] Successfully gave 5 credits!")
        }
      } else {
        console.log("⏭️ [Callback] Existing user with", profile.credits, "credits, skipping...")
      }
    }
  }

  console.log("🔵 [Callback] Redirecting to home...")
  // Redirect to home page after successful verification
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}