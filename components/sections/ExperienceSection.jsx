"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { FadeInView } from "../animations/FadeInView";
import { CountUp } from "../animations/TextEffects";
import { TiltCard } from "../animations/TiltCard";

export function ExperienceSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const textX = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section 
      ref={containerRef}
      className="py-20 sm:py-24 md:py-28 lg:py-36 bg-background overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-14 lg:gap-20 items-center">
          <motion.div style={{ x: textX }}>
            <FadeInView>
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "40px" } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-[1px] bg-foreground/20 mb-4"
              />
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 sm:mb-5">
                The Experience
              </span>
            </FadeInView>

            <FadeInView delay={0.1}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif leading-[1.15] text-foreground mb-4 sm:mb-6">
                AI Meets Fashion. You Get{" "}
                <motion.span 
                  className="italic font-light inline-block"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Perfect
                </motion.span>{" "}
                Outfits.
              </h2>
            </FadeInView>

            <FadeInView delay={0.2}>
              <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed mb-6 sm:mb-8">
                Stop endless scrolling. Our AI analyzes your style, body type, and occasion to create complete looks
                you'll love—with one-click shopping for every piece.
              </p>
            </FadeInView>

            <FadeInView delay={0.3}>
              <div className="flex flex-wrap gap-8 sm:gap-12">
                {[
                  { number: 50000, suffix: "+", label: "Outfits Curated" },
                  { number: 12, suffix: "", label: "Style Categories" },
                  { number: 100, suffix: "%", label: "Personalized" },
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    className="text-center"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground">
                      <CountUp 
                        end={stat.number} 
                        suffix={stat.suffix}
                        duration={2}
                        delay={0.5 + i * 0.2}
                      />
                    </div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeInView>
          </motion.div>

          <motion.div style={{ y: imageY }}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <TiltCard className="col-span-2" tiltAmount={5}>
                <motion.div 
                  className="aspect-[16/10] bg-secondary relative overflow-hidden"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={isInView ? { clipPath: "inset(0% 0 0 0)" } : {}}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.img
                    src="/formal.jpg"
                    alt="Luxury fashion editorial"
                    className="w-full h-full object-cover object-top"
                    initial={{ scale: 1.3 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 1.5, delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  />
                </motion.div>
              </TiltCard>
              
              <TiltCard tiltAmount={8}>
                <motion.div 
                  className="aspect-[3/4] bg-secondary relative overflow-hidden"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={isInView ? { clipPath: "inset(0% 0 0 0)" } : {}}
                  transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  
                  <motion.img 
                    src="/Bohemian.jpg" 
                    alt="Bohemian style fashion" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.3 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 1.5, delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                  />
                </motion.div>
              </TiltCard>
              
              <TiltCard tiltAmount={8}>
                <motion.div 
                  className="aspect-[3/4] bg-secondary relative overflow-hidden"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={isInView ? { clipPath: "inset(0% 0 0 0)" } : {}}
                  transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.img 
                    src="/imagess.png" 
                    alt="Minimalist fashion details" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.3 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                  />
                </motion.div>
              </TiltCard>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
