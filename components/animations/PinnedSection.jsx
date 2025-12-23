"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function PinnedSection({ children, className = "", pinnedContent, scrollingContent }) {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  if (pinnedContent && scrollingContent) {
    return (
      <div ref={containerRef} className={`relative min-h-[200vh] ${className}`}>
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <motion.div style={{ opacity }}>{pinnedContent}</motion.div>
        </div>
        <div className="relative z-10">{scrollingContent}</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
    </div>
  )
}

export function ParallaxContainer({ children, className = "", speed = 0.5, direction = "up" }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const multiplier = direction === "up" ? -1 : 1
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}

export function ScaleOnScroll({ children, className = "", startScale = 0.8, endScale = 1 }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [startScale, endScale])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ scale, opacity }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}

export function RotateOnScroll({ children, className = "", startRotation = -5, endRotation = 0 }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  const rotate = useTransform(scrollYProgress, [0, 1], [startRotation, endRotation])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ rotate }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}
