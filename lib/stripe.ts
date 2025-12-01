import "server-only"
import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured")
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    })
  }
  return stripeInstance
}

// For backward compatibility - will throw at runtime if key is missing
export const stripe = {
  get checkout() {
    return getStripe().checkout
  },
  get customers() {
    return getStripe().customers
  },
  get paymentIntents() {
    return getStripe().paymentIntents
  },
  get subscriptions() {
    return getStripe().subscriptions
  },
  get products() {
    return getStripe().products
  },
  get prices() {
    return getStripe().prices
  },
}
