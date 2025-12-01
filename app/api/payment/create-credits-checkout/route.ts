import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getCreditPackageById } from "@/lib/credit-packages"

export async function POST(request: Request) {
  console.log("[v0] Credits: Creating checkout session")

  try {
    const { packageId, userId } = await request.json()

    console.log("[v0] Credits: Package ID:", packageId)
    console.log("[v0] Credits: User ID:", userId)

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
      "[v0] Credits: Package found:",
      creditPackage.name,
      creditPackage.credits,
      "credits for $",
      creditPackage.priceInCents / 100,
    )

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${creditPackage.name} - ${creditPackage.credits} Credits`,
              description: creditPackage.description,
            },
            unit_amount: creditPackage.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://buythelook.pdfwhisperer.xyz"}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=credits&credits=${creditPackage.credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://buythelook.pdfwhisperer.xyz"}/credits`,
      metadata: {
        type: "credits_purchase",
        packageId: packageId,
        credits: creditPackage.credits.toString(),
        userId: userId,
      },
    })

    console.log("[v0] Credits: Session created:", session.id)

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error("[v0] Credits: Error creating checkout:", error.message)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
