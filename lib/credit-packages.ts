// Credit packages - source of truth for all credit purchases
// These are validated server-side to prevent price manipulation

export interface CreditPackage {
  id: string
  name: string
  credits: number
  priceInCents: number
  popular?: boolean
  description: string
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 5,
    priceInCents: 499, // $4.99
    description: "Perfect for trying out new looks",
  },
  {
    id: "popular",
    name: "Style Pack",
    credits: 15,
    priceInCents: 999, // $9.99
    popular: true,
    description: "Most popular - Best value for regular users",
  },
  {
    id: "pro",
    name: "Fashionista",
    credits: 50,
    priceInCents: 2499, // $24.99
    description: "For the serious style enthusiast",
  },
]

export function getCreditPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id)
}
