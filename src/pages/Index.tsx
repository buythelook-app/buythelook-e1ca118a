
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
    <div className="min-h-screen fashion-bg">
      <Navbar />
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-light fashion-text mb-6">
            Let's Discover Your Style
          </h2>
          <p className="fashion-muted text-lg mb-12 leading-relaxed">
            Complete our personalized style quiz to unlock curated looks 
            that perfectly match your unique taste and lifestyle.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="fashion-button-primary text-lg shadow-xl"
          >
            Take Style Quiz
          </button>
          <p className="fashion-muted text-sm mt-4">
            Takes 2 minutes • Free & personalized
          </p>
        </div>
      </div>
    </div>
  ), [navigate]);

  // Early return if no user style to prevent unnecessary rendering
  if (!userStyle) {
    return renderNoStyleContent;
  }

  return (
    <div className="min-h-screen fashion-bg">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-6 py-16">
        {/* Mood Selection Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-light fashion-text mb-4">
              What's Your Mood Today?
            </h2>
            <p className="fashion-muted text-lg max-w-xl mx-auto">
              Let us curate the perfect looks that match your current vibe
            </p>
          </div>
          <MoodFilter selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
        </section>

        {/* Style Profile Section */}
        {userStyle?.analysis?.styleProfile && (
          <section className="mb-16">
            <div className="fashion-card rounded-3xl p-8 text-center">
              <h3 className="text-xl font-display fashion-text mb-4">Your Style Profile</h3>
              <StyleProfileDisplay styleProfile={userStyle.analysis.styleProfile} />
            </div>
          </section>
        )}
        
        {/* Personalized Looks Section */}
        <section className="py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-light fashion-text mb-4">
              Curated Just for You
            </h2>
            <p className="fashion-muted text-lg max-w-2xl mx-auto">
              Perfect outfits tailored to your style, sized to fit your life
            </p>
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
        </section>
      </main>
    </div>
  );
};

export default memo(Index);
