import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  console.log("[v0] Unlock Links with Credit: Starting process")

  try {
    const { outfitId, userId } = await request.json()

    console.log("[v0] Unlock Links with Credit: Outfit ID:", outfitId)
    console.log("[v0] Unlock Links with Credit: User ID:", userId)

    if (!userId || !outfitId) {
      return NextResponse.json({ error: "User ID and Outfit ID are required" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get current user credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("[v0] Unlock Links with Credit: Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    const currentCredits = profile?.credits || 0
    console.log("[v0] Unlock Links with Credit: Current credits:", currentCredits)

    if (currentCredits < 1) {
      console.log("[v0] Unlock Links with Credit: Insufficient credits")
      return NextResponse.json({ error: "Insufficient credits. You need at least 1 credit." }, { status: 400 })
    }

    // Check if outfit belongs to user
    const { data: outfit, error: outfitError } = await supabaseAdmin
      .from("generated_outfits")
      .select("id, links_unlocked")
      .eq("id", outfitId)
      .eq("user_id", userId)
      .single()

    if (outfitError || !outfit) {
      console.error("[v0] Unlock Links with Credit: Outfit not found or access denied")
      return NextResponse.json({ error: "Outfit not found or access denied" }, { status: 404 })
    }

    if (outfit.links_unlocked) {
      console.log("[v0] Unlock Links with Credit: Links already unlocked")
      return NextResponse.json({ error: "Shopping links are already unlocked for this outfit" }, { status: 400 })
    }

    // Deduct 1 credit
    const newBalance = currentCredits - 1
    console.log("[v0] Unlock Links with Credit: Deducting 1 credit. New balance:", newBalance)

    const { error: updateCreditsError } = await supabaseAdmin
      .from("profiles")
      .update({ credits: newBalance })
      .eq("id", userId)

    if (updateCreditsError) {
      console.error("[v0] Unlock Links with Credit: Error updating credits:", updateCreditsError)
      return NextResponse.json({ error: "Failed to deduct credit" }, { status: 500 })
    }

    // Unlock shopping links
    const { error: unlockError } = await supabaseAdmin
      .from("generated_outfits")
      .update({ links_unlocked: true })
      .eq("id", outfitId)
      .eq("user_id", userId)

    if (unlockError) {
      console.error("[v0] Unlock Links with Credit: Error unlocking links:", unlockError)

      // Rollback credit deduction
      await supabaseAdmin.from("profiles").update({ credits: currentCredits }).eq("id", userId)

      return NextResponse.json({ error: "Failed to unlock shopping links" }, { status: 500 })
    }

    // Record transaction for audit
    await supabaseAdmin.from("payment_transactions").insert({
      user_id: userId,
      external_id: `credit_unlock_${outfitId}_${Date.now()}`,
      provider: "credit",
      amount: 0, // No money transaction, just credit
      currency: "usd",
      status: "completed",
      type: "links_unlock",
      metadata: {
        outfitId: outfitId,
        creditUsed: 1,
        previousBalance: currentCredits,
        newBalance: newBalance,
      },
    })

    console.log("[v0] Unlock Links with Credit: Success! New balance:", newBalance)

    return NextResponse.json({
      success: true,
      newBalance: newBalance,
      message: "Shopping links unlocked successfully",
    })
  } catch (error: any) {
    console.error("[v0] Unlock Links with Credit: Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 })
  }
}
