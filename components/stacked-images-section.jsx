"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function StackedImagesSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  })

  const leftRotate = useTransform(scrollYProgress, [0, 1], [-15, -15])
  const leftX = useTransform(scrollYProgress, [0, 1], [-200, 0])
  const centerX = useTransform(scrollYProgress, [0, 1], [0, 0])
  const rightRotate = useTransform(scrollYProgress, [0, 1], [15, 15])
  const rightX = useTransform(scrollYProgress, [0, 1], [200, 0])
  const commonY = useTransform(scrollYProgress, [0, 1], [100, 0])

  return (
   <>
    <section
      ref={containerRef}
      className="relative py-32 md:py-48 lg:py-64 bg-white overflow-hidden"
      id="stacked-images"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-20 md:mb-32"
        >
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4">
            Curated Collections
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-neutral-900">
            Your Work,{" "}
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="italic font-light"
            >
              Curated
            </motion.span>
          </h2>
        </motion.div>

        {/* Stacked Images Container */}
        <div className="relative h-[500px] md:h-[700px] lg:h-[800px] flex items-center justify-center perspective">
          {/* Left Image - Rotates -15deg on scroll */}
          <motion.div
            className="absolute w-80 md:w-96 lg:w-[420px] h-auto md:h-[500px] lg:h-[600px]"
            style={{
              x: leftX,
              y: commonY,
              rotateZ: leftRotate,
              zIndex: 1,
            }}
            initial={{ opacity: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <img src="/Bohemian.jpg" alt="Bohemian curated look" className="w-full h-full object-cover shadow-2xl" />
          </motion.div>

          {/* Center Image - Static rotation, stays centered */}
          <motion.div
            className="absolute w-96 md:w-[420px] lg:w-[480px] h-auto md:h-[560px] lg:h-[680px]"
            style={{
              x: centerX,
              y: commonY,
              zIndex: 2,
            }}
            initial={{ opacity: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <img
              src="/formal.jpg"
              alt="Formal curated look"
              className="w-full h-full object-cover shadow-2xl border-8 border-white"
            />
          </motion.div>

          {/* Right Image - Rotates +15deg on scroll */}
          <motion.div
            className="absolute w-80 md:w-96 lg:w-[420px] h-auto md:h-[500px] lg:h-[600px]"
            style={{
              x: rightX,
              y: commonY,
              rotateZ: rightRotate,
              zIndex: 1,
            }}
            initial={{ opacity: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <img src="/street.jpg" alt="Streetwear curated look" className="w-full h-full object-cover shadow-2xl" />
          </motion.div>

          {/* Text Overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="text-center">
              <h3 className="text-5xl md:text-6xl lg:text-7xl font-serif text-neutral-900/20 mix-blend-multiply">
                Your
                <br />
                <span className="italic font-light">Work</span>
              </h3>
            </div>
          </motion.div>
        </div>

        {/* Animated Scroll Indicator */}
        <motion.div
          className="flex flex-col items-center justify-center gap-2 mt-16 md:mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-xs tracking-[0.2em] uppercase text-neutral-400">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="w-6 h-6 border border-neutral-300 flex items-center justify-center"
          >
            <div className="w-1 h-1 bg-neutral-900" />
          </motion.div>
        </motion.div>
      </div>
    </section></>
  )
}
