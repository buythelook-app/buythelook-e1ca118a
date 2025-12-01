"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function CartView() {
  const { items, removeItem, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Your bag is currently empty.</p>
        <Link href="/outfits">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 bg-card border rounded-lg p-4">
            <div className="relative w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg?height=100&width=100"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{item.name}</h3>
              <p className="text-lg font-bold">${item.price}</p>
              {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
            </div>
            <div className="flex flex-col justify-between items-end">
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-card border rounded-lg p-6 sticky top-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <Link href="/payment">
            <Button className="w-full gap-2">
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
