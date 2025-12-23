"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TextScramble } from "../animations/TextEffects";

export function HowItWorksSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const steps = [
    {
      step: "01",
      title: "Share Your Style",
      description: "Quick quiz: preferences, body type, occasion",
      icon: "✦",
    },
    {
      step: "02",
      title: "AI Curates Your Look",
      description: "Thousands of pieces analyzed in seconds",
      icon: "◈",
    },
    {
      step: "03",
      title: "Shop Instantly",
      description: "One-click purchase for every item",
      icon: "✧",
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-20 sm:py-24 md:py-28 lg:py-36 bg-cream relative overflow-hidden" 
      id="how-it-works"
    >
      {/* Background number */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-serif text-foreground/[0.02] pointer-events-none select-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.5 }}
      >
        3
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "60px" } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-[1px] bg-foreground/20 mx-auto mb-6"
          />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 sm:mb-5"
          >
            How It Works
          </motion.span>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              animate={isInView ? { y: 0 } : {}}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-foreground"
            >
              Get Styled in 3 <span className="italic font-light">steps</span>
            </motion.h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-6 md:gap-12">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={`group text-center sm:text-left relative ${i === 2 ? "sm:col-span-2 md:col-span-1" : ""}`}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <motion.div
                  className="hidden md:block absolute top-12 left-full w-full h-[1px] bg-gradient-to-r from-foreground/10 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: 0.8 + i * 0.2 }}
                  style={{ transformOrigin: "left" }}
                />
              )}

              {/* Step number with icon */}
              <motion.div 
                className="relative inline-block mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-6xl sm:text-7xl md:text-8xl font-serif text-foreground/10 group-hover:text-foreground/20 transition-colors duration-500">
                  {item.step}
                </span>
                <motion.span
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  {item.icon}
                </motion.span>
              </motion.div>

              <h3 className="text-lg sm:text-xl font-serif text-foreground mb-2 sm:mb-3">
                <TextScramble delay={0.5 + i * 0.2}>
                  {item.title}
                </TextScramble>
              </h3>
              
              <motion.p 
                className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.15 }}
              >
                {item.description}
              </motion.p>

              {/* Hover line */}
              <motion.div
                className="w-0 h-[1px] bg-foreground/30 mt-4 mx-auto sm:mx-0 group-hover:w-12 transition-all duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
