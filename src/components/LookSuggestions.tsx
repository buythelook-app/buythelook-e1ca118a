
import { useOutfitGenerator } from "@/hooks/useOutfitGenerator";
import { Button } from "./ui/button";
import { Loader2, ShoppingCart, Shuffle } from "lucide-react";
import { LookCanvas } from "./LookCanvas";
import { useCartStore } from "./Cart";
import { HomeButton } from "./HomeButton";
import { StyleRulers } from "./look/StyleRulers";
import { DebugDataViewer } from "./DebugDataViewer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

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

  // Map API returned item types to our canvas item types
  const mapItemType = (type: string): 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' => {
    if (!type) {
      console.warn('Empty type received in mapItemType');
      return 'top';
    }

    const lowerType = type.toLowerCase().trim().replace(/\s+/g, ' ');
    
    console.log('Mapping type:', type, 'Normalized to:', lowerType);

    // Filter out underwear items
    const underwearTerms = ['underwear', 'lingerie', 'bra', 'panties', 'briefs', 'boxer', 'thong'];
    for (const term of underwearTerms) {
      if (lowerType.includes(term)) {
        console.log(`Detected underwear term: ${term} in type: ${lowerType}, skipping`);
        return 'top';
      }
    }

    // Check for bottom keywords
    const bottomKeywords = ['pants', 'skirt', 'shorts', 'jeans', 'trousers', 'bottom'];
    for (const keyword of bottomKeywords) {
      if (lowerType.includes(keyword)) {
        console.log(`Found bottom keyword: ${keyword} in type: ${lowerType}`);
        return 'bottom';
      }
    }

    const typeMap: Record<string, 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear'> = {
      'shirt': 'top',
      'blouse': 'top',
      't-shirt': 'top',
      'top': 'top',
      'corset top': 'top',
      'dress': 'dress',
      'heel shoe': 'shoes',
      'shoes': 'shoes',
      'sneakers': 'shoes',
      'boots': 'shoes',
      'slingback shoes': 'shoes',
      'necklace': 'accessory',
      'bracelet': 'accessory',
      'sunglasses': 'sunglasses',
      'jacket': 'outerwear',
      'coat': 'outerwear'
    };

    const mappedType = typeMap[lowerType];
    console.log(`Type map result for ${lowerType}:`, mappedType);

    if (!mappedType) {
      console.warn(`No exact match found for type: ${lowerType}, defaulting to top`);
    }

    return mappedType || 'top';
  };

  // Display a message if the user hasn't completed the style quiz
  if (!hasQuizData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Style Quiz Required</h2>
        <p className="text-gray-600 mb-8">Please complete the style quiz to get personalized outfit suggestions.</p>
        <Button onClick={() => navigate('/quiz')}>Take Style Quiz</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !dashboardItems?.length) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">Unable to load outfit suggestions</p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/quiz')}>Retake Style Quiz</Button>
        </div>
      </div>
    );
  }

  // Validate color to make sure it's a valid CSS color
  const validateColor = (color: string): string => {
    const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
                        CSS.supports('color', color);
    return isValidColor ? color : '#CCCCCC';
  };

  // Map dashboard items to canvas items
  const canvasItems = dashboardItems?.map(item => {
    console.log('Processing item:', item);
    const mappedType = mapItemType(item.type);
    console.log(`Final mapping: ${item.type} -> ${mappedType}`);
    return {
      id: item.id,
      image: item.image,
      type: mappedType
    };
  });

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
            <div className="mb-8 flex flex-col items-center">
              <div className="relative w-[300px]">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden pb-4">
                  <div className="relative">
                    {isRefreshing ? (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-netflix-accent" />
                      </div>
                    ) : null}
                    <LookCanvas items={canvasItems} width={300} height={480} />
                    <div className="absolute bottom-0 left-4 right-4 flex justify-between gap-2">
                      <Button 
                        onClick={() => handleAddToCart(dashboardItems)}
                        className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                        disabled={isRefreshing}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Buy the look
                      </Button>
                      <Button
                        onClick={handleTryDifferentLook}
                        className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                        disabled={isRefreshing}
                      >
                        <Shuffle className="mr-1 h-3 w-3" />
                        Try different
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {dashboardItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleAddToCart(item)}
                      className="bg-white/10 hover:bg-netflix-accent/20 hover:text-netflix-accent rounded-full shadow-md"
                      disabled={isRefreshing}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <p className="text-lg font-medium">{item.price}</p>
                  </CardContent>
                </Card>
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

        {recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{userStylePreference ? `${userStylePreference} Style Tips` : 'Styling Tips'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">{recommendation}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {outfitColors && (
          <Card>
            <CardHeader>
              <CardTitle>Your Personal Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                {Object.entries(outfitColors).map(([piece, color]) => (
                  <div key={piece} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full mb-2" 
                      style={{ backgroundColor: validateColor(color) }}
                    />
                    <p className="text-sm capitalize">{piece}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
