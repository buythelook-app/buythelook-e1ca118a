"use client"

import { useRef, useMemo } from "react"
import { motion, useInView } from "framer-motion"

export function SplitText({ children, className = "", delay = 0, type = "words", animation = "slide" }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const items = useMemo(() => {
    if (type === "chars") return children.split("")
    if (type === "words") return children.split(" ")
    return [children]
  }, [children, type])

  const getStaggerDelay = () => {
    switch (type) {
      case "chars": return 0.02
      case "words": return 0.06
      default: return 0.1
    }
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: getStaggerDelay(),
        delayChildren: delay,
      },
    },
  }

  const getItemVariants = () => {
    switch (animation) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" },
          },
        }
      case "slide":
        return {
          hidden: { y: "100%", opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          },
        }
      case "scale":
        return {
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          },
        }
      case "rotate":
        return {
          hidden: { rotateX: -90, opacity: 0 },
          visible: {
            rotateX: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          },
        }
      case "wave":
        return {
          hidden: { y: 20, opacity: 0 },
          visible: (i) => ({
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.5,
              ease: "easeOut",
              delay: i * 0.03,
            },
          }),
        }
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{ perspective: animation === "rotate" ? "1000px" : undefined }}
    >
      {items.map((item, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={getItemVariants()}
            custom={i}
            style={{ transformOrigin: "center bottom" }}
          >
            {item}
            {type === "words" && i < items.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.div>
  )
}

export function AnimatedCounter({ value, className = "", duration = 2, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const numericValue = typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value
  const suffix = typeof value === "string" ? value.replace(/[0-9]/g, "") : ""

  return (
    <span ref={ref} className={className}>
      {isInView ? (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {numericValue}
          </motion.span>
          {suffix}
        </motion.span>
      ) : (
        <span className="opacity-0">{value}</span>
      )}
    </span>
  )
}
