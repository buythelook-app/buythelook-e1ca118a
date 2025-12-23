"use client"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

export function TextReveal({ children, className = "", delay = 0, splitBy = "words" }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()

  const text = typeof children === "string" ? children : ""

  const splitText = () => {
    if (splitBy === "chars") return text.split("")
    if (splitBy === "words") return text.split(" ")
    return [text]
  }

  const items = splitText()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: splitBy === "chars" ? 0.02 : 0.08,
        delayChildren: delay,
      },
    },
  }

  const itemVariants = {
    hidden: {
      y: "100%",
      opacity: 0,
      rotateX: -90,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      style={{ perspective: "1000px" }}
    >
      {items.map((item, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={itemVariants}
            style={{ transformOrigin: "bottom" }}
          >
            {item}
            {splitBy === "words" && i < items.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.div>
  )
}

export function MaskRevealText({ children, className = "", delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : { y: "100%" }}
        transition={{
          duration: 1,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-foreground origin-left"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: [0, 1, 1, 0] } : { scaleX: 0 }}
        transition={{
          duration: 1.2,
          delay,
          times: [0, 0.4, 0.6, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: isInView ? "right" : "left" }}
      />
    </div>
  )
}

export function WordByWordReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const words = typeof children === "string" ? children.split(" ") : []

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: delay + i * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  )
}
