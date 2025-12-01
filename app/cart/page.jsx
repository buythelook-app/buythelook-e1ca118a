"use client"

import { CartView } from "@/components/cart-view"

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif font-medium mb-8 text-center">Your Shopping Bag</h1>
        <CartView />
      </div>
    </main>
  )
}
