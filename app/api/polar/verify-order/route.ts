import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, userId, type, credits, outfitId } = await request.json()

    console.log(" Polar Verify Order: Processing with session token")
    console.log(" Polar Verify Order: Type:", type)

    if (!sessionToken || !userId) {
      return NextResponse.json({ success: false, error: "Session token and User ID required" }, { status: 400 })
    }

    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin()

    if (type === "credits") {
      const creditsToAdd = Number.parseInt(credits, 10)
      console.log(" Polar Verify Order: Adding", creditsToAdd, "credits to user", userId)

      const { data: existingTransaction } = await supabaseAdmin
        .from("payment_transactions")
        .select("id")
        .eq("external_id", sessionToken)
        .eq("user_id", userId)
        .single()

      if (existingTransaction) {
        console.log(" Polar Verify Order: Checkout already processed, preventing duplicate")
        // Get current balance and return it
        const { data: profile } = await supabaseAdmin.from("profiles").select("credits").eq("id", userId).single()

        return NextResponse.json({
          success: true,
          creditsAdded: creditsToAdd,
          newBalance: profile?.credits || 0,
          duplicate: true,
        })
      }

      // Get current credits
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single()

      if (fetchError) {
        console.error(" Polar Verify Order: Error fetching profile:", fetchError)
        return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 })
      }

      const currentCredits = profile?.credits || 0
      const newCredits = currentCredits + creditsToAdd

      console.log(" Polar Verify Order: Current credits:", currentCredits, "-> New credits:", newCredits)

      // Update credits
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", userId)

      if (updateError) {
        console.error(" Polar Verify Order: Error updating credits:", updateError)
        return NextResponse.json({ success: false, error: "Failed to update credits" }, { status: 500 })
      }

      // Record transaction
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        external_id: sessionToken,
        provider: "polar",
        amount: creditsToAdd * 5, // Approximate amount in cents
        currency: "usd",
        status: "completed",
        type: "credits",
        metadata: { credits: creditsToAdd, sessionToken: sessionToken },
      })

      console.log(" Polar Verify Order: Credits updated successfully!")

      return NextResponse.json({
        success: true,
        creditsAdded: creditsToAdd,
        newBalance: newCredits,
      })
    }

    if (type === "links_unlock") {
      console.log(" Polar Verify Order: Processing links unlock for outfit:", outfitId)

      const { data: existingTransaction } = await supabaseAdmin
        .from("payment_transactions")
        .select("id")
        .eq("external_id", sessionToken)
        .eq("user_id", userId)
        .single()

      if (existingTransaction) {
        console.log(" Polar Verify Order: Checkout already processed, preventing duplicate")
        return NextResponse.json({ success: true, duplicate: true })
      }

      // Unlock shopping links for outfit
      const { error: unlockError } = await supabaseAdmin
        .from("generated_outfits")
        .update({ links_unlocked: true })
        .eq("id", outfitId)
        .eq("user_id", userId)

      if (unlockError) {
        console.error(" Polar Verify Order: Error unlocking links:", unlockError)
        return NextResponse.json({ success: false, error: "Failed to unlock links" }, { status: 500 })
      }

      // Record transaction
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        external_id: sessionToken,
        provider: "polar",
        amount: 500, // $5.00 in cents
        currency: "usd",
        status: "completed",
        type: "links_unlock",
        metadata: { outfitId: outfitId, sessionToken: sessionToken },
      })

      console.log(" Polar Verify Order: Links unlocked successfully")
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid order type" }, { status: 400 })
  } catch (error: any) {
    console.error(" Polar Verify Order: Error:", error.message)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to verify payment" },
      { status: 500 },
    )
  }
}
