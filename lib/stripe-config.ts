export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",

  // Your created price IDs
  prices: {
    outfitUnlock: process.env.STRIPE_OUTFIT_UNLOCK_PRICE_ID || "price_1SWx4jJ7MjkmAkdquqpyaF2I",
    creditPack: process.env.STRIPE_CREDIT_PRICE_ID || "",
  },
}
