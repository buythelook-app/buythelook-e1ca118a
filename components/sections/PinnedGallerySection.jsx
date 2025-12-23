"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function PinnedGallerySection() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Transform for each image
  const y1 = useTransform(scrollYProgress, [0, 0.25], ["0%", "-10%"])
  const y2 = useTransform(scrollYProgress, [0.25, 0.5], ["100%", "0%"])
  const y3 = useTransform(scrollYProgress, [0.5, 0.75], ["100%", "0%"])

  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0])
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.5, 0.6], [0, 1, 1, 0])
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.8], [0, 1, 1])

  const scale1 = useTransform(scrollYProgress, [0, 0.25], [1, 0.9])
  const scale2 = useTransform(scrollYProgress, [0.25, 0.5], [1.1, 1])
  const scale3 = useTransform(scrollYProgress, [0.5, 0.75], [1.1, 1])

  const textOpacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1])
  const textY = useTransform(scrollYProgress, [0.7, 0.85], [50, 0])

  return (
   <section
  ref={containerRef}
  className="relative h-[400vh] bg-foreground"
>
  <div className="sticky top-0 h-screen overflow-hidden">
    {/* Image 1 */}
    <motion.div
      className="absolute inset-0"
      style={{ y: y1, opacity: opacity1, scale: scale1 }}
    >
      <img
        src="/hero-fashion.jpg"
        alt="Fashion editorial 1"
        className="w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-foreground/30" />
    </motion.div>

    {/* Image 2 */}
    <motion.div
      className="absolute inset-0"
      style={{ y: y2, opacity: opacity2, scale: scale2 }}
    >
      <img
        src="/Bohemian.jpg"
        alt="Fashion editorial 2"
        className="w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-foreground/30" />
    </motion.div>

    {/* Image 3 with text overlay */}
    <motion.div
      className="absolute inset-0"
      style={{ y: y3, opacity: opacity3, scale: scale3 }}
    >
      <img
        src="/formal.jpg"
        alt="Fashion editorial 3"
        className="w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-foreground/50" />
    </motion.div>

    {/* Centered text */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center text-center px-4"
      style={{ opacity: textOpacity, y: textY }}
    >
      <div>
        <span className="block text-[10px] tracking-[0.5em] uppercase text-primary-foreground/60 mb-4">
          The Journey
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-primary-foreground">
          Elegance in <span className="italic font-light">Motion</span>
        </h2>
      </div>
    </motion.div>

    {/* Progress indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <div className="w-24 h-[2px] bg-primary-foreground/20 overflow-hidden">
        <motion.div
          className="h-full bg-primary-foreground"
          style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
        />
      </div>
    </div>
  </div>
</section>
  )
}

export default PinnedGallerySection
