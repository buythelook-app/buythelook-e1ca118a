import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  const secret = process.env.POLAR_WEBHOOK_SECRET

  if (!secret) {
    console.error("[v0] Polar Webhook: POLAR_WEBHOOK_SECRET not configured")
    return false
  }

  console.log("[v0] Polar Webhook: Secret length:", secret.length)
  console.log("[v0] Polar Webhook: Signature from header:", signature.substring(0, 20) + "...")

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest("hex")

  console.log("[v0] Polar Webhook: Expected signature:", expectedSignature.substring(0, 20) + "...")
  console.log("[v0] Polar Webhook: Signatures match:", signature === expectedSignature)

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-polar-signature") || ""

    console.log("[v0] Polar Webhook: Received webhook")
    console.log("[v0] Polar Webhook: Headers:", {
      "content-type": request.headers.get("content-type"),
      "x-polar-signature": signature ? "present" : "missing",
    })

    // Verify signature
    const isValid = await verifyWebhookSignature(body, signature)
    if (!isValid) {
      console.error("[v0] Polar Webhook: Invalid signature - webhook rejected")
      console.error("[v0] Polar Webhook: Check POLAR_WEBHOOK_SECRET in Vercel environment variables")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    console.log("[v0] Polar Webhook: Signature verified successfully")

    const event = JSON.parse(body)
    console.log("[v0] Polar Webhook: Event type:", event.type)
    console.log("[v0] Polar Webhook: Event ID:", event.id)

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

    if (event.type === "order.created" || event.type === "order.completed") {
      const order = event.data
      console.log("[v0] Polar Webhook: Processing order:", order.id)
      console.log("[v0] Polar Webhook: Order amount:", order.amount)
      console.log("[v0] Polar Webhook: Customer external_id:", order.customer?.external_id)
      console.log("[v0] Polar Webhook: Metadata:", JSON.stringify(order.metadata, null, 2))

      const userId = order.customer?.external_id
      const metadata = order.metadata || {}

      if (!userId) {
        console.error("[v0] Polar Webhook: No user ID found in customer external_id")
        return NextResponse.json({ error: "No user ID" }, { status: 400 })
      }

      // Handle credits purchase
      if (metadata.type === "credits") {
        const creditsString = metadata.credits
        const credits = creditsString ? Number.parseInt(creditsString) : 0

        console.log("[v0] Polar Webhook: Credits purchase - User:", userId, "Credits:", credits)

        if (credits > 0) {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("credits, id, email")
            .eq("id", userId)
            .single()

          if (profileError) {
            console.error("[v0] Polar Webhook: Profile fetch error:", profileError.message)
            return NextResponse.json({ error: "Profile not found" }, { status: 400 })
          }

          console.log("[v0] Polar Webhook: Current credits:", profile.credits || 0)

          if (profile) {
            const currentCredits = profile.credits || 0
            const newCredits = currentCredits + credits

            const { data: updateData, error: updateError } = await supabaseAdmin
              .from("profiles")
              .update({ credits: newCredits })
              .eq("id", userId)
              .select()

            if (updateError) {
              console.error("[v0] Polar Webhook: Failed to update credits:", updateError.message)
            } else {
              console.log(
                "[v0] Polar Webhook: Credits updated successfully -",
                currentCredits,
                "+",
                credits,
                "=",
                newCredits,
              )
            }
          }
        }
      }

      // Handle shopping links unlock
      if (metadata.type === "links_unlock") {
        const outfitId = metadata.outfit_id
        console.log("[v0] Polar Webhook: Links unlock - User:", userId, "Outfit:", outfitId)

        if (outfitId) {
          const { error } = await supabaseAdmin
            .from("generated_outfits")
            .update({ links_unlocked: true })
            .eq("id", outfitId)
            .eq("user_id", userId)

          if (error) {
            console.error("[v0] Polar Webhook: Failed to unlock links:", error.message)
          } else {
            console.log("[v0] Polar Webhook: Links unlocked successfully")
          }
        }
      }

      // Record transaction
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
        console.error("[v0] Polar Webhook: Failed to record transaction:", txError.message)
      } else {
        console.log("[v0] Polar Webhook: Transaction recorded")
      }
    } else {
      console.log("[v0] Polar Webhook: Event type not handled:", event.type)
    }

    // Log webhook
    await supabaseAdmin.from("polar_webhooks").insert({
      event_id: event.id,
      event_type: event.type,
      status: "processed",
      metadata: event.data,
    })

    console.log("[v0] Polar Webhook: Webhook processed")
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] Polar Webhook: Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
