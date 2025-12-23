"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { FadeInView } from "../animations/FadeInView";
import { TypewriterInput } from "../ui/TypewriterInput";

export function AtelierSection({ onCurate }) {
  const [visionText, setVisionText] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedAesthetic, setSelectedAesthetic] = useState("");

  const handleCurate = () => {
    onCurate({
      vision: visionText,
      occasion: selectedOccasion,
      budget: selectedBudget,
      aesthetic: selectedAesthetic,
    });
  };

  return (
    <section className="py-20 sm:py-24 md:py-28 lg:py-36 bg-cream border-y border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <FadeInView className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-4 sm:mb-5">
            Personal Atelier
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground">
            Curate Your <span className="italic font-light">Look</span>
          </h2>
        </FadeInView>

        <div className="space-y-12 sm:space-y-16">
          {/* SECTION 01: Vision Input */}
          <FadeInView delay={0.1}>
            <div className="text-center mb-4 sm:mb-6">
              <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground/50 font-light">01</span>
              <h3 className="text-sm sm:text-base md:text-lg font-serif mt-2 text-muted-foreground">
                Describe Your Vision
              </h3>
            </div>
            <div className="max-w-2xl mx-auto">
              <TypewriterInput
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                placeholder="An elegant evening look with modern minimalist vibes..."
                className="w-full"
              />
            </div>
          </FadeInView>

          {/* SECTION 02: Filters */}
          <FadeInView delay={0.2}>
            <div className="text-center mb-8 sm:mb-10">
              <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground/50 font-light">02</span>
              <h3 className="text-sm sm:text-base md:text-lg font-serif mt-2 text-muted-foreground">
                Select Preferences
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8">
              {/* Occasion Filter */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Occasion
                </label>
                <select 
                  value={selectedOccasion} 
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full h-11 sm:h-12 bg-transparent border-0 border-b border-border hover:border-muted-foreground focus:border-foreground text-foreground text-center focus:ring-0 focus:outline-none transition-colors duration-300 text-sm sm:text-base"
                >
                  <option value="">Select Occasion</option>
                  <option value="everyday">Everyday</option>
                  <option value="work">Work / Office</option>
                  <option value="date">Date Night</option>
                  <option value="party">Party / Event</option>
                  <option value="formal">Formal / Black Tie</option>
                  <option value="casual">Casual Weekend</option>
                </select>
              </div>

              {/* Investment Filter */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Investment
                </label>
                <select 
                  value={selectedBudget} 
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full h-11 sm:h-12 bg-transparent border-0 border-b border-border hover:border-muted-foreground focus:border-foreground text-foreground text-center focus:ring-0 focus:outline-none transition-colors duration-300 text-sm sm:text-base"
                >
                  <option value="">Set Budget</option>
                  <option value="budget">Budget ($50-$150)</option>
                  <option value="moderate">Moderate ($150-$400)</option>
                  <option value="premium">Premium ($400-$800)</option>
                  <option value="luxury">Luxury ($800+)</option>
                </select>
              </div>

              {/* Aesthetic Filter */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Aesthetic
                </label>
                <select 
                  value={selectedAesthetic} 
                  onChange={(e) => setSelectedAesthetic(e.target.value)}
                  className="w-full h-11 sm:h-12 bg-transparent border-0 border-b border-border hover:border-muted-foreground focus:border-foreground text-foreground text-center focus:ring-0 focus:outline-none transition-colors duration-300 text-sm sm:text-base"
                >
                  <option value="">Any Mood</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="classic">Classic / Timeless</option>
                  <option value="modern">Modern / Contemporary</option>
                  <option value="bohemian">Bohemian</option>
                  <option value="streetwear">Streetwear</option>
                  <option value="romantic">Romantic / Feminine</option>
                  <option value="edgy">Edgy / Bold</option>
                </select>
              </div>
            </div>
          </FadeInView>

          {/* SECTION 03: CTA Button */}
          <FadeInView delay={0.3} className="text-center">
            <div className="mb-6 sm:mb-8">
              <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground/50 font-light">03</span>
              <h3 className="text-sm sm:text-base md:text-lg font-serif mt-2 text-muted-foreground">
                Begin Your Journey
              </h3>
            </div>

            <button
              onClick={handleCurate}
              className="group relative w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-12 bg-foreground text-background hover:bg-foreground/90 text-sm font-medium tracking-[0.1em] uppercase overflow-hidden transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <Sparkles className="w-4 h-4" />
                Curate My Look
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>

            <p className="mt-4 sm:mt-5 text-muted-foreground text-xs sm:text-sm">
              Personalized outfit recommendations in seconds
            </p>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
