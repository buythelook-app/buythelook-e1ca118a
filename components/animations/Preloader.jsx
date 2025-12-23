"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Preloader({ onComplete, duration = 3000 }) {
  const [phase, setPhase] = useState("loading")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    // Phase transitions
    const revealTimer = setTimeout(() => {
      setPhase("revealing")
    }, duration * 0.6)

    const exitTimer = setTimeout(() => {
      setPhase("exiting")
    }, duration * 0.85)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(revealTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  const letterVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: i * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    exit: (i) => ({
      y: "-100%",
      opacity: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.03,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  const brandName = "BUY THE LOOK"
  const letters = brandName.split("")

  return (
    <AnimatePresence>
      {phase !== "exiting" ? null : (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] bg-foreground flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <motion.div
        key="preloader-content"
        className="fixed inset-0 z-[100] bg-foreground flex items-center justify-center overflow-hidden"
        animate={phase === "exiting" ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Background grain texture */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Animated lines */}
        <motion.div
          className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-foreground/10 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-foreground/10 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Main content */}
        <div className="relative text-center px-4">
          {/* Logo mark */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-16 h-16 mx-auto border border-primary-foreground/20 flex items-center justify-center">
              <motion.span
                className="text-2xl font-serif text-primary-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                BTL
              </motion.span>
            </div>
          </motion.div>
          

          {/* Brand name with letter animation */}
          <div className="overflow-hidden mb-8">
            <div className="flex justify-center flex-wrap gap-[2px]">
              {letters.map((letter, i) => (
                <span key={i} className="overflow-hidden inline-block">
                  <motion.span
                    className={`inline-block text-xl sm:text-2xl md:text-3xl tracking-[0.3em] font-light ${
                      letter === " " ? "w-4" : ""
                    } text-primary-foreground`}
                    custom={i}
                    initial="hidden"
                    animate={phase === "exiting" ? "exit" : "visible"}
                    variants={letterVariants}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                </span>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <motion.p
            className="text-primary-foreground/50 text-xs tracking-[0.4em] uppercase mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Your AI Personal Stylist
          </motion.p>

          {/* Progress bar */}
          <div className="w-48 mx-auto">
            <div className="h-[1px] bg-primary-foreground/10 overflow-hidden">
              <motion.div
                className="h-full bg-primary-foreground/60"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </div>
            <motion.span
              className="block mt-3 text-[10px] tracking-[0.3em] text-primary-foreground/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.min(Math.round(progress), 100)}%
            </motion.span>
          </div>
        </div>

        {/* Corner decorations */}
        <motion.div
          className="absolute top-8 left-8 w-12 h-12 border-l border-t border-primary-foreground/10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-primary-foreground/10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
