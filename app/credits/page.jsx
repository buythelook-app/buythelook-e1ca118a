"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CREDIT_PACKAGES } from "@/lib/credit-packages"
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react"
import OnboardingTour from "@/components/onboarding-tour"

export default function CreditsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (pkg) => {
    if (!user) {
      router.push("/login?redirect=/credits")
      return
    }

    setSelectedPackage(pkg.id)
    setIsProcessing(true)

    try {
      const response = await fetch("/api/polar/create-credits-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to start checkout. Please try again.")
    } finally {
      setIsProcessing(false)
      setSelectedPackage(null)
    }
  }

  const getIcon = (index) => {
    const icons = [Zap, Sparkles, Crown]
    const Icon = icons[index]
    return <Icon className="w-6 h-6" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <OnboardingTour pageType="credits" />
      <main className="flex-1 container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-serif">Top Up Credits</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Credits are used to generate personalized outfit recommendations. Each outfit generation costs 1 credit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6" data-tour="credits-packages">
            {CREDIT_PACKAGES.map((pkg, index) => (
              <div
                key={pkg.id}
                data-tour={pkg.popular ? "credits-popular" : undefined}
                className={`relative p-8 border bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                  pkg.popular ? "border-black scale-105 shadow-md" : "border-border hover:border-black/50"
                }`}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-black text-white text-xs uppercase tracking-wider px-4 py-1">Most Popular</span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-12 h-12 flex items-center justify-center mb-6 ${
                    pkg.popular ? "bg-black text-white" : "bg-gray-100"
                  }`}
                >
                  {getIcon(index)}
                </div>

                {/* Package Name */}
                <h3 className="font-serif text-2xl mb-2">{pkg.name}</h3>

                {/* Credits */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-serif">{pkg.credits}</span>
                  <span className="text-muted-foreground text-sm">credits</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-2xl font-medium">${(pkg.priceInCents / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm ml-1">
                    (${(pkg.priceInCents / pkg.credits / 100).toFixed(2)}/credit)
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-8">{pkg.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{pkg.credits} outfit generations</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Never expires</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Instant delivery</span>
                  </li>
                </ul>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isProcessing}
                  className={`w-full py-4 uppercase text-xs tracking-[0.2em] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    pkg.popular
                      ? "bg-black text-white hover:bg-gray-800"
                      : "border border-black hover:bg-black hover:text-white"
                  }`}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Buy ${pkg.credits} Credits`
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ / Info */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Polar. Credits are added instantly after payment.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
