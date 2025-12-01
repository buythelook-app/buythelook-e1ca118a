import { NextResponse } from "next/server"
import { supabaseAuth } from "@/lib/supabase-auth-client"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    await supabaseAuth.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page after successful verification
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
