"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Lock } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function PaymentForm({ amount, description, onSuccess }) {
  const router = useRouter()
  const { clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (onSuccess) {
      await onSuccess()
    } else {
      clearCart()
      router.push("/payment/success")
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 md:p-8 border border-border bg-card/50 backdrop-blur-sm rounded-lg">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium mb-2">Payment Details</h2>
        {description && <p className="text-sm text-muted-foreground mb-1">{description}</p>}
        <p className="text-muted-foreground">Total Amount: ${amount.toFixed(2)}</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant={paymentMethod === "card" ? "default" : "outline"}
          onClick={() => setPaymentMethod("card")}
          className="w-full"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Card
        </Button>
        <Button
          type="button"
          variant={paymentMethod === "paypal" ? "default" : "outline"}
          onClick={() => setPaymentMethod("paypal")}
          className="w-full"
        >
          PayPal
        </Button>
        <Button
          type="button"
          variant={paymentMethod === "apple" ? "default" : "outline"}
          onClick={() => setPaymentMethod("apple")}
          className="w-full"
        >
          Apple Pay
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {paymentMethod === "card" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <div className="relative">
                <Input id="card" placeholder="0000 0000 0000 0000" className="pl-10" />
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
          </>
        )}

        {paymentMethod === "paypal" && (
          <div className="py-8 text-center text-muted-foreground">
            <p>You will be redirected to PayPal to complete your payment.</p>
          </div>
        )}

        {paymentMethod === "apple" && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Apple Pay authentication will be requested.</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
          {isProcessing ? (
            "Processing..."
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Pay Securely
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
