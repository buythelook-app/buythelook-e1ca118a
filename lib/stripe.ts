import "server-only"
import Stripe from "stripe"
import { STRIPE_CONFIG } from "./stripe-config"

export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
})
