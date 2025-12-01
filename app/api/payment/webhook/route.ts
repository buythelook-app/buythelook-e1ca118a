import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  const stripe = getStripe()
  const supabaseAdmin = getSupabaseAdmin()

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set")
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`[v0] Webhook signature verification failed:`, err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.log("[v0] Webhook received:", event.type, event.id)

  // Check if already processed
  const { data: existingEvent } = await supabaseAdmin
    .from("stripe_webhooks")
    .select("id")
    .eq("event_id", event.id)
    .single()

  if (existingEvent) {
    console.log("[v0] Webhook already processed:", event.id)
    return NextResponse.json({ received: true })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      console.log("[v0] Checkout completed:", session.id)

      const metadata = session.metadata || {}
      const type = metadata.type
      const userId = metadata.userId
      const outfitId = metadata.outfitId
      const credits = metadata.credits ? Number.parseInt(metadata.credits) : 0

      if (type === "links_unlock" && outfitId) {
        // Unlock shopping links for outfit
        const { error } = await supabaseAdmin
          .from("generated_outfits")
          .update({ links_unlocked: true })
          .eq("id", outfitId)
          .eq("user_id", userId)

        if (error) {
          console.error("[v0] Failed to unlock links:", error)
        } else {
          console.log("[v0] Shopping links unlocked for outfit:", outfitId)
        }
      } else if (type === "credits" && credits > 0) {
        // Add credits to user profile
        const { data: profile } = await supabaseAdmin.from("profiles").select("credits").eq("id", userId).single()

        if (profile) {
          const newCredits = (profile.credits || 0) + credits
          await supabaseAdmin.from("profiles").update({ credits: newCredits }).eq("id", userId)
          console.log("[v0] Added", credits, "credits to user:", userId)
        }
      }

      // Record transaction
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount: session.amount_total! / 100,
        status: "completed",
        type: type,
        outfit_id: outfitId || null,
        credits_purchased: credits || null,
      })

      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("[v0] Payment failed:", paymentIntent.id)

      await supabaseAdmin
        .from("payment_transactions")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id)

      break
    }
  }

  // Log webhook
  await supabaseAdmin.from("stripe_webhooks").insert({
    event_id: event.id,
    event_type: event.type,
    payment_intent_id: (event.data.object as any).payment_intent || null,
    session_id: (event.data.object as any).id || null,
    status: "processed",
    metadata: event.data.object,
  })

  return NextResponse.json({ received: true })
}
