"use client"

import { PaymentSuccess } from "@/components/payment-success"
import { Suspense } from "react"

export default function PaymentSuccessPage() {
  return (
    <div className="container py-12">
      <Suspense fallback={<div className="text-center">Loading payment status...</div>}>
        <PaymentSuccess />
      </Suspense>
    </div>
  )
}
