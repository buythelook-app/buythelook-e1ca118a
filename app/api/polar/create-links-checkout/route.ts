import { NextResponse } from "next/server"
import { createPolarCheckout } from "@/lib/polar"

export async function POST(request: Request) {
  console.log("[v0] Polar Links: Creating checkout session for $5 shopping links unlock")

  try {
    const { outfitId, userId } = await request.json()

    if (!outfitId) {
      console.error("[v0] Polar Links: Missing outfit ID")
      return NextResponse.json({ error: "Outfit ID is required" }, { status: 400 })
    }

    if (!userId) {
      console.error("[v0] Polar Links: Missing user ID")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.buythelook.app"
    const successUrl = `${baseUrl}/payment/success?type=links_unlock&outfit_id=${outfitId}&user_id=${userId}&provider=polar`

    const checkoutUrl = await createPolarCheckout({
      packageId: "links", // Special packageId for shopping links
      price: {
        amount: 500, // $5.00 in cents
        currency: "usd",
      },
      externalCustomerId: userId,
      successUrl: successUrl,
      metadata: {
        type: "links_unlock",
        outfit_id: outfitId,
        user_id: userId,
      },
    })

    console.log("[v0] Polar Links: Checkout URL created successfully for outfit:", outfitId)

    return NextResponse.json({ url: checkoutUrl })
  } catch (error: any) {
    console.error("[v0] Polar Links: Error:", error.message)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
