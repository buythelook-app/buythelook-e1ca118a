"use client"

import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

export function TiltCard({ children, className = "", tiltAmount = 10, glareEnabled = true, scale = 1.02 }) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltAmount, -tiltAmount]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltAmount, tiltAmount]), {
    stiffness: 200,
    damping: 20,
  })

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"])

  const handleMouseMove = (e) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      data-cursor="image"
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      animate={{ scale: isHovered ? scale : 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}

      {glareEnabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit"
          style={{ opacity: isHovered ? 0.15 : 0 }}
        >
          <motion.div
            className="absolute w-[200%] h-[200%] bg-gradient-to-br from-white/80 via-white/20 to-transparent"
            style={{
              left: glareX,
              top: glareY,
              transform: "translate(-50%, -50%)",
            }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
