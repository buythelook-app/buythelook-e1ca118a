import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
  process.env.SUPABASE_AUTH_SERVICE_ROLE_KEY!,
)

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code)

      if (error) {
        console.error(" OAuth exchange error:", error)
        return NextResponse.redirect(new URL("/?error=oauth_failed", requestUrl.origin))
      }

  
    } catch (error) {
      console.error(" Callback error:", error)
      return NextResponse.redirect(new URL("/?error=callback_failed", requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
