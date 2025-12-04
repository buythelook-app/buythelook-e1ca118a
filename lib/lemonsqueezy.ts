export async function createLemonSqueezyCheckout({
  variantId,
  customPrice,
  customData,
  redirectUrl,
}) {
  const attributes: Record<string, any> = {
    checkout_data: {
      custom: customData || {},
      currency: "USD",               // <--- REQUIRED FOR PAYPAL
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
            data: {
              type: "stores",
              id: LEMONSQUEEZY_CONFIG.storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  })

  return response.data.attributes.url
}
