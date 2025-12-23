"use client"

import { useRef } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

export function ImageReveal({ children, className = "", delay = 0, direction = "up", parallax = false }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [50, -50])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: "100%", x: 0 }
      case "down": return { y: "-100%", x: 0 }
      case "left": return { x: "100%", y: 0 }
      case "right": return { x: "-100%", y: 0 }
    }
  }

  const getMaskOrigin = () => {
    switch (direction) {
      case "up": return "bottom"
      case "down": return "top"
      case "left": return "right"
      case "right": return "left"
    }
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Reveal mask */}
      <motion.div
        className="absolute inset-0 bg-foreground z-10"
        initial={{
          scaleY: direction === "up" || direction === "down" ? 1 : undefined,
          scaleX: direction === "left" || direction === "right" ? 1 : undefined,
        }}
        animate={isInView ? {
          scaleY: direction === "up" || direction === "down" ? 0 : undefined,
          scaleX: direction === "left" || direction === "right" ? 0 : undefined,
        } : {}}
        transition={{
          duration: 1.2,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: getMaskOrigin() }}
      />

      {/* Content with optional parallax */}
      <motion.div
        initial={{ scale: 1.2, ...getInitialPosition() }}
        animate={isInView ? { scale: 1, x: 0, y: 0 } : {}}
        transition={{
          duration: 1.4,
          delay: delay + 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={parallax ? { y: parallaxY, scale } : undefined}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

export function ClipReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={isInView ? { clipPath: "inset(0% 0 0 0)" } : {}}
        transition={{
          duration: 1.2,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function DiagonalReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
        animate={isInView ? { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" } : {}}
        transition={{
          duration: 1.4,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
