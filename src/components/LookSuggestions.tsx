import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Loader2, ShoppingCart, Shuffle, ThumbsUp, ThumbsDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LookCanvas } from "./LookCanvas";
import { useCartStore } from "./Cart";
import { HomeButton } from "./HomeButton";
import { StyleRulers } from "./look/StyleRulers";
import { fetchFirstOutfitSuggestion } from "@/services/lookService";
import { useOutfitGeneration } from "@/hooks/useOutfitGeneration";
import { useEnhancedOutfitGeneration } from "@/hooks/useEnhancedOutfitGeneration";
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
  const [isRefetching, setIsRefetching] = useState(false);
  const [elegance, setElegance] = useState(75);
  const [colorIntensity, setColorIntensity] = useState(60);
  const [userStylePreference, setUserStylePreference] = useState<string | null>(null);
  const { isGenerating, generateOutfit } = useOutfitGeneration();
  const [userLiked, setUserLiked] = useState<boolean | undefined>(undefined);
  const [showFeedbackInput, setShowFeedbackInput] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  
  // הוספת Enhanced Outfit Generation
  const { 
    isGenerating: isGeneratingEnhanced, 
    generateOutfitWithLearning, 
    recommendations: enhancedRecommendations 
  } = useEnhancedOutfitGeneration();
  
  const hasQuizData = localStorage.getItem('styleAnalysis') !== null;

  useEffect(() => {
    const styleData = localStorage.getItem('styleAnalysis');
    if (styleData) {
      try {
        const parsedData = JSON.parse(styleData);
        const styleProfile = parsedData?.analysis?.styleProfile || null;
        setUserStylePreference(styleProfile);
        console.log("Loaded user style preference:", styleProfile);
        
        if (styleProfile === 'Minimalist') {
          setElegance(85);
          setColorIntensity(30);
        }
      } catch (error) {
        console.error("Error parsing style data:", error);
      }
    }
  }, []);

  const { data: dashboardItems, isLoading, error, refetch } = useQuery({
    queryKey: ['firstOutfitSuggestion'],
    queryFn: () => fetchFirstOutfitSuggestion(false),
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: hasQuizData,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Error",
            description: "Failed to load outfit suggestions. Please try again.",
            variant: "destructive",
          });
        }
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
    if (!type) {
      console.warn('Empty type received in mapItemType');
      return 'top';
    }

    const lowerType = type.toLowerCase().trim().replace(/\s+/g, ' ');
    
    console.log('Mapping type:', type, 'Normalized to:', lowerType);

    const underwearTerms = ['underwear', 'lingerie', 'bra', 'panties', 'briefs', 'boxer', 'thong'];
    for (const term of underwearTerms) {
      if (lowerType.includes(term)) {
        console.log(`Detected underwear term: ${term} in type: ${lowerType}, skipping`);
        return 'top';
      }
    }

    const bottomKeywords = ['pants', 'skirt', 'חצאית', 'shorts', 'jeans', 'trousers', 'bottom'];
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
      'skirt': 'bottom', // FIXED: Skirt should be bottom
      'חצאית': 'bottom', // FIXED: Hebrew skirt should be bottom
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

  const handleEleganceChange = (value: number[]) => {
    setElegance(value[0]);
  };

  const handleColorIntensityChange = (value: number[]) => {
    setColorIntensity(value[0]);
  };

  const handleFeedback = (liked: boolean) => {
    setUserLiked(liked);
    
    if (!liked) {
      setShowFeedbackInput(true);
    } else {
      setShowFeedbackInput(false);
      if (dashboardItems) {
        window.dispatchEvent(new CustomEvent('outfit-feedback', {
          detail: { 
            lookId: 'look-suggestion', 
            liked: true, 
            disliked: false,
            lookData: { items: dashboardItems }
          }
        }));
      }
      toast({
        title: 'תודה!',
        description: 'הלוק נשמר בהעדפות שלך'
      });
    }
  };

  const handleFeedbackSubmit = () => {
    if (dashboardItems) {
      window.dispatchEvent(new CustomEvent('outfit-feedback', {
        detail: { 
          lookId: 'look-suggestion', 
          liked: false, 
          disliked: true,
          comment: feedbackComment,
          lookData: { items: dashboardItems }
        }
      }));
    }
    
    setShowFeedbackInput(false);
    setFeedbackComment('');
    toast({
      title: 'תודה על המשוב!',
      description: 'נשתמש בו כדי לשפר את ההמלצות'
    });
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

  const handleTryDifferentLook = async () => {
    setIsRefetching(true);
    
    try {
      console.log("🔄 מייצר מראה חדש בהתאם לסינונים...");
      
      // קרא את כל הסינונים הנבחרים מהעמוד הראשי
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      const selectedEvent = localStorage.getItem('selected-event');
      const currentMood = localStorage.getItem('current-mood');
      const budgetData = localStorage.getItem('outfit-budget');
      
      let selectedStyle = 'Casual'; // ברירת מחדל
      let budget = 500;
      
      // חלץ את הסגנון מ-styleAnalysis
      if (styleAnalysis) {
        try {
          const parsed = JSON.parse(styleAnalysis);
          selectedStyle = parsed.analysis?.styleProfile || 'Casual';
        } catch (error) {
          console.warn("שגיאה בפענוח נתוני סגנון:", error);
        }
      }
      
      // חלץ תקציב
      if (budgetData) {
        try {
          const parsed = JSON.parse(budgetData);
          budget = parsed.budget || 500;
        } catch (error) {
          console.warn("שגיאה בפענוח נתוני תקציב:", error);
        }
      }
      
      console.log("🎨 מייצר תלבושת עם הפרמטרים:", {
        style: selectedStyle,
        mood: currentMood,
        event: selectedEvent,
        budget: budget
      });
      
      // שימוש בשירות החדש ליצירת תלבושת לפי סגנון
      const { createStyleOutfit, getStyleRecommendations } = await import('@/services/styleOutfitService');
      const styleOutfit = await createStyleOutfit(selectedStyle as any);
      
      if (styleOutfit.top || styleOutfit.bottom || styleOutfit.shoes) {
        console.log("✅ תלבושת חדשה נוצרה בהצלחה לסגנון:", selectedStyle);
        
        // כפיית רענון השאילתה לקבלת נתונים חדשים
        await refetch();
        
        // קבלת המלצות לסגנון
        const styleRecommendations = getStyleRecommendations(selectedStyle as any);
        setRecommendations(styleRecommendations);
        
        const moodText = currentMood ? ` במצב רוח ${currentMood}` : '';
        const eventText = selectedEvent ? ` לאירוע ${selectedEvent}` : '';
        
        toast({
          title: `תלבושת ${selectedStyle} חדשה נוצרה! 🎨`,
          description: `הנה קומבינציית ${selectedStyle} חדשה${moodText}${eventText}`,
        });
      } else {
        console.warn("⚠️ נכשל ביצירת תלבושת חדשה לסגנון:", selectedStyle);
        
        toast({
          title: "שגיאה ביצירת תלבושת",
          description: `לא הצלחנו ליצור תלבושת ${selectedStyle} חדשה. אנא נסה שוב.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ שגיאה ביצירת מראה שונה:", error);
      
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת תלבושת חדשה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsRefetching(false);
    }
  };

  const validateColor = (color: string): string => {
    const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
                        CSS.supports('color', color);
    return isValidColor ? color : '#CCCCCC';
  };

  const canvasItems = dashboardItems?.map(item => {
    console.log('Processing item:', item);
    const mappedType = mapItemType(item.type);
    console.log(`Final mapping: ${item.type} -> ${mappedType}`);
    return {
      id: item.id,
      image: item.image,
      type: mappedType,
      name: item.name
    };
  }).filter(item => {
    // Filter logic: if there's a dress, only show dress + shoes
    const hasDress = dashboardItems?.some(i => mapItemType(i.type) === 'dress');
    
    if (hasDress) {
      // If there's a dress, only show dress and shoes
      return item.type === 'dress' || item.type === 'shoes';
    } else {
      // Otherwise show top + bottom + shoes
      return item.type === 'top' || item.type === 'bottom' || item.type === 'shoes';
    }
  });

  const hasAllRequiredItems = () => {
    if (!canvasItems) return false;
    
    const types = canvasItems.map(item => item.type);
    const hasDress = types.includes('dress');
    
    if (hasDress) {
      // For dress outfit: need dress + shoes
      return types.includes('dress') && types.includes('shoes');
    } else {
      // For regular outfit: need top + bottom + shoes
      return types.includes('top') && types.includes('bottom') && types.includes('shoes');
    }
  };

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

  return (
    <>
      <HomeButton />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Your Curated Look with AI Learning</h1>
        {userStylePreference && (
          <p className="text-lg text-netflix-accent mb-2">
            Based on your {userStylePreference} style preference
          </p>
        )}
        <p className="text-sm text-gray-600 mb-6">
          🧠 AI agents are now learning from your homepage preferences to create better outfits
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-8 flex flex-col items-center">
              <div className="relative w-[300px]">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden pb-4">
                  <div className="relative">
                    {(isRefetching || isGenerating || isGeneratingEnhanced) ? (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-netflix-accent mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {isGeneratingEnhanced ? "יוצר תלבושת עם למידה..." : "יוצר תלבושת חדשה..."}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    <LookCanvas items={canvasItems} width={300} height={480} />
                    <div className="absolute bottom-0 left-4 right-4 flex justify-between gap-2">
                      <Button 
                        onClick={() => handleAddToCart(dashboardItems)}
                        className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                        disabled={isRefetching || isGenerating || isGeneratingEnhanced || !hasAllRequiredItems()}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Buy the look
                      </Button>
                      <Button
                        onClick={handleTryDifferentLook}
                        className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                        disabled={isRefetching || isGenerating || isGeneratingEnhanced}
                      >
                        <Shuffle className="mr-1 h-3 w-3" />
                        {(isRefetching || isGeneratingEnhanced) ? "מחולל..." : "Try different"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Feedback buttons */}
                  <div className="flex justify-center gap-2 mt-3 px-4">
                    <button
                      onClick={() => handleFeedback(true)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-xs ${
                        userLiked === true 
                          ? 'bg-netflix-accent text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Like</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-xs ${
                        userLiked === false 
                          ? 'bg-netflix-accent text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Dislike</span>
                    </button>
                  </div>

                  {/* Feedback input for dislikes */}
                  {showFeedbackInput && (
                    <div className="space-y-2 mt-3 px-4">
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="מה לא מתאים? (למשל: הצבעים, הסגנון, הגזרה...)"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 text-xs min-h-[60px] resize-none"
                        dir="rtl"
                      />
                      <button 
                        onClick={handleFeedbackSubmit}
                        className="w-full bg-netflix-accent text-white px-3 py-2 rounded-lg hover:bg-netflix-accent/90 transition-all duration-300 text-xs"
                      >
                        שלח משוב
                      </button>
                    </div>
                  )}
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
                      disabled={isRefetching || isGenerating || isGeneratingEnhanced}
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
    </>
  );
};
