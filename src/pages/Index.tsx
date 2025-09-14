
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { MoodFilter } from "@/components/filters/MoodFilter";
import { FreeTextStyleInput } from "@/components/filters/FreeTextStyleInput";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { toast as sonnerToast } from "sonner";
import { StyleProfileDisplay } from "@/components/look/StyleProfileDisplay";
import { PersonalizedLooksGrid } from "@/components/look/PersonalizedLooksGrid";
import { usePersonalizedLooks } from "@/hooks/usePersonalizedLooks";
import { memo, useCallback, useMemo, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { addLook } = useCartStore();
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  
  const {
    selectedMood,
    userStyle,
    occasions,
    occasionOutfits,
    isLoading,
    isError,
    createLookFromItems,
    handleMoodSelect,
    handleShuffleLook,
    resetError
  } = usePersonalizedLooks();
  
  // Memoize handleAddToCart to prevent creating a new function on every render
  const handleAddToCart = useCallback((look: any) => {
    // Only process if look has valid items
    if (!look || !look.items || look.items.length === 0) {
      return;
    }
    
    const lookItems = look.items.map((item: any) => ({
      ...item,
      title: `Item from ${look.title}`,
      price: (parseFloat(look.price?.replace('$', '') || '0') / look.items.length).toFixed(2),
    }));
    
    addLook({
      id: look.id,
      title: look.title,
      items: lookItems,
      totalPrice: look.price
    });
    
    sonnerToast.success(`${look.title} added to cart`);
  }, [addLook]);

  const handleStyleAnalyzed = useCallback((filters: any) => {
    setAppliedFilters(filters);
    // Apply the mood from AI analysis
    handleMoodSelect(filters.mood);
    sonnerToast.success(`מחפש פריטים ב${filters.style} ל${filters.eventType}`);
  }, [handleMoodSelect]);

  // For when no style is defined
  const renderNoStyleContent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-background/95 via-accent/5 to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-fashion-glass rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 fashion-hero-text">Complete Your Style Quiz</h2>
          <p className="text-muted-foreground mb-8">
            Take our style quiz to get personalized look suggestions that match your style.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-3 rounded-2xl hover:scale-105 transition-all duration-300 fashion-glow"
          >
            Take Style Quiz
          </button>
        </div>
      </div>
    </div>
  ), [navigate]);

  // Early return if no user style to prevent unnecessary rendering
  if (!userStyle) {
    return renderNoStyleContent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/95 via-accent/5 to-primary/5">
      <Navbar />
      <div>
        <HeroSection />
      </div>
      <main className="container mx-auto px-4 py-8">
        <FreeTextStyleInput onStyleAnalyzed={handleStyleAnalyzed} />
        
        <div className="mb-8">
          <MoodFilter selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
        </div>
        <FilterOptions />
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h2 className="text-3xl font-semibold relative fashion-hero-text">
                Personalized Looks
                <span className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></span>
              </h2>
              <StyleProfileDisplay styleProfile={userStyle?.analysis?.styleProfile} />
            </div>
            
            <PersonalizedLooksGrid
              isLoading={isLoading}
              isError={isError}
              occasionOutfits={occasionOutfits}
              occasions={occasions}
              createLookFromItems={createLookFromItems}
              handleShuffleLook={handleShuffleLook}
              handleAddToCart={handleAddToCart}
              resetError={resetError}
              userStyleProfile={userStyle?.analysis?.styleProfile}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default memo(Index);
