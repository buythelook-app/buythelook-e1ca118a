import { NextResponse } from "next/server"
import { createPolarCheckout, POLAR_CONFIG } from "@/lib/polar"

export async function POST(request: Request) {
  console.log("[v0] Polar: Creating checkout session for links unlock")

  try {
    const { outfitId, userId } = await request.json()

    console.log("[v0] Polar: Amount: 500 cents ($5.00)")
    console.log("[v0] Polar: Outfit ID:", outfitId)
    console.log("[v0] Polar: User ID:", userId)

    if (!userId) {
      console.error("[v0] Polar: Missing user ID")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!outfitId) {
      console.error("[v0] Polar: Missing outfit ID")
      return NextResponse.json({ error: "Outfit ID is required" }, { status: 400 })
    }

    // Build success URL with all needed params
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.buythelook.app"
    const successUrl = `${baseUrl}/payment/success?outfit_id=${outfitId}&type=links_unlock&user_id=${userId}&provider=polar`

    // Create checkout session
    const checkoutUrl = await createPolarCheckout({
      productId: POLAR_CONFIG.linksProductId,
      amount: 500, // $5.00 in cents
      successUrl: successUrl,
    })

    console.log("[v0] Polar: Checkout URL created")

    return NextResponse.json({
      url: checkoutUrl,
    })
  } catch (error: any) {
    console.error("[v0] Polar: Error creating checkout:", error)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
