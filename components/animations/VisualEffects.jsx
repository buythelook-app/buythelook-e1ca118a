"use client"

import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgress({ className = "", position = "top" }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      className={`fixed left-0 right-0 h-[2px] bg-primary-foreground/80 origin-left z-[60] ${
        position === "top" ? "top-0" : "bottom-0"
      } ${className}`}
      style={{ scaleX }}
    />
  )
}
