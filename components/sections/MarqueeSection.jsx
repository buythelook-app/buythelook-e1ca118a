"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function MarqueeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const marqueeItems = [
    "Luxury",
    "•",
    "Personalized",
    "•",
    "AI-Curated",
    "•",
    "Editorial",
    "•",
    "Effortless",
    "•",
    "Timeless",
    "•",
  ];

  return (
    <section ref={ref} className="py-16 sm:py-24 bg-foreground overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
      >
        {/* First marquee - left to right */}
        <div className="overflow-hidden mb-4">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {[...Array(4)].map((_, setIndex) => (
              <div key={setIndex} className="flex">
                {marqueeItems.map((item, i) => (
                  <span
                    key={`${setIndex}-${i}`}
                    className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif mx-4 sm:mx-6 md:mx-8 ${
                      item === "•" 
                        ? "text-primary-foreground/20" 
                        : "text-primary-foreground/10 hover:text-primary-foreground/30 transition-colors duration-500"
                    }`}
                  >
                    {item === "Personalized" || item === "Timeless" ? (
                      <span className="italic font-light">{item}</span>
                    ) : item}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Second marquee - right to left */}
        <div className="overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 35,
                ease: "linear",
              },
            }}
          >
            {[...Array(4)].map((_, setIndex) => (
              <div key={setIndex} className="flex">
                {[...marqueeItems].reverse().map((item, i) => (
                  <span
                    key={`${setIndex}-${i}`}
                    className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif mx-4 sm:mx-6 md:mx-8 ${
                      item === "•" 
                        ? "text-primary-foreground/20" 
                        : "text-primary-foreground/10 hover:text-primary-foreground/30 transition-colors duration-500"
                    }`}
                  >
                    {item === "Editorial" || item === "Effortless" ? (
                      <span className="italic font-light">{item}</span>
                    ) : item}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
