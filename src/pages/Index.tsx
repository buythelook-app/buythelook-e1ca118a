
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { MoodFilter } from "@/components/filters/MoodFilter";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { toast as sonnerToast } from "sonner";
import { StyleProfileDisplay } from "@/components/look/StyleProfileDisplay";
import { PersonalizedLooksGrid } from "@/components/look/PersonalizedLooksGrid";
import { usePersonalizedLooks } from "@/hooks/usePersonalizedLooks";
import { Button } from "@/components/ui/button";
import { memo, useCallback, useMemo } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { addLook } = useCartStore();
  
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

  // For when no style is defined
  const renderNoStyleContent = useMemo(() => (
    <div className="min-h-screen bg-fashion-light">
      <Navbar />
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-fashion-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-fashion-accent text-3xl">👗</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-fashion-dark mb-6">
            Discover Your Perfect Style
          </h2>
          <p className="text-lg text-fashion-muted mb-12 leading-relaxed">
            Take our personalized style quiz to unlock curated looks that perfectly match 
            your unique taste, lifestyle, and occasions.
          </p>
          <Button
            onClick={() => navigate('/quiz')}
            className="bg-fashion-accent hover:bg-fashion-accent/90 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Style Quiz
          </Button>
        </div>
      </div>
    </div>
  ), [navigate]);

  // Early return if no user style to prevent unnecessary rendering
  if (!userStyle) {
    return renderNoStyleContent;
  }

  return (
    <div className="min-h-screen bg-fashion-light">
      <Navbar />
      <HeroSection />
      <main className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12">
            <MoodFilter selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
          </div>
          <FilterOptions />
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-light text-fashion-dark mb-2">
                    Your Personalized Looks
                  </h2>
                  <p className="text-fashion-muted">Curated styles that match your unique taste</p>
                </div>
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
        </div>
      </main>
    </div>
  );
};

export default memo(Index);
