"use client"

import { useState } from "react" // Assuming setStatus and setCreditsResult are state setters

const PaymentSuccess = () => {
  const [status, setStatus] = useState("")
  const [creditsResult, setCreditsResult] = useState({ creditsAdded: 0, newBalance: 0, success: false })

  const verifyPolarCredits = async (userId, credits, processedKey) => {
    try {
      console.log("[v0] Payment Success: Starting credit verification...")
      console.log("[v0] URL params:", window.location.search)

      const orderId = new URLSearchParams(window.location.search).get("order_id")
      console.log("[v0] Extracted order_id:", orderId)
      console.log("[v0] User ID to update:", userId)
      console.log("[v0] Credits to add:", credits, "Type:", typeof credits)

      if (!orderId) {
        console.error("[v0] CRITICAL: No order ID found in URL!")
        console.log("[v0] Full URL:", window.location.href)
        setStatus("error")
        return
      }

      console.log("[v0] Calling /api/polar/verify-order with:", {
        orderId,
        userId,
        type: "credits",
        credits,
      })

      // Call verification endpoint
      const response = await fetch("/api/polar/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId,
          type: "credits",
          credits,
        }),
      })

      console.log("[v0] API Response status:", response.status)
      const result = await response.json()
      console.log("[v0] API Response body:", JSON.stringify(result, null, 2))

      if (result.success) {
        console.log("[v0] SUCCESS! Credits added:", result.creditsAdded)
        console.log("[v0] New balance from API:", result.newBalance)

        setCreditsResult({
          creditsAdded: result.creditsAdded || Number.parseInt(credits) || 0,
          newBalance: result.newBalance || 0,
          success: true,
        })
        setStatus("success")

        sessionStorage.setItem(
          processedKey,
          JSON.stringify({
            status: "success",
            creditsResult: {
              creditsAdded: result.creditsAdded || Number.parseInt(credits) || 0,
              newBalance: result.newBalance || 0,
            },
            timestamp: Date.now(),
          }),
        )
      } else {
        console.error("[v0] VERIFICATION FAILED!")
        console.error("[v0] Error:", result.error)
        setStatus("error")
      }
    } catch (error) {
      console.error("[v0] Exception during verification:", error)
      setStatus("error")
    }
  }

  // Additional code for rendering the component can be added here

  return <div>{/* Render component based on status and creditsResult */}</div>
}

export { PaymentSuccess }
export default PaymentSuccess
