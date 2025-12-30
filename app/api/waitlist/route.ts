import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!
const supabaseServiceKey = process.env.SUPABASE_AUTH_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, category = "mens_fashion" } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert into waitlist (upsert to avoid duplicates)
    const { data, error } = await supabase
      .from("waitlist")
      .upsert({ email: email.toLowerCase().trim(), category }, { onConflict: "email,category", ignoreDuplicates: true })
      .select()

    if (error) {
      console.error(" Waitlist insert error:", error)
      // Check if it's a duplicate
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "You're already on the waitlist!" })
      }
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Successfully joined the waitlist!" })
  } catch (error) {
    console.error(" Waitlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
