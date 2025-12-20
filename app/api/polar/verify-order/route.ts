import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId, type, credits, outfitId } = await request.json()

    console.log("[v0] Verifying Polar order:", orderId)
    console.log("[v0] Order type:", type)

    // Get Polar access token
    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Polar not configured" }, { status: 500 })
    }

    // Verify order with Polar API
    const isSandbox = process.env.POLAR_SANDBOX_MODE === "true"
    const apiBaseUrl = isSandbox ? "https://sandbox-api.polar.sh/v1" : "https://api.polar.sh/v1"

    console.log("[v0] Fetching order from:", `${apiBaseUrl}/orders/${orderId}`)

    const orderResponse = await fetch(`${apiBaseUrl}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!orderResponse.ok) {
      console.error("[v0] Polar API error:", orderResponse.status)
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = await orderResponse.json()
    console.log("[v0] Order found:", JSON.stringify(order, null, 2))

    // Check if order is paid
    if (order.payment_status !== "paid") {
      console.error("[v0] Order not paid, status:", order.payment_status)
      return NextResponse.json({ success: false, error: "Order not paid" }, { status: 400 })
    }

    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    if (type === "credits") {
      console.log("[v0] Processing credits purchase for user:", userId)

      // Check if order already processed
      const { data: existingTransaction } = await supabase
        .from("payment_transactions")
        .select("id")
        .eq("external_id", orderId)
        .eq("user_id", userId)
        .single()

      if (existingTransaction) {
        console.log("[v0] Order already processed, preventing duplicate")
        // Get current balance
        const { data: profile } = await supabase.from("profiles").select("credits").eq("id", userId).single()

        return NextResponse.json({
          success: true,
          creditsAdded: Number.parseInt(credits) || 0,
          newBalance: profile?.credits || 0,
          duplicate: true,
        })
      }

      // Add credits to user
      const numCredits = Number.parseInt(credits) || 0
      console.log("[v0] Adding", numCredits, "credits to user", userId)

      const { data: profile, error: updateError } = await supabase
        .from("profiles")
        .update({
          credits: supabase.raw(`credits + ${numCredits}`),
        })
        .eq("id", userId)
        .select("credits")
        .single()

      if (updateError) {
        console.error("[v0] Error updating profile:", updateError)
        return NextResponse.json({ success: false, error: "Failed to add credits" }, { status: 500 })
      }

      // Record transaction
      await supabase.from("payment_transactions").insert({
        user_id: userId,
        external_id: orderId,
        provider: "polar",
        amount: order.total_amount / 100,
        currency: order.currency,
        status: "completed",
        type: "credits",
        metadata: {
          credits: numCredits,
          orderId: orderId,
        },
      })

      console.log("[v0] Credits added successfully. New balance:", profile?.credits)

      return NextResponse.json({
        success: true,
        creditsAdded: numCredits,
        newBalance: profile?.credits || 0,
      })
    }

    if (type === "links_unlock") {
      console.log("[v0] Processing links unlock for outfit:", outfitId)

      // Check if already processed
      const { data: existingTransaction } = await supabase
        .from("payment_transactions")
        .select("id")
        .eq("external_id", orderId)
        .eq("user_id", userId)
        .single()

      if (existingTransaction) {
        console.log("[v0] Order already processed, preventing duplicate")
        return NextResponse.json({ success: true, duplicate: true })
      }

      // Unlock shopping links for outfit
      const { error: unlockError } = await supabase
        .from("generated_outfits")
        .update({ links_unlocked: true })
        .eq("id", outfitId)
        .eq("user_id", userId)

      if (unlockError) {
        console.error("[v0] Error unlocking links:", unlockError)
        return NextResponse.json({ success: false, error: "Failed to unlock links" }, { status: 500 })
      }

      // Record transaction
      await supabase.from("payment_transactions").insert({
        user_id: userId,
        external_id: orderId,
        provider: "polar",
        amount: order.total_amount / 100,
        currency: order.currency,
        status: "completed",
        type: "links_unlock",
        metadata: {
          outfitId: outfitId,
          orderId: orderId,
        },
      })

      console.log("[v0] Links unlocked successfully")
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid order type" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error verifying order:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    )
  }
}
