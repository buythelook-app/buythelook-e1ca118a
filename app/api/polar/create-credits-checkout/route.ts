import { NextResponse } from "next/server"
import { createPolarCheckout } from "@/lib/polar"
import { getCreditPackageById } from "@/lib/credit-packages"

export async function POST(request: Request) {
  console.log("[v0] Polar Credits: Creating checkout session")

  try {
    const { packageId, userId } = await request.json()

    console.log("[v0] Polar API Token exists:", !!process.env.POLAR_ACCESS_TOKEN)
    console.log("[v0] Polar Sandbox Mode:", process.env.POLAR_SANDBOX_MODE === "true")
    console.log("[v0] Polar Starter Product ID:", process.env.POLAR_STARTER_PRODUCT_ID)
    console.log("[v0] Polar Pack Product ID:", process.env.POLAR_PACK_PRODUCT_ID)
    console.log("[v0] Polar Fashionista Product ID:", process.env.POLAR_FASHIONISTA_PRODUCT_ID)
    console.log("[v0] Polar Links Product ID:", process.env.POLAR_LINKS_PRODUCT_ID)

    if (!packageId || !["starter", "popular", "pro"].includes(packageId)) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Server-side price validation - prevents price manipulation
    const creditPackage = getCreditPackageById(packageId)
    if (!creditPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 400 })
    }

    console.log(
      "[v0] Polar Credits: Creating checkout for",
      creditPackage.name,
      "-",
      creditPackage.credits,
      "credits for $",
      (creditPackage.priceInCents / 100).toFixed(2),
    )

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.buythelook.app"
    const successUrl = `${baseUrl}/payment/success?type=credits&credits=${creditPackage.credits}&user_id=${userId}&provider=polar`

    // Create checkout session with Polar
    const checkoutUrl = await createPolarCheckout({
      packageId: packageId,
      price: {
        amount: creditPackage.priceInCents,
        currency: "usd",
      },
      externalCustomerId: userId,
      successUrl: successUrl,
    })

    console.log("[v0] Polar Credits: Checkout URL created successfully")

    return NextResponse.json({ url: checkoutUrl })
  } catch (error: any) {
    console.error("[v0] Polar Credits: Error:", error.message)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
