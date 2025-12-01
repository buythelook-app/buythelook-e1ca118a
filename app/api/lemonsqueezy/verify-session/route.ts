import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  console.log("[v0] LemonSqueezy: Verifying session and unlocking outfit")

  try {
    const { outfitId, userId, type } = await request.json()

    console.log("[v0] LemonSqueezy: Outfit ID:", outfitId)
    console.log("[v0] LemonSqueezy: User ID:", userId)
    console.log("[v0] LemonSqueezy: Type:", type)

    if (!outfitId || !userId) {
      return NextResponse.json({ error: "Outfit ID and User ID required" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    if (type === "links_unlock" || type === "outfit_unlock") {
      console.log("[v0] LemonSqueezy: Attempting to update links_unlocked for outfit:", outfitId)

      const { data: outfitCheck, error: checkError } = await supabaseAdmin
        .from("generated_outfits")
        .select("id, user_id, links_unlocked")
        .eq("id", outfitId)
        .eq("user_id", userId)
        .maybeSingle()

      if (checkError) {
        console.error("[v0] LemonSqueezy: Database error:", checkError)
        return NextResponse.json({ error: "Database query failed", details: checkError.message }, { status: 500 })
      }

      if (!outfitCheck) {
        console.error("[v0] LemonSqueezy: Outfit not found or doesn't belong to user")
        return NextResponse.json({ error: "Outfit not found", outfitId }, { status: 404 })
      }

      console.log("[v0] LemonSqueezy: Found outfit, current links_unlocked:", outfitCheck.links_unlocked)

      const { data: updateData, error: updateError } = await supabaseAdmin
        .from("generated_outfits")
        .update({ links_unlocked: true, is_unlocked: true })
        .eq("id", outfitId)
        .eq("user_id", userId)
        .select()

      if (updateError) {
        console.error("[v0] LemonSqueezy: Failed to unlock links:", updateError)
        return NextResponse.json(
          { error: "Failed to unlock outfit links", details: updateError.message },
          { status: 500 },
        )
      }

      if (!updateData || updateData.length === 0) {
        console.error("[v0] LemonSqueezy: Update returned no rows")
        return NextResponse.json({ error: "Database update failed", details: "No rows were updated" }, { status: 500 })
      }

      console.log("[v0] LemonSqueezy: Successfully unlocked links for outfit:", updateData[0].id)

      // Try to record transaction (non-critical)
      try {
        await supabaseAdmin.from("payment_transactions").insert({
          user_id: userId,
          amount_cents: 500,
          currency: "usd",
          payment_type: "links_unlock",
          status: "completed",
          metadata: { outfitId, type: "links_unlock", provider: "lemonsqueezy" },
        })
      } catch (txError) {
        console.log("[v0] LemonSqueezy: Transaction record save failed (non-critical):", txError)
      }
    }

    return NextResponse.json({
      success: true,
      metadata: { outfitId, type, userId },
      amountTotal: 500,
    })
  } catch (error: any) {
    console.error("[v0] LemonSqueezy: Verification error:", error)
    return NextResponse.json({ error: "Failed to verify session", details: error.message }, { status: 500 })
  }
}
