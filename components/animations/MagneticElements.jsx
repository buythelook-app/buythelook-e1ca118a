"use client"

import { useRef, useState } from "react"
import { motion, useSpring } from "framer-motion"

export function MagneticButton({ children, className = "", onClick, strength = 0.3 }) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useSpring(0, { stiffness: 300, damping: 20 })
  const y = useSpring(0, { stiffness: 300, damping: 20 })

  const handleMouseMove = (e) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    x.set(distanceX * strength)
    y.set(distanceY * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <motion.button
      ref={ref}
      data-cursor="magnetic"
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ x, y }}
    >
      <motion.span
        className="inline-flex items-center justify-center w-full h-full"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  )
}

export function MagneticLink({ children, href = "#", className = "", onClick, strength = 0.2 }) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useSpring(0, { stiffness: 400, damping: 25 })
  const y = useSpring(0, { stiffness: 400, damping: 25 })

  const handleMouseMove = (e) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    x.set(distanceX * strength)
    y.set(distanceY * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      data-cursor="link"
      className={`inline-block ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{ x, y }}
    >
      <motion.span className="inline-block relative" animate={{ scale: isHovered ? 1.1 : 1 }}>
        {children}
        <motion.span
          className="absolute bottom-0 left-0 w-full h-[1px] bg-current origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.span>
    </motion.a>
  )
}
