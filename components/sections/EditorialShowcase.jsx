import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
// import styleFormal from "@/assets/style-formal.jpg";
// import styleBohemian from "@/assets/style-bohemian.jpg";
// import styleMinimalist from "@/assets/style-minimalist.jpg";
// import heroImage from "@/assets/hero-fashion.jpg";
import { TiltCard } from "@/components/animations/TiltCard";

export function EditorialShowcase() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Horizontal scroll transform
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  
  // Parallax for background text
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  const images = [
    { src: '/formal.jpg', alt: "Formal elegance", title: "Formal", subtitle: "Timeless elegance" },
    { src: '/style-bohemian.jpg', alt: "Bohemian spirit", title: "Bohemian", subtitle: "Free-spirited luxury" },
    { src: '/style-minimalist.jpg', alt: "Minimalist chic", title: "Minimalist", subtitle: "Less is more" },
    { src: '/casual.jpg', alt: "Editorial look", title: "Editorial", subtitle: "High fashion" },
  ];

  return (
    <section 
      ref={containerRef} 
      className="relative py-20 sm:py-32 lg:py-40 overflow-hidden bg-foreground"
    >
      {/* Large background text with parallax */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        style={{ y: textY, opacity: textOpacity, scale: textScale }}
      >
        <motion.h2 
          className="text-[25vw] font-serif text-primary-foreground/[0.03] whitespace-nowrap tracking-tighter"
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          Style Gallery • Style Gallery •
        </motion.h2>
      </motion.div>

      {/* Section header */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-16 sm:mb-20">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: "60px" } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-[1px] bg-primary-foreground/30 mb-6"
        />
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-block text-[10px] tracking-[0.4em] uppercase text-primary-foreground/50 mb-4"
        >
          Curated Collections
        </motion.span>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-primary-foreground"
          >
            Discover Your <span className="italic font-light">Aesthetic</span>
          </motion.h2>
        </div>
      </div>

      {/* Horizontal scrolling gallery */}
      <motion.div 
        className="flex gap-4 sm:gap-6 px-4 sm:px-6 will-change-transform"
        style={{ x }}
      >
        {images.map((image, i) => (
          <motion.div
            key={i}
            className="relative flex-shrink-0 group"
            initial={{ opacity: 0, y: 80, rotateY: -15 }}
            animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard 
              className="relative w-[280px] sm:w-[350px] md:w-[400px] lg:w-[450px] aspect-[3/4] overflow-hidden"
              tiltAmount={8}
              glareEnabled={true}
            >
              {/* Image mask reveal */}
              <motion.div
                className="absolute inset-0 bg-primary-foreground z-10"
                initial={{ scaleY: 1 }}
                animate={isInView ? { scaleY: 0 } : {}}
                transition={{ duration: 1.4, delay: 0.5 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top" }}
              />
              
              {/* Image with hover effect */}
              <motion.img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                initial={{ scale: 1.4 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 1.6, delay: 0.6 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.05 }}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Title on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <motion.span 
                  className="block text-xs tracking-[0.3em] uppercase text-primary-foreground/60 mb-1"
                >
                  Style
                </motion.span>
                <h3 className="text-2xl sm:text-3xl font-serif text-primary-foreground">{image.title}</h3>
                <p className="text-sm text-primary-foreground/70 mt-2">{image.subtitle}</p>
                
                {/* Animated line */}
                <motion.div
                  className="w-0 h-[1px] bg-primary-foreground/40 mt-4 group-hover:w-12 transition-all duration-700 delay-100"
                />
              </div>

              {/* Corner frame */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-primary-foreground/0 group-hover:border-primary-foreground/30 transition-all duration-500" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-primary-foreground/0 group-hover:border-primary-foreground/30 transition-all duration-500" />
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll hint */}
      <motion.div 
        className="flex justify-center mt-16"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-center gap-3 text-primary-foreground/40">
          <motion.div 
            className="w-12 h-[1px] bg-primary-foreground/20"
            animate={{ scaleX: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll to explore</span>
          <motion.div 
            className="w-12 h-[1px] bg-primary-foreground/20"
            animate={{ scaleX: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
