import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  console.log("[v0] Verify Credits: Starting verification")

  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log("[v0] Verify Credits: Session status:", session.payment_status)
    console.log("[v0] Verify Credits: Metadata:", session.metadata)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    const { userId, credits, type } = session.metadata || {}

    if (type !== "credits_purchase") {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 })
    }

    if (!userId || !credits) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const creditsToAdd = Number.parseInt(credits, 10)
    console.log("[v0] Verify Credits: Adding", creditsToAdd, "credits to user", userId)

    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin()

    // First, get current credits
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single()

    if (fetchError) {
      console.error("[v0] Verify Credits: Error fetching profile:", fetchError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    const currentCredits = profile?.credits || 0
    const newCredits = currentCredits + creditsToAdd

    console.log("[v0] Verify Credits: Current credits:", currentCredits, "-> New credits:", newCredits)

    // Update credits
    const { error: updateError } = await supabaseAdmin.from("profiles").update({ credits: newCredits }).eq("id", userId)

    if (updateError) {
      console.error("[v0] Verify Credits: Error updating credits:", updateError)
      return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
    }

    console.log("[v0] Verify Credits: Credits updated successfully!")

    return NextResponse.json({
      success: true,
      creditsAdded: creditsToAdd,
      newBalance: newCredits,
    })
  } catch (error: any) {
    console.error("[v0] Verify Credits: Error:", error.message)
    return NextResponse.json({ error: "Failed to verify payment", details: error.message }, { status: 500 })
  }
}
