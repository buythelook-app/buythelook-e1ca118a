export const STRIPE_CONFIG = {
  publishableKey:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51SWwwwJ7MjkmAkdqGiCSxsxCwJCueL4FA6jK27AIW2Zf2YwFFd5BTF2cgdG3Olctr9wD9h8yb86BTF4QfCEUHvew00bA32vqfm",

  secretKey:
    process.env.STRIPE_SECRET_KEY ||
    "sk_test_51SWwwwJ7MjkmAkdqZAGTQmDLfJATkU6OENuMcWA2zBLpSuX8gAgslzGSXMUfVq5L7WCPhYnaY73W9B5wtxyG616E00FVpE0K3e",

  // Your created price IDs
  prices: {
    outfitUnlock: "price_1SWx4jJ7MjkmAkdquqpyaF2I", // $5.00 for outfit unlock
    creditPack: process.env.STRIPE_CREDIT_PRICE_ID || "price_REPLACE_WITH_CREDIT_PACK_ID", // Your credit product
  },
}
