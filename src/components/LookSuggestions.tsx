
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOutfitGenerator } from "@/hooks/useOutfitGenerator";
import { useCartStore } from "./Cart";
import { HomeButton } from "./HomeButton";
import { useToast } from "@/hooks/use-toast";
import { type CanvasItem, ItemType } from "@/types/canvasTypes";
import { DashboardItem } from "@/types/lookTypes";

// Import the extracted components
import { OutfitCanvas } from "./look/OutfitCanvas";
import { ItemCard } from "./look/ItemCard";
import { StyleTips } from "./look/StyleTips";
import { ColorPalette } from "./look/ColorPalette";
import { StyleRulers } from "./look/StyleRulers";
import { mapItemType } from "./look/OutfitTypeMapper";
import { QuizPrompt } from "./look/QuizPrompt";
import { LoadingState } from "./look/LoadingState";
import { ErrorState } from "./look/ErrorState";
import { OutfitBreakdown } from "./look/OutfitBreakdown";
import { OutfitCarousel } from "./look/OutfitCarousel";
import { DebugDataViewer } from "./DebugDataViewer";

export const LookSuggestions = () => {
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<DashboardItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>(undefined);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  
  const {
    dashboardItems,
    isLoading,
    error,
    isRefreshing,
    recommendations,
    outfitColors,
    elegance,
    colorIntensity,
    userStylePreference,
    hasQuizData,
    handleTryDifferentLook,
    handleEleganceChange,
    handleColorIntensityChange
  } = useOutfitGenerator();

  // Load selected look items from localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem('selected-look-items');
    const storedOccasion = localStorage.getItem('selected-look-occasion');
    
    if (storedItems) {
      try {
        setSelectedItems(JSON.parse(storedItems));
      } catch (e) {
        console.error('Error parsing selected items:', e);
      }
    }
    
    if (storedOccasion) {
      setSelectedOccasion(storedOccasion);
    }
    
    // Clear after using to prevent stale data on refreshes
    return () => {
      localStorage.removeItem('selected-look-items');
      localStorage.removeItem('selected-look-occasion');
    };
  }, []);

  // Handle adding items to cart
  const handleAddToCart = (items: Array<any> | any) => {
    const itemsToAdd = Array.isArray(items) ? items : [items];
    const cartItems = itemsToAdd.map(item => ({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.image
    }));
    
    addItems(cartItems);
    toast({
      title: "Success",
      description: Array.isArray(items) ? "All items added to cart" : "Item added to cart",
    });
    navigate('/cart');
  };

  // Handle navigation between outfits
  const handleNextOutfit = () => {
    if (!itemsToDisplay || itemsToDisplay.length === 0) return;
    setCurrentOutfitIndex((prevIndex) => (prevIndex + 1) % (outfits.length || 1));
  };

  const handlePrevOutfit = () => {
    if (!itemsToDisplay || itemsToDisplay.length === 0) return;
    setCurrentOutfitIndex((prevIndex) => 
      prevIndex === 0 ? (outfits.length - 1) || 0 : prevIndex - 1
    );
  };

  // Render states
  if (!hasQuizData) {
    return <QuizPrompt />;
  }

  if (isLoading && !selectedItems.length) {
    return <LoadingState />;
  }

  if (error && !selectedItems.length && !dashboardItems?.length) {
    return <ErrorState />;
  }

  // Use selected items from localStorage if available, otherwise use dashboard items
  const itemsToDisplay = selectedItems.length > 0 ? selectedItems : dashboardItems;

  // Organize items by type to create complete outfits
  const itemsByType: Record<string, DashboardItem[]> = {};
  if (itemsToDisplay && itemsToDisplay.length > 0) {
    itemsToDisplay.forEach(item => {
      const type = item.type.toLowerCase();
      if (!itemsByType[type]) {
        itemsByType[type] = [];
      }
      itemsByType[type].push(item);
    });
  }

  // Create outfits by combining items of different types
  const outfits: DashboardItem[][] = [];
  const tops = itemsByType['top'] || [];
  const bottoms = itemsByType['bottom'] || [];
  const shoes = itemsByType['shoes'] || [];

  // Create outfit combinations
  const maxItems = Math.max(
    tops.length || 0, 
    bottoms.length || 0, 
    shoes.length || 0
  );

  for (let i = 0; i < maxItems; i++) {
    const outfit: DashboardItem[] = [];
    if (tops[i % tops.length]) outfit.push(tops[i % tops.length]);
    if (bottoms[i % bottoms.length]) outfit.push(bottoms[i % bottoms.length]);
    if (shoes[i % shoes.length]) outfit.push(shoes[i % shoes.length]);
    outfits.push(outfit);
  }

  // If no outfits were created, use all items as a single outfit
  if (outfits.length === 0 && itemsToDisplay && itemsToDisplay.length > 0) {
    outfits.push(itemsToDisplay);
  }

  // Get the current outfit to display
  const currentOutfit = outfits.length > 0 ? outfits[currentOutfitIndex % outfits.length] : [];

  // Map dashboard items to canvas items with proper type casting
  const canvasItems: CanvasItem[] = currentOutfit?.map(item => ({
    id: item.id,
    image: item.image,
    type: mapItemType(item.type)
  })) || [];

  // Get the occasion from the items, if available
  const currentOccasion = selectedOccasion || 
                         (currentOutfit?.[0]?.occasion) || 
                         (currentOutfit?.[0]?.metadata && currentOutfit[0].metadata.occasion) || 
                         (currentOutfit?.[0]?.event) || 
                         undefined;

  return (
    <>
      <HomeButton />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Your Personalized Look</h1>
        {currentOccasion && (
          <p className="text-lg text-netflix-accent mb-6">
            {currentOccasion} Outfit
          </p>
        )}
        {userStylePreference && (
          <p className="text-lg mb-6">
            Based on your {userStylePreference} style preference
          </p>
        )}
        
        <DebugDataViewer />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <OutfitCarousel 
              canvasItems={canvasItems}
              isRefreshing={isRefreshing}
              onAddToCart={() => currentOutfit.length > 0 && handleAddToCart(currentOutfit)}
              onTryDifferent={handleTryDifferentLook}
              occasion={currentOccasion}
              outfitCount={outfits.length}
              currentIndex={currentOutfitIndex}
              onPrevious={handlePrevOutfit}
              onNext={handleNextOutfit}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {currentOutfit?.map((item) => (
                <ItemCard 
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  onAddToCart={() => handleAddToCart(item)}
                  isRefreshing={isRefreshing}
                />
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <StyleRulers
              elegance={elegance}
              colorIntensity={colorIntensity}
              onEleganceChange={handleEleganceChange}
              onColorIntensityChange={handleColorIntensityChange}
            />
          </div>
        </div>

        <StyleTips 
          recommendations={recommendations} 
          stylePreference={userStylePreference} 
        />

        <ColorPalette outfitColors={outfitColors} />
        
        <OutfitBreakdown items={currentOutfit} occasion={currentOccasion} />
      </div>
    </>
  );
};
