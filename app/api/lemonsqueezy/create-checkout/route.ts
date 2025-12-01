import { NextResponse } from "next/server"
import { createLemonSqueezyCheckout, LEMONSQUEEZY_CONFIG } from "@/lib/lemonsqueezy"

export async function POST(request: Request) {
  console.log("[v0] LemonSqueezy: Creating checkout session for links unlock")

  try {
    const { amount, outfitId, description, type, userId } = await request.json()

    console.log("[v0] LemonSqueezy: Amount:", amount, "cents ($" + amount / 100 + ")")
    console.log("[v0] LemonSqueezy: Type:", type || "outfit_unlock")
    console.log("[v0] LemonSqueezy: Outfit ID:", outfitId)
    console.log("[v0] LemonSqueezy: User ID:", userId)

    if (!userId) {
      console.error("[v0] LemonSqueezy: Missing user ID")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!outfitId && type === "outfit_unlock") {
      console.error("[v0] LemonSqueezy: Missing outfit ID for outfit unlock")
      return NextResponse.json({ error: "Outfit ID is required for unlock" }, { status: 400 })
    }

    // Build success URL with all needed params
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const successUrl = `${baseUrl}/payment/success?outfit_id=${outfitId || ""}&type=${type || "outfit_unlock"}&user_id=${userId}&provider=lemonsqueezy`

    // Create checkout session
    const checkoutUrl = await createLemonSqueezyCheckout({
      variantId: LEMONSQUEEZY_CONFIG.linksUnlockVariantId,
      customPrice: amount, // $5.00 = 500 cents
      customData: {
        outfitId: outfitId || "",
        type: type || "outfit_unlock",
        userId: userId || "",
      },
      redirectUrl: successUrl,
    })

    console.log("[v0] LemonSqueezy: Checkout URL created")

    return NextResponse.json({
      url: checkoutUrl,
    })
  } catch (error: any) {
    console.error("[v0] LemonSqueezy: Error creating checkout:", error)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
