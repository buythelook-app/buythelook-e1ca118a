export const STRIPE_CONFIG = {
  publishableKey:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ,

  secretKey:
    process.env.STRIPE_SECRET_KEY ,
  prices: {
    outfitUnlock: "", // $5.00 for outfit unlock
    creditPack: process.env.STRIPE_CREDIT_PRICE_ID , // Your credit product
  },
}
