"use client"

import { motion } from "framer-motion"

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-[8px] sm:text-[9px] md:text-[11px] font-medium tracking-[0.3em] uppercase text-primary-foreground/60">
          Scroll
        </span>
        <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-primary-foreground/40 to-transparent" />
      </motion.div>
    </motion.div>
  )
}
