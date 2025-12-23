"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function FadeInView({ children, delay = 0, className = "" }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedHeroText({ children, delay = 0, className = "" }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 1,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  )
}
