import { HeroSection } from "@/components/HeroSection";
import { LookSection } from "@/components/LookSection";
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
import { Shuffle } from "lucide-react";

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

  useEffect(() => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
    }
  }, []);

  const { data: suggestedItems, isLoading } = useQuery({
    queryKey: ['dashboardItems', selectedMood],
    queryFn: async () => {
      const items = await fetchDashboardItems();
      if (items.length === 0) {
        toast({
          title: "No items found",
          description: "We couldn't find any items matching your style. Please try adjusting your preferences.",
        });
      }
      return items;
    },
    enabled: !!userStyle,
    staleTime: 0,
  });

  const groupItemsByOutfit = (items: any[] = []) => {
    if (!items || items.length === 0) return [];
    
    const uniqueOutfits = [];
    const usedIds = new Set();

    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    
    for (const occasion of occasions) {
      const top = items.find(item => 
        item.type.toLowerCase() === 'top' && 
        !usedIds.has(item.id)
      );
      
      const bottom = items.find(item => 
        item.type.toLowerCase() === 'bottom' && 
        !usedIds.has(item.id)
      );
      
      const shoes = items.find(item => 
        item.type.toLowerCase() === 'shoes' && 
        !usedIds.has(item.id)
      );

      if (top && bottom && shoes) {
        uniqueOutfits.push({ top, bottom, shoes });
        usedIds.add(top.id);
        usedIds.add(bottom.id);
        usedIds.add(shoes.id);
      }
    }

    console.log('Created unique outfits:', uniqueOutfits.length);
    return uniqueOutfits;
  };

  const generateFeaturedLooks = (): Look[] => {
    if (!userStyle || !suggestedItems || suggestedItems.length === 0) {
      console.log('No items available for looks');
      return [];
    }

    console.log('Generating looks with items:', suggestedItems);
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const outfits = groupItemsByOutfit(suggestedItems);
    
    return occasions.map((occasion, index) => {
      const outfit = outfits[index];
      if (!outfit) return null;

      const lookItems = [];
      let totalPrice = 0;

      if (outfit.top) {
        lookItems.push({
          id: outfit.top.id,
          image: outfit.top.image,
          type: 'top' as const,
        });
        const topPrice = outfit.top.price?.replace(/[^0-9.]/g, '') || '0';
        totalPrice += parseFloat(topPrice);
      }

      if (outfit.bottom) {
        lookItems.push({
          id: outfit.bottom.id,
          image: outfit.bottom.image,
          type: 'bottom' as const,
        });
        const bottomPrice = outfit.bottom.price?.replace(/[^0-9.]/g, '') || '0';
        totalPrice += parseFloat(bottomPrice);
      }

      if (outfit.shoes) {
        lookItems.push({
          id: outfit.shoes.id,
          image: outfit.shoes.image,
          type: 'shoes' as const,
        });
        const shoesPrice = outfit.shoes.price?.replace(/[^0-9.]/g, '') || '0';
        totalPrice += parseFloat(shoesPrice);
      }

      if (lookItems.length === 3) {
        console.log('Total price calculated:', totalPrice);
        return {
          id: `look-${index + 1}`,
          title: `${occasion} Look`,
          items: lookItems,
          price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00',
          category: userStyle?.analysis?.styleProfile || "Casual",
          occasion
        };
      }
      return null;
    }).filter(Boolean) as Look[];
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
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-semibold mb-8 relative">
              Personalized Looks
              <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <div className="animate-pulse">Loading your personalized looks...</div>
                </div>
              ) : generateFeaturedLooks().map((look) => (
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
                    <button
                      onClick={() => {
                        localStorage.setItem(`look-${look.id}`, JSON.stringify({
                          ...look,
                          description: `A curated ${look.occasion.toLowerCase()} look that matches your style preferences.`
                        }));
                        navigate(`/look/${look.id}`);
                      }}
                      className="bg-netflix-accent text-white px-4 py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
