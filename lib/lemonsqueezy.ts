import "server-only"

export const LEMONSQUEEZY_CONFIG = {
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  storeId: process.env.LEMONSQUEEZY_STORE_ID!,
  linksUnlockVariantId: process.env.LEMONSQUEEZY_VARIANT_ID!,
}

export async function lemonSqueezyFetch(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.lemonsqueezy.com/v1${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[LSQ] API error:", response.status, errorText)
    throw new Error(`LemonSqueezy API error: ${response.status}`)
  }

  return response.json()
}

export async function createLemonSqueezyCheckout({
  variantId,
  customPrice,
  customData,
  redirectUrl,
}: {
  variantId: string
  customPrice?: number
  customData?: Record<string, string>
  redirectUrl?: string
}) {
  const attributes: Record<string, any> = {
    checkout_data: {
      custom: customData || {},
      currency: "USD", // FIXED
    },
    product_options: {
      redirect_url: redirectUrl,
      enabled_variants: [Number.parseInt(variantId)],
    },
  }

  if (customPrice) {
    attributes.custom_price = customPrice
  }

  const response = await lemonSqueezyFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes,
        relationships: {
          store: {
            data: { type: "stores", id: LEMONSQUEEZY_CONFIG.storeId },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  })

  return response.data.attributes.url
}
