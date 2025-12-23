"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Layout
// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";

// Sections
import { HeroSection } from "@/components/sections/HeroSection";
import { ManifestoSection } from "@/components/sections/ManifestoSection";
import { EditorialShowcase } from "@/components/sections/EditorialShowcase";
import { AtelierSection } from "@/components/sections/AtelierSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { PinnedGallerySection } from "@/components/sections/PinnedGallerySection";
import { MarqueeSection } from "@/components/sections/MarqueeSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { CTASection } from "@/components/sections/CTASection";

// Animations
import { Preloader } from "@/components/animations/Preloader";
import { CustomCursor } from "@/components/animations/CustomCursor";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const atelierRef = useRef(null);
  const howItWorksRef = useRef(null);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const scrollToElement = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleGetStyled = useCallback(() => {
    toast.success("Starting your style journey!", {
      description: "Let's find your perfect look.",
    });
    scrollToElement(atelierRef);
  }, []);

  const handleHowItWorks = useCallback(() => {
    scrollToElement(howItWorksRef);
  }, []);

  const handleCurate = useCallback((params) => {
    console.log("Curating look with params:", params);
    toast.success("Creating your personalized look!", {
      description: "Our AI is curating the perfect outfit for you.",
    });
  }, []);

  const handleStartQuiz = useCallback(() => {
    toast.info("Style Quiz coming soon!", {
      description: "We're putting the finishing touches on your personalized experience.",
    });
  }, []);

  return (
    <SmoothScrollProvider>
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Preloader */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader onComplete={handlePreloaderComplete} duration={3500} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="relative min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* <Header /> */}
            
            <main>
              {/* Hero with cinematic reveal */}
              <HeroSection 
                onGetStyled={handleGetStyled} 
                onHowItWorks={handleHowItWorks} 
              />

              {/* Manifesto with word-by-word animation */}
              <ManifestoSection />
              
              {/* Horizontal scroll gallery */}
              <EditorialShowcase />
              
              {/* Atelier with form */}
              <div ref={atelierRef} id="atelier">
                <AtelierSection onCurate={handleCurate} />
              </div>
              
              {/* Experience with parallax images */}
              <ExperienceSection />

              {/* Pinned image transitions */}
              <PinnedGallerySection />
              
              {/* Giant marquee text */}
              <MarqueeSection />
              
              {/* How it works */}
              <div ref={howItWorksRef}>
                <HowItWorksSection />
              </div>
              
              {/* Final CTA */}
              <CTASection onStartQuiz={handleStartQuiz} />
            </main>
            
            {/* <Footer /> */}
          </motion.div>
        )}
      </AnimatePresence>
    </SmoothScrollProvider>
  );
}
