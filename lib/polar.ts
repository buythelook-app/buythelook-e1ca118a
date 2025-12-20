import "server-only"

export interface PolarCheckoutOptions {
  packageId: string // starter, popular, pro, links
  price?: {
    amount: number // in cents
    currency: string
  }
  externalCustomerId?: string
  successUrl?: string
}

export async function createPolarCheckout(options: PolarCheckoutOptions) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured")
  }

  const productIdMap: Record<string, string> = {
    starter: process.env.POLAR_STARTER_PRODUCT_ID || "",
    popular: process.env.POLAR_PACK_PRODUCT_ID || "",
    pro: process.env.POLAR_FASHIONISTA_PRODUCT_ID || "",
    links: process.env.POLAR_LINKS_PRODUCT_ID || "",
  }

  const productId = productIdMap[options.packageId]
  if (!productId) {
    console.error(`[v0] Missing product ID for package: ${options.packageId}`)
    throw new Error(`Product ID not configured for package: ${options.packageId}`)
  }

  const body: Record<string, any> = {
    products: [productId],
    external_customer_id: options.externalCustomerId,
  }

  // Add ad-hoc pricing if custom price provided
  if (options.price) {
    body.prices = {
      [productId]: [
        {
          amount_type: "fixed",
          price_amount: options.price.amount,
          price_currency: options.price.currency,
        },
      ],
    }
  }

  const isSandbox = process.env.POLAR_SANDBOX_MODE === "true"
  const apiBaseUrl = isSandbox ? "https://sandbox-api.polar.sh/v1" : "https://api.polar.sh/v1"

  const response = await fetch(`${apiBaseUrl}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Polar API error:", response.status, errorText)
    throw new Error(`Polar API error: ${response.status}`)
  }

  const data = await response.json()
  return data.url
}
