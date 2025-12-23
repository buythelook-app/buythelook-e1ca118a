"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function HorizontalScroll({ children, className = "", speed = 1, direction = "left" }) {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const baseX = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"]
  const x = useTransform(scrollYProgress, [0, 1], baseX.map((v) => {
    const num = parseFloat(v)
    return `${num * speed}%`
  }))

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <motion.div className="flex whitespace-nowrap will-change-transform" style={{ x }}>
        {children}
        {children}
      </motion.div>
    </div>
  )
}

export function HorizontalGallery({ images, className = "" }) {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])

  return (
    <div ref={containerRef} className={`overflow-hidden py-12 ${className}`}>
      <motion.div className="flex gap-6 will-change-transform" style={{ x }}>
        {images.map((image, i) => (
          <motion.div
            key={i}
            className="relative flex-shrink-0 w-[300px] md:w-[400px] lg:w-[500px] aspect-[3/4] overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export function MarqueeText({ text, className = "", speed = 20 }) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="inline-flex"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        <span className="inline-block px-4">{text}</span>
        <span className="inline-block px-4">{text}</span>
        <span className="inline-block px-4">{text}</span>
        <span className="inline-block px-4">{text}</span>
      </motion.div>
    </div>
  )
}
