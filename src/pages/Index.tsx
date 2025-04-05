import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { FilterOptions } from "@/components/filters/FilterOptions";
import { LookCanvas } from "@/components/LookCanvas";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Mood } from "@/components/filters/MoodFilter";
import { MoodFilter } from "@/components/filters/MoodFilter";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems } from "@/services/lookService";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/components/Cart";
import { toast as sonnerToast } from "sonner";

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
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
  const { addLook } = useCartStore();

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

  const { data: occasionOutfits, isLoading, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood],
    queryFn: fetchDashboardItems,
    enabled: !!userStyle,
    staleTime: 0,
  });

  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('current-mood', selectedMood);
      refetch();
    }
  }, [selectedMood, refetch]);

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
  };

  const handleShuffleLook = (occasion: string) => {
    setCombinations(prev => ({
      ...prev,
      [occasion]: (prev[occasion] || 0) + 1
    }));
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <div className="animate-pulse">Loading your personalized looks...</div>
                </div>
              ) : (
                occasions.map((occasion, index) => {
                  const items = occasionOutfits?.[occasion] || [];
                  const look = createLookFromItems(items, occasion, index);
                  
                  if (!look) return null;
                  
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
