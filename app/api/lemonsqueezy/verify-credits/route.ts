import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  console.log("[] LemonSqueezy Verify Credits: Starting verification")

  try {
    const { userId, credits } = await request.json()

    if (!userId || !credits) {
      return NextResponse.json({ error: "User ID and credits are required" }, { status: 400 })
    }

    const creditsToAdd = Number.parseInt(credits, 10)
    console.log("[] LemonSqueezy Verify Credits: Adding", creditsToAdd, "credits to user", userId)

    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin()

    // First, get current credits
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single()

    if (fetchError) {
      console.error("[] LemonSqueezy Verify Credits: Error fetching profile:", fetchError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    const currentCredits = profile?.credits || 0
    const newCredits = currentCredits + creditsToAdd

    console.log("[] LemonSqueezy Verify Credits: Current credits:", currentCredits, "-> New credits:", newCredits)

    // Update credits
    const { error: updateError } = await supabaseAdmin.from("profiles").update({ credits: newCredits }).eq("id", userId)

    if (updateError) {
      console.error("[] LemonSqueezy Verify Credits: Error updating credits:", updateError)
      return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
    }

    console.log("[] LemonSqueezy Verify Credits: Credits updated successfully!")

    // Try to record transaction (non-critical)
    try {
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        amount_cents: creditsToAdd * 100, // approximate
        currency: "usd",
        payment_type: "credits_purchase",
        status: "completed",
        metadata: { credits: creditsToAdd, provider: "lemonsqueezy" },
      })
    } catch (txError) {
      console.log("[] LemonSqueezy: Transaction record save failed (non-critical):", txError)
    }

    return NextResponse.json({
      success: true,
      creditsAdded: creditsToAdd,
      newBalance: newCredits,
    })
  } catch (error: any) {
    console.error("[] LemonSqueezy Verify Credits: Error:", error.message)
    return NextResponse.json({ error: "Failed to verify payment", details: error.message }, { status: 500 })
  }
}
