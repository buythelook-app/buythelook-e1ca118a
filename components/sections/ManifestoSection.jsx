"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

export function ManifestoSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  const rotateReverse = useTransform(scrollYProgress, [0, 1], [3, -3]);

  const words = "Style is not about following trends. It's about expressing who you are.".split(" ");

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center py-20 sm:py-32 bg-cream overflow-hidden"
    >
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-1/4 -left-20 w-40 h-40 rounded-full border border-foreground/5"
        style={{ rotate }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full border border-foreground/5"
        style={{ rotate: rotateReverse }}
      />

      <motion.div 
        className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center"
        style={{ scale, opacity }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="inline-block text-[10px] tracking-[0.5em] uppercase text-muted-foreground mb-8"
        >
          Our Philosophy
        </motion.span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[1.1] text-foreground">
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
              <motion.span
                className="inline-block"
                initial={{ y: "100%", rotateX: -80 }}
                animate={isInView ? { y: 0, rotateX: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.1 + i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: "bottom", perspective: "1000px" }}
              >
                {word === "expressing" || word === "you" || word === "are." ? (
                  <span className="italic font-light">{word}</span>
                ) : word}
              </motion.span>
            </span>
          ))}
        </h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-[1px] bg-foreground/20 mx-auto mt-12 origin-center"
        />
      </motion.div>
    </section>
  );
}
