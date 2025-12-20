import "server-only"

function getConfig() {
  return {
    accessToken: process.env.POLAR_ACCESS_TOKEN || "",
    starterProductId: process.env.POLAR_STARTER_PRODUCT_ID || "",
    packProductId: process.env.POLAR_PACK_PRODUCT_ID || "",
    fashionistaProductId: process.env.POLAR_FASHIONISTA_PRODUCT_ID || "",
    linksProductId: process.env.POLAR_LINKS_PRODUCT_ID || "",
    sandboxMode: process.env.POLAR_SANDBOX_MODE === "true",
  }
}

export const POLAR_CONFIG = {
  get accessToken() {
    return getConfig().accessToken
  },
  get starterProductId() {
    return getConfig().starterProductId
  },
  get packProductId() {
    return getConfig().packProductId
  },
  get fashionistaProductId() {
    return getConfig().fashionistaProductId
  },
  get linksProductId() {
    return getConfig().linksProductId
  },
  get sandboxMode() {
    return getConfig().sandboxMode
  },
}

// Polar API client - mirrors LemonSqueezy pattern
export async function polarFetch(endpoint: string, options: RequestInit = {}) {
  const accessToken = POLAR_CONFIG.accessToken

  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured")
  }

  const isSandbox = POLAR_CONFIG.sandboxMode
  const baseUrl = isSandbox ? "https://sandbox-api.polar.sh/v1" : "https://api.polar.sh/v1"
  const url = `${baseUrl}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Polar API error:", response.status, errorText)
    throw new Error(`Polar API error: ${response.status}`)
  }

  return response.json()
}

// Create a checkout session - mirrors LemonSqueezy
export async function createPolarCheckout({
  productId,
  amount,
  successUrl,
  metadata,
}: {
  productId: string
  amount: number // in cents
  successUrl?: string
  metadata?: Record<string, any>
}) {
  const body: Record<string, any> = {
    products: [productId],
  }

  // Add success URL if provided
  if (successUrl) {
    body.success_url = successUrl
  }

  // Add metadata for tracking purchase info
  if (metadata) {
    body.metadata = metadata
  }

  // Add custom pricing (ad-hoc pricing in cents)
  if (amount) {
    body.prices = {
      [productId]: [
        {
          amount_type: "fixed",
          price_amount: amount,
          price_currency: "usd",
        },
      ],
    }
  }

  const response = await polarFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  })

  return response.url
}

// Retrieve an order to verify payment - mirrors LemonSqueezy
export async function getPolarOrder(orderId: string) {
  const response = await polarFetch(`/orders/${orderId}`)
  return response.data
}

// Get checkout info using customer session token
export async function getPolarCheckoutInfo(customerSessionToken: string) {
  const response = await polarFetch(`/checkouts/customer_session/${customerSessionToken}`)
  return response.data
}
