import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  const secret = process.env.POLAR_WEBHOOK_SECRET
  if (!secret) {
    console.error("[v0] Polar Webhook: POLAR_WEBHOOK_SECRET not configured")
    return false
  }

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest("hex")

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-polar-signature") || ""

    console.log("[v0] Polar Webhook: Received webhook")
    console.log("[v0] Polar Webhook: Body:", body)

    // Verify signature
    const isValid = await verifyWebhookSignature(body, signature)
    if (!isValid) {
      console.error("[v0] Polar Webhook: Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("[v0] Polar Webhook: Event type:", event.type)
    console.log("[v0] Polar Webhook: Event data:", JSON.stringify(event.data, null, 2))

    const supabaseAdmin = getSupabaseAdmin()

    // Check if already processed (idempotency)
    const { data: existingEvent } = await supabaseAdmin
      .from("polar_webhooks")
      .select("id")
      .eq("event_id", event.id)
      .single()

    if (existingEvent) {
      console.log("[v0] Polar Webhook: Event already processed:", event.id)
      return NextResponse.json({ received: true })
    }

    // Handle order.created event
    if (event.type === "order.created") {
      const order = event.data
      console.log("[v0] Polar Webhook: Processing order:", order.id)
      console.log("[v0] Polar Webhook: Customer data:", JSON.stringify(order.customer, null, 2))
      console.log("[v0] Polar Webhook: Metadata:", JSON.stringify(order.metadata, null, 2))

      const userId = order.customer?.external_id
      const metadata = order.metadata || {}

      console.log("[v0] Polar Webhook: Extracted user ID:", userId)

      if (!userId) {
        console.error("[v0] Polar Webhook: No user ID found in customer external_id")
        return NextResponse.json({ error: "No user ID" }, { status: 400 })
      }

      // Handle credits purchase
      if (metadata.type === "credits") {
        const creditsString = metadata.credits
        const credits = creditsString ? Number.parseInt(creditsString) : 0

        console.log("[v0] Polar Webhook: Credits purchase detected")
        console.log("[v0] Polar Webhook: Credits string:", creditsString)
        console.log("[v0] Polar Webhook: Credits parsed:", credits)

        if (credits > 0) {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("credits, id, email")
            .eq("id", userId)
            .single()

          console.log("[v0] Polar Webhook: Profile fetch error:", profileError)
          console.log("[v0] Polar Webhook: Current profile:", JSON.stringify(profile, null, 2))

          if (profile) {
            const currentCredits = profile.credits || 0
            const newCredits = currentCredits + credits

            console.log("[v0] Polar Webhook: Current balance:", currentCredits)
            console.log("[v0] Polar Webhook: Adding credits:", credits)
            console.log("[v0] Polar Webhook: New balance will be:", newCredits)

            const { data: updateData, error: updateError } = await supabaseAdmin
              .from("profiles")
              .update({ credits: newCredits })
              .eq("id", userId)
              .select()

            if (updateError) {
              console.error("[v0] Polar Webhook: Failed to add credits - Error:", updateError)
            } else {
              console.log("[v0] Polar Webhook: Credits updated successfully!")
              console.log("[v0] Polar Webhook: Updated profile:", JSON.stringify(updateData, null, 2))
            }
          } else {
            console.error("[v0] Polar Webhook: Profile not found for user:", userId)
          }
        }
      }

      // Handle shopping links unlock
      if (metadata.type === "links_unlock") {
        const outfitId = metadata.outfit_id

        console.log("[v0] Polar Webhook: Links unlock detected for outfit:", outfitId)

        if (outfitId) {
          const { data: updateData, error } = await supabaseAdmin
            .from("generated_outfits")
            .update({ links_unlocked: true })
            .eq("id", outfitId)
            .eq("user_id", userId)
            .select()

          if (error) {
            console.error("[v0] Polar Webhook: Failed to unlock links:", error)
          } else {
            console.log("[v0] Polar Webhook: Links unlocked successfully!")
            console.log("[v0] Polar Webhook: Updated outfit:", JSON.stringify(updateData, null, 2))
          }
        }
      }

      // Record transaction
      console.log("[v0] Polar Webhook: Recording transaction in database")
      const { error: txError } = await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        polar_order_id: order.id,
        amount: (order.amount || 0) / 100,
        status: "completed",
        type: metadata.type || "unknown",
        outfit_id: metadata.outfit_id || null,
        credits_purchased: metadata.credits ? Number.parseInt(metadata.credits) : null,
        payment_provider: "polar",
      })

      if (txError) {
        console.error("[v0] Polar Webhook: Failed to record transaction:", txError)
      } else {
        console.log("[v0] Polar Webhook: Transaction recorded successfully")
      }
    }

    // Log webhook
    console.log("[v0] Polar Webhook: Logging webhook event to database")
    await supabaseAdmin.from("polar_webhooks").insert({
      event_id: event.id,
      event_type: event.type,
      status: "processed",
      metadata: event.data,
    })

    console.log("[v0] Polar Webhook: Webhook processed successfully")
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] Polar Webhook: Catch error:", error.message)
    console.error("[v0] Polar Webhook: Stack trace:", error.stack)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
