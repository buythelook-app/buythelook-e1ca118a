"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabaseAuth } from "@/lib/supabase-auth-client"

const QUIZ_TOUR_STEPS = [
  {
    element: "body",
    popover: {
      title: "Welcome, Gorgeous!",
      description:
        "I'm Stella, your personal style fairy! Let me guide you through creating your perfect fashion profile.",
      side: "center",
      align: "center",
    },
  },
  {
    element: '[data-tour="quiz-start"]',
    popover: {
      title: "Your Style Journey",
      description: "Choose how you'd like to share your style - take our fun quiz or upload a photo for AI analysis.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="progress-bar"]',
    popover: {
      title: "Track Your Progress",
      description: "Watch your style profile come to life! This progress bar shows your journey through the quiz.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="quiz-options"]',
    popover: {
      title: "Express Yourself",
      description: "Simply tap the options that speak to you. There are no wrong answers here!",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="quiz-navigation"]',
    popover: {
      title: "Ready to Shine?",
      description: "Use these buttons to navigate. Once complete, I'll curate fabulous outfits just for you!",
      side: "top",
      align: "center",
    },
  },
]

const CREDITS_TOUR_STEPS = [
  {
    element: "body",
    popover: {
      title: "Welcome to Credits!",
      description: "This is where you can power up your style journey. Each credit unlocks AI-curated outfit magic!",
      side: "center",
      align: "center",
    },
  },
  {
    element: '[data-tour="credits-packages"]',
    popover: {
      title: "Choose Your Package",
      description: "Select from our elegant credit packages. More credits mean more stunning outfit combinations!",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="credits-popular"]',
    popover: {
      title: "Most Popular Choice",
      description: "Our fashionistas love this one! It's the perfect balance of value and style possibilities.",
      side: "left",
      align: "center",
    },
  },
]

const OUTFITS_TOUR_STEPS = [
  {
    element: "body",
    popover: {
      title: "Your Fashion Collection!",
      description:
        "Welcome to your personal wardrobe, darling! Here you'll find all the fabulous outfits I've curated for you.",
      side: "center",
      align: "center",
    },
  },
  {
    element: '[data-tour="outfits-filters"]',
    popover: {
      title: "Filter Your Looks",
      description:
        "Use these tabs to filter your collection. View all outfits, just the unlocked ones, or those ready to shop!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="outfits-grid"]',
    popover: {
      title: "Your Curated Outfits",
      description:
        "Each card shows a complete outfit I've styled for you. Tap any outfit to see all pieces and where to buy them!",
      side: "top",
      align: "center",
    },
  },
]

export default function OnboardingTour({ pageType = "quiz" }) {
  const { user } = useAuth()
  const [driverObj, setDriverObj] = useState(null)

  const getTourConfig = useCallback(() => {
    switch (pageType) {
      case "credits":
        return { steps: CREDITS_TOUR_STEPS, field: "credits_tour_completed" }
      case "outfits":
        return { steps: OUTFITS_TOUR_STEPS, field: "outfits_tour_completed" }
      default:
        return { steps: QUIZ_TOUR_STEPS, field: "onboarding_completed" }
    }
  }, [pageType])

  const completeTour = useCallback(async () => {
    if (!user?.id) return

    const config = getTourConfig()

    try {
      await supabaseAuth
        .from("profiles")
        .update({ [config.field]: true })
        .eq("id", user.id)
    } catch (err) {
      console.log("[v0] Failed to update tour status:", err)
    }
  }, [user?.id, getTourConfig])

  useEffect(() => {
    const initTour = async () => {
      if (!user?.id) return

      const config = getTourConfig()

      try {
        // Check if tour already completed
        const { data, error } = await supabaseAuth.from("profiles").select(config.field).eq("id", user.id).single()

        if (error) {
          console.log("[v0] Tour status check error:", error)
          return
        }

        if (data?.[config.field]) {
          return // Tour already completed
        }

        // Dynamically import driver.js (client-side only)
        const { driver } = await import("driver.js")
        await import("driver.js/dist/driver.css")

        // Create custom popover class for styling
        const driverInstance = driver({
          showProgress: true,
          steps: config.steps,
          animate: true,
          overlayColor: "rgba(0, 0, 0, 0.75)",
          stagePadding: 8,
          stageRadius: 12,
          allowClose: true,
          doneBtnText: "LET'S GO!",
          nextBtnText: "NEXT →",
          prevBtnText: "← BACK",
          showButtons: ["next", "previous", "close"],
          popoverClass: "btl-tour-popover",
          onDestroyStarted: () => {
            completeTour()
            driverInstance.destroy()
          },
          onDestroyed: () => {
            completeTour()
          },
        })

        setDriverObj(driverInstance)

        // Start tour after a small delay
        setTimeout(() => {
          driverInstance.drive()
        }, 800)
      } catch (err) {
        console.log("[v0] Tour initialization failed:", err)
      }
    }

    initTour()

    // Cleanup on unmount
    return () => {
      if (driverObj) {
        driverObj.destroy()
      }
    }
  }, [user?.id, getTourConfig, completeTour])

  // Return null - driver.js handles its own DOM
  return null
}
