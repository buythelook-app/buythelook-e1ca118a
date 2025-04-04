
import { useOutfitGenerator } from "@/hooks/useOutfitGenerator";
import { useCartStore } from "./Cart";
import { HomeButton } from "./HomeButton";
import { StyleRulers } from "./look/StyleRulers";
import { DebugDataViewer } from "./DebugDataViewer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { type CanvasItem } from "@/types/canvasTypes";
import { useState, useEffect, useMemo } from "react";
import { DashboardItem } from "@/types/lookTypes";

// Import the extracted components
import { OutfitCanvas } from "./look/OutfitCanvas";
import { ItemCard } from "./look/ItemCard";
import { StyleTips } from "./look/StyleTips";
import { ColorPalette } from "./look/ColorPalette";
import { mapItemType } from "./look/OutfitTypeMapper";
import { QuizPrompt } from "./look/QuizPrompt";
import { LoadingState } from "./look/LoadingState";
import { ErrorState } from "./look/ErrorState";

// Import carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const LookSuggestions = () => {
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<DashboardItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  
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

  // Group items into outfits based on similar occasions or types
  const outfits = useMemo(() => {
    if (!dashboardItems || dashboardItems.length === 0) {
      return [];
    }

    // Group items by occasion or some other identifier
    const groupedOutfits: DashboardItem[][] = [];
    let currentOutfit: DashboardItem[] = [];

    // Group items by shared properties like occasion or event
    dashboardItems.forEach((item, index) => {
      if (index === 0) {
        currentOutfit.push(item);
      } else {
        const prevItem = dashboardItems[index - 1];
        // Check if item shares the same occasion or event as previous item
        const sameOccasion = 
          (item.occasion && prevItem.occasion && item.occasion === prevItem.occasion) ||
          (item.event && prevItem.event && item.event === prevItem.event) ||
          (item.metadata?.occasion && prevItem.metadata?.occasion && 
           item.metadata.occasion === prevItem.metadata.occasion);
        
        if (sameOccasion) {
          currentOutfit.push(item);
        } else {
          if (currentOutfit.length > 0) {
            groupedOutfits.push([...currentOutfit]);
          }
          currentOutfit = [item];
        }
      }
    });

    // Add the last outfit if not empty
    if (currentOutfit.length > 0) {
      groupedOutfits.push(currentOutfit);
    }

    return groupedOutfits;
  }, [dashboardItems]);

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

  // Handle carousel navigation
  const handleCarouselChange = (index: number) => {
    setActiveIndex(index);
  };

  // Render states
  if (!hasQuizData) {
    return <QuizPrompt />;
  }

  if (isLoading && !selectedItems.length) {
    return <LoadingState />;
  }

  if (error && !selectedItems.length && !outfits.length) {
    return <ErrorState />;
  }

  // Use selected items from localStorage if available, otherwise use dashboard items
  const currentOutfits = selectedItems.length > 0 ? [selectedItems] : outfits;

  // Get the current outfit based on active index
  const currentOutfit = currentOutfits[activeIndex] || [];

  // Map dashboard items to canvas items
  const canvasItems: CanvasItem[] = currentOutfit?.map(item => ({
    id: item.id,
    image: item.image,
    type: mapItemType(item.type)
  })) || [];

  // Get the occasion from the items, if available
  const currentOccasion = selectedOccasion || 
                         currentOutfit?.[0]?.occasion || 
                         (currentOutfit?.[0]?.metadata && currentOutfit[0].metadata.occasion) || 
                         currentOutfit?.[0]?.event || 
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
            {currentOutfits.length > 0 && (
              <Carousel
                className="w-full relative"
                onValueChange={handleCarouselChange}
              >
                <div className="absolute top-0 right-0 bg-white bg-opacity-60 px-3 py-1 rounded-bl-md z-10">
                  <span className="text-sm font-medium">
                    {activeIndex + 1} / {currentOutfits.length}
                  </span>
                </div>
                <CarouselContent>
                  {currentOutfits.map((outfit, index) => (
                    <CarouselItem key={index} className="flex flex-col items-center">
                      <OutfitCanvas 
                        canvasItems={outfit.map(item => ({
                          id: item.id,
                          image: item.image,
                          type: mapItemType(item.type)
                        }))}
                        isRefreshing={isRefreshing} 
                        onAddToCart={() => handleAddToCart(outfit)}
                        onTryDifferent={handleTryDifferentLook}
                        occasion={outfit[0]?.occasion || outfit[0]?.event || outfit[0]?.metadata?.occasion}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {currentOutfits.length > 1 && (
                  <>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </>
                )}
              </Carousel>
            )}

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
        
        {/* Add a detailed breakdown of all items in the look */}
        <div className="mt-12 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Complete Look Breakdown</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{currentOccasion || "Look"} Components</h3>
            <ul className="space-y-2">
              {currentOutfit?.map((item) => (
                <li key={item.id} className="flex items-center gap-4 border-b border-gray-100 pb-2">
                  <div className="w-12 h-12 bg-white border rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
