import { NextResponse } from "next/server"
import { createPolarCheckout, POLAR_CONFIG } from "@/lib/polar"
import { getCreditPackageById } from "@/lib/credit-packages"

export async function POST(request: Request) {
  console.log(" Polar Credits: Creating checkout session")

  try {
    const { packageId, userId } = await request.json()

    console.log(" Polar Credits: Package ID:", packageId)
    console.log(" Polar Credits: User ID:", userId)

    // Validate inputs
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    // Server-side price validation - prevents price manipulation
    const creditPackage = getCreditPackageById(packageId)
    if (!creditPackage) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 })
    }

    console.log(
      " Polar Credits: Package found:",
      creditPackage.name,
      creditPackage.credits,
      "credits for $",
      creditPackage.priceInCents / 100,
    )

    const productIdMap: Record<string, string> = {
      starter: POLAR_CONFIG.starterProductId,
      popular: POLAR_CONFIG.packProductId,
      pro: POLAR_CONFIG.fashionistaProductId,
    }

    const productId = productIdMap[packageId]
    if (!productId) {
      console.error(" Polar: Missing product ID for package:", packageId)
      return NextResponse.json({ error: "Product not configured" }, { status: 500 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_ENV === "production" ? "https://www.buythelook.app" : `http://localhost:3000`)
    const successUrl = `${baseUrl}/payment/success?type=credits&credits=${creditPackage.credits}&user_id=${userId}&provider=polar`

    // Create checkout session with Polar
    const checkoutUrl = await createPolarCheckout({
      productId: productId,
      amount: creditPackage.priceInCents,
      successUrl: successUrl,
    })

    console.log(" Polar Credits: Checkout URL created successfully")

    return NextResponse.json({
      url: checkoutUrl,
    })
  } catch (error: any) {
    console.error(" Polar Credits: Error creating checkout:", error.message)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
