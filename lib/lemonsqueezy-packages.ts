// LemonSqueezy credit packages configuration
// Maps to LemonSqueezy product variants

export interface LemonSqueezyCreditPackage {
  id: string
  name: string
  credits: number
  priceInCents: number
  variantId: string // LemonSqueezy variant ID
  popular?: boolean
  description: string
}

// You'll need to create these products/variants in LemonSqueezy dashboard
// For now, we'll use dynamic pricing with a single variant
export const LEMONSQUEEZY_CREDIT_PACKAGES: LemonSqueezyCreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 5,
    priceInCents: 499, // $4.99
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID || "1115018", // Use default variant with custom price
    description: "Perfect for trying out new looks",
  },
  {
    id: "popular",
    name: "Style Pack",
    credits: 15,
    priceInCents: 999, // $9.99
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID || "1115018",
    popular: true,
    description: "Most popular - Best value for regular users",
  },
  {
    id: "pro",
    name: "Fashionista",
    credits: 50,
    priceInCents: 2499, // $24.99
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID || "1115018",
    description: "For the serious style enthusiast",
  },
]

export function getLemonSqueezyPackageById(id: string): LemonSqueezyCreditPackage | undefined {
  return LEMONSQUEEZY_CREDIT_PACKAGES.find((pkg) => pkg.id === id)
}
