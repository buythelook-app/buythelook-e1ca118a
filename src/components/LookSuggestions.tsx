
import { useOutfitGenerator } from "@/hooks/useOutfitGenerator";
import { useCartStore } from "./Cart";
import { HomeButton } from "./HomeButton";
import { StyleRulers } from "./look/StyleRulers";
import { DebugDataViewer } from "./DebugDataViewer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { type CanvasItem } from "@/types/canvasTypes";

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

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !dashboardItems?.length) {
    return <ErrorState />;
  }

  // Map dashboard items to canvas items
  const canvasItems: CanvasItem[] = dashboardItems.map(item => ({
    id: item.id,
    image: item.image,
    type: mapItemType(item.type)
  }));

  // Get the occasion from the dashboardItems, if available
  const currentOccasion = dashboardItems[0]?.occasion || undefined;

  return (
    <>
      <HomeButton />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Your Personalized Look</h1>
        {userStylePreference && (
          <p className="text-lg text-netflix-accent mb-6">
            Based on your {userStylePreference} style preference
          </p>
        )}
        
        <DebugDataViewer />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <OutfitCanvas 
              canvasItems={canvasItems} 
              isRefreshing={isRefreshing} 
              onAddToCart={() => handleAddToCart(dashboardItems)}
              onTryDifferent={handleTryDifferentLook}
              occasion={currentOccasion}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {dashboardItems.map((item) => (
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
      </div>
    </>
  );
};
