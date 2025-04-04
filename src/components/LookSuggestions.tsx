
import { useOutfitGenerator } from "@/hooks/useOutfitGenerator";
import { useCartStore } from "./Cart";
import { HomeButton } from "./HomeButton";
import { StyleRulers } from "./look/StyleRulers";
import { DebugDataViewer } from "./DebugDataViewer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { type CanvasItem } from "@/types/canvasTypes";
import { useState, useEffect } from "react";
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

export const LookSuggestions = () => {
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<DashboardItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>(undefined);
  
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

  // Map dashboard items to canvas items
  const canvasItems: CanvasItem[] = itemsToDisplay?.map(item => ({
    id: item.id,
    image: item.image,
    type: mapItemType(item.type)
  })) || [];

  // Get the occasion from the items, if available
  const currentOccasion = selectedOccasion || 
                         itemsToDisplay?.[0]?.occasion || 
                         (itemsToDisplay?.[0]?.metadata && itemsToDisplay[0].metadata.occasion) || 
                         itemsToDisplay?.[0]?.event || 
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
            <OutfitCanvas 
              canvasItems={canvasItems} 
              isRefreshing={isRefreshing} 
              onAddToCart={() => handleAddToCart(itemsToDisplay)}
              onTryDifferent={handleTryDifferentLook}
              occasion={currentOccasion}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {itemsToDisplay?.map((item) => (
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
              {itemsToDisplay?.map((item) => (
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
