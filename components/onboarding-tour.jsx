"use client"

import { useState, useEffect, useCallback } from "react"
import Joyride, { STATUS, ACTIONS, EVENTS } from "react-joyride"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useAuth } from "@/components/auth-provider"
import { FashionFairy } from "./fashion-fairy"

const QUIZ_TOUR_STEPS = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome, Gorgeous!",
    content: "I'm Stella, your personal style fairy! Let me guide you through creating your perfect fashion profile.",
  },
  {
    target: '[data-tour="quiz-start"]',
    placement: "bottom-start",
    disableBeacon: true,
    title: "Your Style Journey",
    content: "Choose how you'd like to share your style - take our fun quiz or upload a photo for AI analysis.",
  },
  {
    target: '[data-tour="progress-bar"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Track Your Progress",
    content: "Watch your style profile come to life! This progress bar shows your journey through the quiz.",
  },
  {
    target: '[data-tour="quiz-options"]',
    placement: "right",
    disableBeacon: true,
    title: "Express Yourself",
    content: "Simply tap the options that speak to you. There are no wrong answers here!",
  },
  {
    target: '[data-tour="quiz-navigation"]',
    placement: "top",
    disableBeacon: true,
    title: "Ready to Shine?",
    content: "Use these buttons to navigate. Once complete, I'll curate fabulous outfits just for you!",
  },
]

const CREDITS_TOUR_STEPS = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to Credits!",
    content: "This is where you can power up your style journey. Each credit unlocks AI-curated outfit magic!",
  },
  {
    target: '[data-tour="credits-packages"]',
    placement: "top",
    disableBeacon: true,
    title: "Choose Your Package",
    content: "Select from our elegant credit packages. More credits mean more stunning outfit combinations!",
  },
  {
    target: '[data-tour="credits-popular"]',
    placement: "left",
    disableBeacon: true,
    title: "Most Popular Choice",
    content: "Our fashionistas love this one! It's the perfect balance of value and style possibilities.",
  },
]

const OUTFITS_TOUR_STEPS = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Your Fashion Collection!",
    content:
      "Welcome to your personal wardrobe, darling! Here you'll find all the fabulous outfits I've curated for you.",
  },
  {
    target: '[data-tour="outfits-filters"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Filter Your Looks",
    content:
      "Use these tabs to filter your collection. View all outfits, just the unlocked ones, or those ready to shop!",
  },
  {
    target: '[data-tour="outfits-grid"]',
    placement: "top",
    disableBeacon: true,
    title: "Your Curated Outfits",
    content:
      "Each card shows a complete outfit I've styled for you. Tap any outfit to see all pieces and where to buy them!",
  },
]

function CustomTooltip({ continuous, index, step, backProps, primaryProps, skipProps, tooltipProps, size }) {
  const isFirst = index === 0
  const isLast = index === size - 1

  return (
    <div {...tooltipProps} className="z-[10001] w-[92vw] max-w-[380px] sm:max-w-[420px]">
      {/* Main Card */}
      <div className="relative bg-white border-2 border-amber-400 rounded-xl shadow-2xl overflow-visible">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-amber-500 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-amber-500 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-amber-500 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-amber-500 rounded-br-xl" />

        {/* Content */}
        <div className="px-4 pt-3 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
          {/* Fairy - smaller and no duplicate badge */}
          <div className="flex justify-center mb-1">
            <div className="transform scale-50 sm:scale-[0.6] origin-center -my-4">
              <FashionFairy isTalking={true} size="sm" />
            </div>
          </div>

          {/* Step Counter */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-5 h-px bg-amber-400" />
            <span className="text-[10px] font-medium tracking-widest text-amber-600">
              STEP {index + 1} OF {size}
            </span>
            <div className="w-5 h-px bg-amber-400" />
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-serif font-semibold text-center text-black mb-1.5">{step.title}</h3>

          {/* Content */}
          <p className="text-xs sm:text-sm text-center text-neutral-600 leading-relaxed mb-3">{step.content}</p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-1 mb-3">
            {Array.from({ length: size }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-amber-500" : i < index ? "w-1.5 bg-amber-400" : "w-1.5 bg-neutral-300"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2">
            {!isFirst ? (
              <button
                {...backProps}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-black transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              {...skipProps}
              className="px-2 py-1.5 text-[10px] font-medium tracking-wide text-neutral-400 hover:text-neutral-600 transition-colors uppercase"
            >
              Skip
            </button>

            <button
              {...primaryProps}
              className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              {isLast ? "LET'S GO!" : "NEXT"}
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingTour({ pageType = "quiz" }) {
  const { user } = useAuth()
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)

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

  useEffect(() => {
    const checkTourStatus = async () => {
      if (!user?.id) return

      const config = getTourConfig()

      try {
        const { data, error } = await supabaseAuth.from("profiles").select(config.field).eq("id", user.id).single()

        if (error) {
          console.log("[v0] Tour status check error:", error)
          return
        }

        if (!data?.[config.field]) {
          setSteps(config.steps)
          setTimeout(() => setRun(true), 800)
        }
      } catch (err) {
        console.log("[v0] Tour check failed:", err)
      }
    }

    checkTourStatus()
  }, [user?.id, getTourConfig])

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

  const handleJoyrideCallback = useCallback(
    (data) => {
      const { action, status, type, index } = data

      if (type === EVENTS.STEP_AFTER) {
        if (action === ACTIONS.NEXT) {
          setStepIndex(index + 1)
        } else if (action === ACTIONS.PREV) {
          setStepIndex(index - 1)
        }
      }

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false)
        completeTour()
      }
    },
    [completeTour],
  )

  if (!run || steps.length === 0) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress={false}
      disableOverlayClose
      disableScrolling={false}
      scrollToFirstStep
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      floaterProps={{
        disableAnimation: false,
        offset: 16,
        styles: {
          floater: {
            filter: "none",
          },
        },
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#000",
          overlayColor: "rgba(0, 0, 0, 0.75)",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        },
        spotlight: {
          borderRadius: 12,
          boxShadow: "0 0 0 4px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.4)",
        },
        beacon: {
          display: "none",
        },
      }}
    />
  )
}
