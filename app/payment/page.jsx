"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { PaymentForm } from "@/components/payment-form"
import { useCart } from "@/lib/cart-context"
import { storage } from "@/lib/storage"
import { Suspense } from "react"

const CREDIT_PACKAGES = {
  starter: { name: "Starter", price: 9.99, credits: 100 },
  pro: { name: "Professional", price: 39.99, credits: 500 },
  elite: { name: "Elite", price: 89.99, credits: 1200 },
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { totalPrice, clearCart, items } = useCart()

  const type = searchParams.get("type")
  const packageId = searchParams.get("packageId")

  let amount = 0
  let description = "Checkout"
  let handleSuccess = async () => {
    items.forEach((item) => {
      if (item.type === "access" && item.outfitId) {
        storage.savePaidOutfit(item.outfitId)
      }
    })
    clearCart()
    router.push("/payment/success")
  }

  if (type === "credits" && packageId && CREDIT_PACKAGES[packageId]) {
    const pkg = CREDIT_PACKAGES[packageId]
    amount = pkg.price
    description = `${pkg.name} Credit Package (${pkg.credits} Credits)`
    handleSuccess = async () => {
      storage.addCredits(pkg.credits)
      router.push("/payment/success")
    }
  } else {
    amount = totalPrice
    description = "Shopping Cart Checkout"
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto mb-8 text-center">
        <h1 className="text-3xl font-serif mb-2">Secure Payment</h1>
        <p className="text-muted-foreground">Complete your purchase securely</p>
      </div>
      <PaymentForm amount={amount} description={description} onSuccess={handleSuccess} />
    </div>
  )
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentContent />
      </Suspense>
    </main>
  )
}
