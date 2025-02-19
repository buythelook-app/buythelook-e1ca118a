
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems } from "@/services/lookService";
import { Button } from "./ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LookCanvas } from "./LookCanvas";
import { useCartStore } from "./Cart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OutfitItem {
  id: string;
  image: string;
  name: string;
  price: string;
  type: string;
  description: string;
}

interface OutfitColors {
  top: string;
  bottom: string;
  shoes: string;
  [key: string]: string;
}

export const LookSuggestions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [outfitColors, setOutfitColors] = useState<OutfitColors | null>(null);
  const { addItems } = useCartStore();

  const hasQuizData = localStorage.getItem('styleAnalysis') !== null;

  const { data: dashboardItems, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardItems'],
    queryFn: fetchDashboardItems,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: hasQuizData,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load outfit suggestions. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

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

  const mapItemType = (type: string): 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' => {
    const typeMap: { [key: string]: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' } = {
      'shirt': 'top',
      'blouse': 'top',
      't-shirt': 'top',
      'skirt': 'bottom',
      'pants': 'bottom',
      'jeans': 'bottom',
      'shorts': 'bottom',
      'dress': 'dress',
      'heel shoe': 'shoes',
      'shoes': 'shoes',
      'sneakers': 'shoes',
      'boots': 'shoes',
      'necklace': 'accessory',
      'bracelet': 'accessory',
      'sunglasses': 'sunglasses',
      'jacket': 'outerwear',
      'coat': 'outerwear'
    };

    return typeMap[type.toLowerCase()] || 'top';
  };

  useEffect(() => {
    if (!hasQuizData) {
      toast({
        title: "Style Quiz Required",
        description: "Please complete the style quiz first to get personalized suggestions.",
        variant: "destructive",
      });
      navigate('/quiz');
      return;
    }

    const storedRecommendations = localStorage.getItem('style-recommendations');
    const storedColors = localStorage.getItem('outfit-colors');
    
    if (storedRecommendations) {
      try {
        setRecommendations(JSON.parse(storedRecommendations));
      } catch (e) {
        console.error('Error parsing recommendations:', e);
      }
    }
    
    if (storedColors) {
      try {
        const parsedColors = JSON.parse(storedColors) as OutfitColors;
        setOutfitColors(parsedColors);
      } catch (e) {
        console.error('Error parsing outfit colors:', e);
      }
    }
  }, [hasQuizData, navigate, toast]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current-mood') {
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetch]);

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
          <Button onClick={() => refetch()} variant="outline">Try Again</Button>
          <Button onClick={() => navigate('/quiz')}>Retake Style Quiz</Button>
        </div>
      </div>
    );
  }

  const validateColor = (color: string): string => {
    const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
                        CSS.supports('color', color);
    return isValidColor ? color : '#CCCCCC';
  };

  const canvasItems = dashboardItems?.map(item => ({
    id: item.id,
    image: item.image,
    type: mapItemType(item.type)
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Your Curated Look</h1>
      
      <div className="mb-8 flex flex-col items-center relative">
        <Button 
          onClick={() => handleAddToCart(dashboardItems)}
          className="bg-netflix-accent hover:bg-netflix-accent/80 absolute -top-2 right-0 z-10 shadow-lg"
        >
          <ShoppingCart className="mr-2" />
          Add All to Cart
        </Button>
        <LookCanvas items={canvasItems} width={300} height={400} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleAddToCart(item)}
                className="bg-white/10 hover:bg-netflix-accent/20 hover:text-netflix-accent rounded-full shadow-md"
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

      {recommendations.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Styling Tips</CardTitle>
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
            <CardTitle>Color Palette</CardTitle>
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
  );
};
