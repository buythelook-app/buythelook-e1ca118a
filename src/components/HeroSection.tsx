
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center fashion-bg overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(264_83%_58%)_0%,transparent_50%)]" />
      </div>
      
      <div className="container mx-auto px-6 py-24 text-center relative z-10">
        {/* Brand tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="fashion-muted font-brand text-sm tracking-[0.2em] uppercase">
            Your Personal AI Stylist
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-light fashion-text mb-6"
        >
          Style Made
          <span className="block bg-gradient-to-r from-fashion-accent to-fashion-secondary bg-clip-text text-transparent font-normal">
            Personal
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl fashion-muted max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Discover curated looks that reflect your unique style. 
          Get personalized recommendations for any occasion, 
          perfectly tailored to your preferences.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            onClick={() => navigate('/quiz')}
            className="fashion-button-primary text-lg shadow-xl"
          >
            Discover Your Style
          </button>
          
          <p className="fashion-muted text-sm mt-4">
            Takes 2 minutes • Free to start
          </p>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 fashion-muted text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-fashion-success rounded-full" />
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-fashion-success rounded-full" />
            <span>Personalized</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-fashion-success rounded-full" />
            <span>Instant Results</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
