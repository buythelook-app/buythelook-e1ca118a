import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { STRIPE_CONFIG } from "@/lib/stripe-config"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://kzitfiqhgdhshavaivyg.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aXRmaXFoZ2Roc2hhdmFpdnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzUzNzUsImV4cCI6MjA3MzYxMTM3NX0.4J6IJYGWO66qGuPcR8tv-qRo88edJPJ-vuzdQvbg_Jc"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  console.log("[v0] Payment: Creating Stripe checkout session")

  try {
    const { amount, outfitId, description, type, userId } = await request.json()

    console.log("[v0] Payment: Amount:", amount, "cents ($" + amount / 100 + ")")
    console.log("[v0] Payment: Type:", type || "outfit_unlock")
    console.log("[v0] Payment: Outfit ID:", outfitId)
    console.log("[v0] Payment: User ID:", userId)

    if (!userId) {
      console.error("[v0] Payment: Missing user ID")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!outfitId && type === "outfit_unlock") {
      console.error("[v0] Payment: Missing outfit ID for outfit unlock")
      return NextResponse.json({ error: "Outfit ID is required for unlock" }, { status: 400 })
    }

    const lineItems =
      type === "outfit_unlock" && STRIPE_CONFIG.prices.outfitUnlock
        ? [
            {
              price: STRIPE_CONFIG.prices.outfitUnlock,
              quantity: 1,
            },
          ]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: description || "Shopping Links Access",
                  description: outfitId ? `Unlock shopping links for outfit ${outfitId}` : "Purchase credits",
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ]

    console.log("[v0] Payment: Creating Stripe session with line items:", JSON.stringify(lineItems, null, 2))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://buythelook.pdfwhisperer.xyz"}/payment/success?session_id={CHECKOUT_SESSION_ID}&outfit_id=${outfitId || ""}&type=${type || "outfit_unlock"}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://buythelook.pdfwhisperer.xyz"}/outfits`,
      metadata: {
        outfitId: outfitId || "",
        type: type || "outfit_unlock",
        userId: userId || "",
      },
    })

    console.log("[v0] Payment: Stripe session created:", session.id)

    try {
      const { error: insertError } = await supabase.from("payment_transactions").insert({
        user_id: userId,
        stripe_session_id: session.id,
        amount_cents: amount,
        currency: "usd",
        payment_type: type || "outfit_unlock",
        metadata: { outfitId, type },
        status: "pending",
      })

      if (insertError) {
        console.warn("[v0] Payment: Could not save transaction to DB (table may not exist):", insertError.message)
      } else {
        console.log("[v0] Payment: Transaction saved to database")
      }
    } catch (dbError: any) {
      console.warn("[v0] Payment: Database insert failed, continuing anyway:", dbError.message)
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error("[v0] Payment: Error creating checkout:", error)
    console.error("[v0] Payment: Error details:", error.message)
    console.error("[v0] Payment: Error stack:", error.stack)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
