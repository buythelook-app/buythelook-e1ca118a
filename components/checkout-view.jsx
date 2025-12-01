"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { PaymentForm } from "@/components/payment-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CheckoutView() {
  const { total } = useCart()
  const [step, setStep] = useState(1)

  if (step === 2) {
    return <PaymentForm amount={total} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8 p-8 border border-border bg-card/50 backdrop-blur-sm">
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Shipping Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="Jane" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="123 Fashion Ave" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" placeholder="10001" />
            </div>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={() => setStep(2)}>
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
