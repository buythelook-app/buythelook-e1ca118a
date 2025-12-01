import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  console.log("[v0] Payment: Verifying Stripe session")

  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log("[v0] Payment: Session status:", session.payment_status)
    console.log("[v0] Payment: Metadata:", session.metadata)

    if (session.payment_status === "paid") {
      const metadata = session.metadata || {}

      if (metadata.type === "links_unlock" && metadata.outfitId) {
        console.log("[v0] Payment: Attempting to update links_unlocked for outfit:", metadata.outfitId)
        console.log("[v0] Payment: User ID from metadata:", metadata.userId)

        const { data: outfitCheck, error: checkError } = await supabaseAdmin
          .from("generated_outfits")
          .select("id, user_id, links_unlocked")
          .eq("id", metadata.outfitId)
          .eq("user_id", metadata.userId) // Verify ownership
          .maybeSingle()

        console.log("[v0] Payment: Outfit check result:", outfitCheck)
        console.log("[v0] Payment: Check error:", checkError)

        if (checkError) {
          console.error("[v0] Payment: Database error:", checkError)
          return NextResponse.json({ error: "Database query failed", details: checkError.message }, { status: 500 })
        }

        if (!outfitCheck) {
          console.error("[v0] Payment: Outfit not found or doesn't belong to user")
          return NextResponse.json({ error: "Outfit not found", outfitId: metadata.outfitId }, { status: 404 })
        }

        console.log("[v0] Payment: Found outfit, current links_unlocked:", outfitCheck.links_unlocked)

        const { data: updateData, error: updateError } = await supabaseAdmin
          .from("generated_outfits")
          .update({ links_unlocked: true })
          .eq("id", metadata.outfitId)
          .eq("user_id", metadata.userId) // Double-check ownership
          .select()

        console.log("[v0] Payment: Update result:", updateData)
        console.log("[v0] Payment: Update error:", updateError)

        if (updateError) {
          console.error("[v0] Payment: Failed to unlock links:", updateError)
          return NextResponse.json(
            { error: "Failed to unlock outfit links", details: updateError.message },
            { status: 500 },
          )
        }

        if (!updateData || updateData.length === 0) {
          console.error("[v0] Payment: Update returned no rows")
          return NextResponse.json(
            {
              error: "Database update failed",
              details: "No rows were updated",
            },
            { status: 500 },
          )
        }

        console.log("[v0] Payment: Successfully unlocked links for outfit:", updateData[0].id)

        try {
          await supabaseAdmin.from("payment_transactions").insert({
            user_id: metadata.userId,
            stripe_session_id: sessionId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_cents: session.amount_total || 500,
            currency: session.currency || "usd",
            status: "completed",
            metadata: { outfitId: metadata.outfitId, type: "links_unlock" },
          })
        } catch (txError) {
          console.log("[v0] Payment: Transaction record save failed (non-critical):", txError)
        }
      }

      if (metadata.type === "credits") {
        try {
          await supabaseAdmin
            .from("payment_transactions")
            .update({
              status: "completed",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("stripe_session_id", sessionId)
        } catch (txError) {
          console.log("[v0] Payment: Transaction table update skipped")
        }
      }

      return NextResponse.json({
        success: true,
        metadata: session.metadata,
        amountTotal: session.amount_total,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not completed",
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Payment: Verification error:", error)
    return NextResponse.json({ error: "Failed to verify session", details: error.message }, { status: 500 })
  }
}
