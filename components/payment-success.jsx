"use client"

import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, AlertCircle, Loader2, Coins, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"

export function PaymentSuccess() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [status, setStatus] = useState("processing")
  const [outfitId, setOutfitId] = useState(null)
  const [paymentType, setPaymentType] = useState("outfit_unlock")
  const [purchasedOutfit, setPurchasedOutfit] = useState(null)
  const [creditsResult, setCreditsResult] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    const id = searchParams.get("outfit_id")
    const type = searchParams.get("type") || "outfit_unlock"
    const provider = searchParams.get("provider") || "stripe"
    const credits = searchParams.get("credits")
    const userIdFromUrl = searchParams.get("user_id")

    console.log(" Payment Success: Session ID:", sessionId)
    console.log(" Payment Success: Outfit ID:", id)
    console.log(" Payment Success: Payment Type:", type)
    console.log(" Payment Success: Provider:", provider)

    setOutfitId(id)
    setPaymentType(type)

    const processedKey =
      provider === "lemonsqueezy"
        ? `payment_processed_ls_${type}_${id || credits}_${userIdFromUrl}`
        : provider === "polar"
          ? `payment_processed_polar_${type}_${id || credits}_${userIdFromUrl}`
          : `payment_processed_${sessionId}`

    const alreadyProcessed = sessionStorage.getItem(processedKey)

    if (alreadyProcessed) {
      console.log(" Payment Success: Session already processed, showing cached result")
      const cachedResult = JSON.parse(alreadyProcessed)
      setStatus(cachedResult.status)
      setCreditsResult(cachedResult.creditsResult)
      return
    }

    if (provider === "polar") {
      const effectiveUserId = userIdFromUrl || user?.id
      if (effectiveUserId) {
        if (type === "credits") {
          verifyPolarCredits(effectiveUserId, credits, processedKey)
        } else if (type === "links_unlock") {
          verifyPolarLinksUnlock(effectiveUserId, id, processedKey)
        }
      } else if (!user) {
        console.log(" Payment Success: Waiting for user auth...")
      }
      return
    }

    if (provider === "lemonsqueezy") {
      const effectiveUserId = userIdFromUrl || user?.id
      if (effectiveUserId) {
        if (type === "credits") {
          verifyLemonSqueezyCredits(effectiveUserId, credits, processedKey)
        } else {
          verifyLemonSqueezyOutfit(effectiveUserId, id, type, processedKey)
        }
      } else if (!user) {
        console.log(" Payment Success: Waiting for user auth...")
      }
      return
    }

    if (!sessionId) {
      console.log(" Payment Success: No session ID in URL")
      setStatus("error")
      return
    }

    if (user) {
      if (type === "credits") {
        verifyCredits(sessionId, processedKey)
      } else {
        verifyAndUnlock(sessionId, id, type, processedKey)
      }
    }
  }, [searchParams, user])

  const verifyLemonSqueezyCredits = async (userId, credits, processedKey) => {
    try {
      console.log(" Payment Success: Verifying LemonSqueezy credits purchase...")

      const response = await fetch("/api/lemonsqueezy/verify-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credits }),
      })

      const result = await response.json()

      if (result.success) {
        console.log(" Payment Success: LemonSqueezy credits added!", result)
        setCreditsResult(result)
        setStatus("success")

        sessionStorage.setItem(
          processedKey,
          JSON.stringify({
            status: "success",
            creditsResult: result,
            timestamp: Date.now(),
          }),
        )
      } else {
        console.error(" Payment Success: LemonSqueezy credits verification failed:", result.error)
        setStatus("error")
      }
    } catch (error) {
      console.error(" Payment Success: Error verifying LemonSqueezy credits:", error)
      setStatus("error")
    }
  }

  const verifyLemonSqueezyOutfit = async (userId, outfitId, type, processedKey) => {
    try {
      console.log(" Payment Success: Verifying LemonSqueezy outfit unlock...")

      const response = await fetch("/api/lemonsqueezy/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfitId, userId, type }),
      })

      const result = await response.json()

      if (result.success) {
        console.log(" Payment Success: LemonSqueezy outfit unlocked!", result)
        setStatus("success")

        sessionStorage.setItem(
          processedKey,
          JSON.stringify({
            status: "success",
            timestamp: Date.now(),
          }),
        )
      } else {
        console.error(" Payment Success: LemonSqueezy verification failed:", result.error)
        setStatus("error")
      }
    } catch (error) {
      console.error(" Payment Success: Error verifying LemonSqueezy payment:", error)
      setStatus("error")
    }
  }

  const verifyCredits = async (sessionId, processedKey) => {
    try {
      console.log(" Payment Success: Verifying credits purchase...")

      const response = await fetch("/api/payment/verify-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const result = await response.json()

      if (result.success) {
        console.log(" Payment Success: Credits added!", result)
        setCreditsResult(result)
        setStatus("success")

        sessionStorage.setItem(
          processedKey,
          JSON.stringify({
            status: "success",
            creditsResult: result,
            timestamp: Date.now(),
          }),
        )
      } else {
        console.error(" Payment Success: Credits verification failed:", result.error)
        setStatus("error")
      }
    } catch (error) {
      console.error(" Payment Success: Error verifying credits:", error)
      setStatus("error")
    }
  }

  const verifyAndUnlock = async (sessionId, id, type, processedKey) => {
    try {
      console.log(" Payment Success: Verifying payment session with Stripe...")

      const verifyResponse = await fetch("/api/payment/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResult.success) {
        console.error(" Payment Success: Payment not verified")
        setStatus("error")
        return
      }

      console.log(" Payment Success: Payment verified! Amount:", verifyResult.amountTotal / 100, "USD")

      if (type === "outfit_unlock" && id) {
        console.log(" Payment Success: Unlocking outfit:", id)

        const { error } = await supabaseAuth
          .from("generated_outfits")
          .update({
            is_unlocked: true,
            links_unlocked: true,
          })
          .eq("id", id)
          .eq("user_id", user.id)

        if (error) {
          console.error(" Payment Success: Error updating unlock status:", error)
          setStatus("error")
        } else {
          console.log(" Payment Success: Successfully unlocked outfit with shopping links")
          setStatus("success")

          sessionStorage.setItem(
            processedKey,
            JSON.stringify({
              status: "success",
              timestamp: Date.now(),
            }),
          )
        }
      } else {
        setStatus("success")
      }
    } catch (error) {
      console.error(" Payment Success: Error during verification:", error)
      setStatus("error")
    }
  }

  const verifyPolarCredits = async (userId, credits, processedKey) => {
    try {
      console.log("[v0] Payment Success: Processing Polar credits...")

      const orderId = new URLSearchParams(window.location.search).get("order_id")

      if (!orderId) {
        console.error("[v0] Payment Success: No order ID in URL params")
        setStatus("error")
        return
      }

      console.log("[v0] Payment Success: Order ID:", orderId, "User ID:", userId)

      // Call verification endpoint to check order and add credits
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

      const result = await response.json()

      if (result.success) {
        console.log("[v0] Payment Success: Verification successful!", result)
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
        console.error("[v0] Payment Success: Verification failed:", result.error)
        setStatus("error")
      }
    } catch (error) {
      console.error("[v0] Payment Success: Error verifying credits:", error)
      setStatus("error")
    }
  }

  const verifyPolarLinksUnlock = async (userId, outfitId, processedKey) => {
    try {
      console.log("[v0] Payment Success: Processing Polar links unlock...")

      const orderId = new URLSearchParams(window.location.search).get("order_id")

      if (!orderId) {
        console.error("[v0] Payment Success: No order ID in URL params")
        setStatus("error")
        return
      }

      // Call verification endpoint to check order and unlock links
      const response = await fetch("/api/polar/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId,
          type: "links_unlock",
          outfitId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log("[v0] Payment Success: Links unlocked!", result)
        setStatus("success")

        sessionStorage.setItem(
          processedKey,
          JSON.stringify({
            status: "success",
            timestamp: Date.now(),
          }),
        )
      } else {
        console.error("[v0] Payment Success: Verification failed:", result.error)
        setStatus("error")
      }
    } catch (error) {
      console.error("[v0] Payment Success: Error verifying Polar links:", error)
      setStatus("error")
    }
  }

  useEffect(() => {
    const fetchOutfit = async () => {
      if (status === "success" && outfitId && user) {
        const { data, error } = await supabaseAuth.from("generated_outfits").select("*").eq("id", outfitId).single()

        if (data && !error) {
          console.log(" Fetched outfit data:", data)
          setPurchasedOutfit(data)
        }
      }
    }

    fetchOutfit()
  }, [status, outfitId, user])

  const getItemImage = (item) => {
    if (!item) return "/placeholder.svg"

    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0]
    }

    if (typeof item.image === "string") {
      if (item.image.startsWith("[")) {
        try {
          const parsed = JSON.parse(item.image)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return typeof parsed[0] === "string" ? parsed[0] : parsed[0].url
          }
        } catch (e) {}
      }
      return item.image
    }

    return "/placeholder.svg"
  }

  if (status === "processing") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6 max-w-md w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent"
          >
            <Loader2 className="w-10 h-10 animate-spin" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-medium">Verifying Payment...</h1>
            <p className="text-sm md:text-base text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6 max-w-md w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500"
          >
            <AlertCircle className="w-10 h-10" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-medium">Payment Verification Failed</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
            <Link href="/outfits">Return to Outfits</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-8 max-w-4xl w-full py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-serif font-medium">Payment Successful!</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            {paymentType === "credits"
              ? "Your credits have been added to your account!"
              : "Your shopping links have been unlocked! You can now access all product links."}
          </p>
        </div>

        {paymentType === "credits" && creditsResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="py-8 space-y-6 bg-accent/5 rounded-2xl border border-border px-6 max-w-md mx-auto"
          >
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto">
              <Coins className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-serif">+{creditsResult.creditsAdded}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Credits Added
              </p>
            </div>
            <div className="pt-4 border-t border-border space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest">New Balance</p>
              <p className="text-2xl md:text-3xl font-serif">{creditsResult.newBalance} credits</p>
            </div>
          </motion.div>
        )}

        {purchasedOutfit && paymentType === "outfit_unlock" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-bold">
                Your Unlocked Outfit
              </p>
              <h2 className="text-2xl md:text-3xl font-serif">{purchasedOutfit.name || "Curated Look"}</h2>
              <p className="text-3xl md:text-4xl font-serif text-foreground/80">
                ${purchasedOutfit.total_price?.toFixed(0) || "0"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {purchasedOutfit.items &&
                purchasedOutfit.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                      <Image
                        src={getItemImage(item) || "/placeholder.svg"}
                        alt={item.name || "Product"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-2 leading-snug">{item.name || "Fashion Item"}</p>
                        <p className="text-lg font-serif">${item.price?.toFixed(0) || "0"}</p>
                      </div>

                      {item.url && (
                        <Button asChild className="w-full group/btn" size="sm">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            Shop Now
                            <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-8 space-y-3 max-w-md mx-auto"
        >
          {outfitId && paymentType === "outfit_unlock" && (
            <Button asChild size="lg" className="w-full">
              <Link href={`/outfit/${outfitId}`}>
                View Full Outfit Details <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
          {paymentType === "credits" && (
            <Button asChild size="lg" className="w-full">
              <Link href="/generate">
                Generate New Outfit <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
            <Link href="/outfits">Browse All Outfits</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
