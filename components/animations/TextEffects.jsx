"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"

export function TextScramble({ children, className = "", delay = 0 }) {
  const [displayText, setDisplayText] = useState("")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const chars = "!<>-_\\/[]{}—=+*^?#________"

  useEffect(() => {
    if (!isInView) return
    const text = children
    let iteration = 0
    const maxIterations = text.length * 3

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayText(
          text.split("").map((char, index) => {
            if (index < iteration / 3) return char
            return chars[Math.floor(Math.random() * chars.length)]
          }).join("")
        )
        iteration++
        if (iteration >= maxIterations) {
          setDisplayText(text)
          clearInterval(interval)
        }
      }, 30)
      return () => clearInterval(interval)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [children, isInView, delay])

  return <span ref={ref} className={className}>{displayText || children}</span>
}

export function GlitchText({ children, className = "" }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">{children}</span>
      {isHovered && (
        <>
          <span className="absolute top-0 left-0 text-red-500/70 animate-pulse" style={{ clipPath: "inset(0 0 50% 0)", transform: "translate(-2px, -1px)" }}>
            {children}
          </span>
          <span className="absolute top-0 left-0 text-cyan-500/70 animate-pulse" style={{ clipPath: "inset(50% 0 0 0)", transform: "translate(2px, 1px)" }}>
            {children}
          </span>
        </>
      )}
    </span>
  )
}

export function Typewriter({ text, className = "", speed = 50, delay = 0 }) {
  const [displayText, setDisplayText] = useState("")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let index = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index))
          index++
        } else {
          clearInterval(interval)
        }
      }, speed)
      return () => clearInterval(interval)
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [text, isInView, speed, delay])

  return (
    <span ref={ref} className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export function CountUp({ end, duration = 2, suffix = "", className = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let startTime = null
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration, isInView])

  return <span ref={ref} className={className}>{count}{suffix}</span>
}
