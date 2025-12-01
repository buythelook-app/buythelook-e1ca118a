import { NextResponse } from "next/server"
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy"
import { getLemonSqueezyPackageById } from "@/lib/lemonsqueezy-packages"

export async function POST(request: Request) {
  console.log("[] LemonSqueezy Credits: Creating checkout session")

  try {
    const { packageId, userId } = await request.json()

    console.log("[] LemonSqueezy Credits: Package ID:", packageId)
    console.log("[] LemonSqueezy Credits: User ID:", userId)

    // Validate inputs
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    // Server-side price validation - prevents price manipulation
    const creditPackage = getLemonSqueezyPackageById(packageId)
    if (!creditPackage) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 })
    }

    console.log(
      "[] LemonSqueezy Credits: Package found:",
      creditPackage.name,
      creditPackage.credits,
      "credits for $",
      creditPackage.priceInCents / 100,
    )

    // Build success URL with all needed params
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const successUrl = `${baseUrl}/payment/success?type=credits&credits=${creditPackage.credits}&user_id=${userId}&provider=lemonsqueezy`

    // Create checkout session with custom price
    const checkoutUrl = await createLemonSqueezyCheckout({
      variantId: creditPackage.variantId,
      customPrice: creditPackage.priceInCents,
      customData: {
        type: "credits_purchase",
        packageId: packageId,
        credits: creditPackage.credits.toString(),
        userId: userId,
      },
      redirectUrl: successUrl,
    })

    console.log("[] LemonSqueezy Credits: Checkout URL created")

    return NextResponse.json({
      url: checkoutUrl,
    })
  } catch (error: any) {
    console.error("[] LemonSqueezy Credits: Error creating checkout:", error.message)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
