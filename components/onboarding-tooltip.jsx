"use client"

import { useState, useEffect } from "react"
import { FashionFairy } from "./fashion-fairy"

export function OnboardingTooltip({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  totalSteps,
  size = "md",
}) {
  const [speaking, setSpeaking] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    setSpeaking(true)

    const showTimer = setTimeout(() => setVisible(true), 150)
    const speakTimer = setTimeout(() => setSpeaking(false), 2000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(speakTimer)
    }
  }, [index])

  return (
    <div
      {...tooltipProps}
      className={`
        onboarding-tooltip
        w-[90vw] max-w-[380px] sm:max-w-[420px]
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}
    >
      <div className="relative bg-white/98 backdrop-blur-sm border border-amber-100/80 shadow-2xl shadow-amber-900/10 overflow-visible">
        {/* Top decorative line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Corner flourishes */}
        <svg
          className="absolute top-2 left-2 w-6 h-6 text-amber-300/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M2 12 L2 2 L12 2" />
        </svg>
        <svg
          className="absolute top-2 right-2 w-6 h-6 text-amber-300/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M22 12 L22 2 L12 2" />
        </svg>
        <svg
          className="absolute bottom-2 left-2 w-6 h-6 text-amber-300/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M2 12 L2 22 L12 22" />
        </svg>
        <svg
          className="absolute bottom-2 right-2 w-6 h-6 text-amber-300/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M22 12 L22 22 L12 22" />
        </svg>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {/* Fairy character */}
          <div className="flex justify-center mb-2">
            <FashionFairy speaking={speaking} size={size} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-6 mb-3">
            <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-amber-300" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.15em] text-amber-600 uppercase">
              Step {index + 1} of {totalSteps}
            </span>
            <div className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent to-amber-300" />
          </div>

          {/* Title */}
          {step.title && (
            <h3 className="text-lg sm:text-xl font-serif text-center mb-2 text-neutral-900 tracking-tight">
              {step.title}
            </h3>
          )}

          {/* Content */}
          <p className="text-center text-neutral-600 leading-relaxed text-xs sm:text-sm mb-4 font-light px-2">
            {step.content}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-5 sm:w-6 bg-gradient-to-r from-amber-400 to-amber-500"
                    : i < index
                      ? "w-2 sm:w-3 bg-amber-400"
                      : "w-2 sm:w-3 bg-neutral-200"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {index > 0 ? (
              <button
                {...backProps}
                className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors px-2 sm:px-3 py-2"
              >
                Back
              </button>
            ) : (
              <div className="w-12" />
            )}

            <button
              {...skipProps}
              className="text-[9px] sm:text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors tracking-widest uppercase"
            >
              Skip
            </button>

            <button
              {...primaryProps}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-neutral-900 text-white text-xs tracking-wider uppercase hover:bg-neutral-800 transition-all duration-300 hover:shadow-lg group"
            >
              <span className="flex items-center gap-1.5">
                {isLastStep ? "Start" : "Next"}
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
      </div>
    </div>
  )
}
