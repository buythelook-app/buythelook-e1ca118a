
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { LookCanvas } from "@/components/LookCanvas";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Mood } from "@/components/filters/MoodFilter";
import { MoodFilter } from "@/components/filters/MoodFilter";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems, clearOutfitCache } from "@/services/lookService";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, ShoppingCart, AlertCircle } from "lucide-react";
import { useCartStore } from "@/components/Cart";
import { toast as sonnerToast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Look {
  id: string;
  title: string;
  items: Array<{
    id: string;
    image: string;
    type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
  }>;
  price: string;
  category: string;
  occasion: string;
}

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
  const { addLook } = useCartStore();
  const [apiErrorShown, setApiErrorShown] = useState(false);

  useEffect(() => {
    console.log("Index page loaded");
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
      console.log("Style analysis loaded:", JSON.parse(styleAnalysis));
    } else {
      console.log("No style analysis found in localStorage");
    }
  }, []);

  const { data: occasionOutfits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood, forceRefresh],
    queryFn: fetchDashboardItems,
    enabled: !!userStyle,
    staleTime: 0,
    retry: 1, // Limit retries to prevent excessive flickering
  });

  // Handle API errors gracefully
  useEffect(() => {
    if (isError && !apiErrorShown) {
      console.error("API error:", error);
      setApiErrorShown(true);
      toast({
        title: "Connection Error",
        description: "Unable to load outfit recommendations. Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast, apiErrorShown]);

  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('current-mood', selectedMood);
      refetch();
    }
  }, [selectedMood, refetch]);

  useEffect(() => {
    if (forceRefresh) {
      setForceRefresh(false);
    }
  }, [occasionOutfits, forceRefresh]);

  const createLookFromItems = (items: any[] = [], occasion: string, index: number): Look | null => {
    if (!items || items.length === 0) return null;
    
    const lookItems = items.map(item => ({
      id: item.id,
      image: item.image,
      type: item.type.toLowerCase() as 'top' | 'bottom' | 'shoes'
    }));
    
    let totalPrice = 0;
    items.forEach(item => {
      const itemPrice = item.price?.replace(/[^0-9.]/g, '') || '0';
      totalPrice += parseFloat(itemPrice);
    });
    
    return {
      id: `look-${occasion}-${index}`,
      title: `${occasion} Look`,
      items: lookItems,
      price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00',
      category: userStyle?.analysis?.styleProfile || "Casual",
      occasion: occasion
    };
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
    // Reset the API error flag when trying with a new mood
    setApiErrorShown(false);
  };

  const handleShuffleLook = (occasion: string) => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      const parsed = JSON.parse(styleAnalysis);
      const bodyShape = parsed?.analysis?.bodyShape || 'H';
      const style = parsed?.analysis?.styleProfile || 'classic';
      const mood = localStorage.getItem('current-mood') || 'energized';
      
      clearOutfitCache(bodyShape, style, mood);
    }
    
    setCombinations(prev => ({
      ...prev,
      [occasion]: (prev[occasion] || 0) + 1
    }));
    
    setForceRefresh(true);
    setApiErrorShown(false); // Reset error flag when shuffling
    refetch();
  };
  
  const handleAddToCart = (look: Look) => {
    const lookItems = look.items.map(item => ({
      ...item,
      title: `Item from ${look.title}`,
      price: (parseFloat(look.price.replace('$', '')) / look.items.length).toFixed(2),
    }));
    
    addLook({
      id: look.id,
      title: look.title,
      items: lookItems,
      totalPrice: look.price
    });
    
    sonnerToast.success(`${look.title} added to cart`);
  };

  if (!userStyle) {
    return (
      <div className="min-h-screen bg-netflix-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Complete Your Style Quiz</h2>
          <p className="text-gray-600 mb-8">
            Take our style quiz to get personalized look suggestions that match your style.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="bg-netflix-accent text-white px-6 py-3 rounded-lg hover:bg-netflix-accent/90 transition-colors"
          >
            Take Style Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <MoodFilter selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
        </div>
        <FilterOptions />
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h2 className="text-3xl font-display font-semibold relative">
                Personalized Looks
                <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
              </h2>
              {userStyle?.analysis?.styleProfile && (
                <div className="mt-4 md:mt-0 px-4 py-2 bg-netflix-card rounded-full text-netflix-accent">
                  Based on your {userStyle.analysis.styleProfile} style preference
                </div>
              )}
            </div>
            
            {isError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connection error: Unable to load outfit recommendations.
                </AlertDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 ml-auto" 
                  onClick={() => {
                    setApiErrorShown(false);
                    refetch();
                  }}
                >
                  Try Again
                </Button>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <div className="animate-pulse">Loading your personalized looks...</div>
                </div>
              ) : (
                occasions.map((occasion, index) => {
                  const items = occasionOutfits?.[occasion] || [];
                  const look = createLookFromItems(items, occasion, index);
                  
                  if (!look) {
                    return (
                      <div key={`empty-${occasion}-${index}`} className="bg-netflix-card p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold">{occasion} Look</h3>
                        </div>
                        <div className="mb-4 bg-white/10 rounded-lg h-80 flex items-center justify-center">
                          <div className="text-center p-4">
                            <Button
                              onClick={() => handleShuffleLook(occasion)}
                              className="bg-netflix-accent text-white"
                            >
                              <Shuffle className="mr-2 h-4 w-4" />
                              Generate Look
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      key={look.id}
                      className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">{look.title}</h3>
                        <span className="text-sm text-netflix-accent">{look.occasion}</span>
                      </div>
                      <div className="mb-4 bg-white rounded-lg overflow-hidden relative group">
                        <LookCanvas items={look.items} width={300} height={480} />
                        <button
                          onClick={() => handleShuffleLook(look.occasion)}
                          className="absolute bottom-4 right-4 bg-netflix-accent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Try different combination"
                        >
                          <Shuffle className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-netflix-accent font-semibold">{look.price}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddToCart(look)}
                            className="bg-netflix-accent text-white p-2 rounded-lg hover:bg-netflix-accent/90 transition-colors"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              localStorage.setItem(`look-${look.id}`, JSON.stringify({
                                ...look,
                                description: `A curated ${look.occasion.toLowerCase()} look that matches your ${userStyle.analysis.styleProfile} style preference.`
                              }));
                              navigate(`/look/${look.id}`);
                            }}
                            className="bg-netflix-accent text-white px-4 py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors text-sm flex items-center gap-2"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
