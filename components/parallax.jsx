"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

// Horizontal parallax for decorative lines and elements
export function HorizontalParallax({ children, speed = 0.5, direction = "left", className = "" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const multiplier = direction === "right" ? 1 : -1
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, 200 * speed * multiplier]), {
    stiffness: 100,
    damping: 30,
  })

  return (
    <motion.div ref={ref} style={{ x }} className={className}>
      {children}
    </motion.div>
  )
}

// Scale on scroll effect for dramatic reveals
export function ScaleOnScroll({ children, className = "" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.85, 1]), {
    stiffness: 100,
    damping: 20,
  })
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.5], [0, 1]), {
    stiffness: 100,
    damping: 20,
  })

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  )
}

// Parallax section with vertical movement
export function ParallaxSection({ children, offset = 50, className = "" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useSpring(useTransform(scrollYProgress, [0, 1], [offset, -offset]), {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

// Parallax layer for background effects
export function ParallaxLayer({ children, speed = 0.5, direction = "up", className = "" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const multiplier = direction === "down" ? 1 : -1
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, 200 * speed * multiplier]), {
    stiffness: 100,
    damping: 30,
  })

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
