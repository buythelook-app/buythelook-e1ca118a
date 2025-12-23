"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "../animations/MagneticElements";
import { GlitchText } from "../animations/TextEffects";

export function CTASection({ onStartQuiz }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section 
      ref={containerRef}
      className="py-20 sm:py-24 md:py-28 lg:py-36 bg-background relative overflow-hidden"
    >
      {/* Background animated shapes */}
      <motion.div
        className="absolute top-1/4 -left-20 w-40 h-40 rounded-full border border-foreground/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-60 h-60 rounded-full border border-foreground/5"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10"
        style={{ scale, opacity }}
      >
        {/* Decorative top element */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-[1px] h-16 bg-gradient-to-b from-transparent via-foreground/20 to-foreground/20 mx-auto mb-8 origin-top"
        />

        <div className="overflow-hidden mb-4 sm:mb-6">
          <motion.h2
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-foreground"
          >
            Ready for Your{" "}
            <motion.span 
              className="italic font-light inline-block"
              whileHover={{ scale: 1.05 }}
            >
              <GlitchText>Perfect</GlitchText>
            </motion.span>{" "}
            Wardrobe?
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base sm:text-lg text-muted-foreground font-light mb-10 sm:mb-12 max-w-2xl mx-auto"
        >
          Join thousands getting AI-styled daily.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <MagneticButton
            onClick={onStartQuiz}
            className="group w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 bg-foreground text-background hover:bg-foreground/90 text-sm font-medium tracking-wide transition-all duration-300 relative overflow-hidden"
            strength={0.25}
          >
            {/* Button shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            
            <span className="relative z-10 flex items-center justify-center gap-3">
              Start Style Quiz
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </span>
          </MagneticButton>
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 flex justify-center gap-2"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-foreground/20"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
