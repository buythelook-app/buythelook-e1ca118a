"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const packages = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 9.99,
    features: ["5 AI Outfit Generations", "Basic Style Analysis", "Email Support"],
  },
  {
    id: "pro",
    name: "Professional",
    credits: 500,
    price: 39.99,
    popular: true,
    features: ["30 AI Outfit Generations", "Advanced Style Analysis", "Priority Support", "Wardrobe Integration"],
  },
  {
    id: "elite",
    name: "Elite",
    credits: 1200,
    price: 89.99,
    features: ["Unlimited Generations", "Personal Stylist Chat", "24/7 VIP Support", "Early Access to Features"],
  },
]

export function CreditStore() {
  const router = useRouter()
  const [processing, setProcessing] = useState(null)

  const handlePurchase = async (pkg) => {
    setProcessing(pkg.id)
    router.push(`/payment?type=credits&packageId=${pkg.id}`)
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {packages.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative bg-card border rounded-lg p-8 flex flex-col ${
            pkg.popular ? "border-primary shadow-lg" : ""
          }`}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Most Popular
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold">{pkg.credits}</span>
              <span className="text-muted-foreground ml-2">credits</span>
            </div>
            <div className="text-3xl font-bold">${pkg.price}</div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handlePurchase(pkg)}
            disabled={!!processing}
            className={pkg.popular ? "bg-primary hover:bg-primary/90" : ""}
          >
            {processing === pkg.id ? "Processing..." : "Purchase Credits"}
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
