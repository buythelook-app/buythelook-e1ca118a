import { useState, useEffect } from "react";
import { findMatchingClothingItems, generateOutfit, getOutfitColors } from "@/services/outfitGenerationService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Info, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { transformImageUrl } from "@/utils/imageUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// סוגי מבני גוף
const bodyStructures = [
  { value: "X", label: "שעון חול" },
  { value: "V", label: "משולש הפוך" },
  { value: "H", label: "מלבן" },
  { value: "O", label: "תפוח" },
  { value: "A", label: "אגס" }
];

// סוגי סגנונות
const styleTypes = [
  { value: "classic", label: "קלאסי" },
  { value: "romantic", label: "רומנטי" },
  { value: "minimalist", label: "מינימליסטי" },
  { value: "casual", label: "יומיומי" },
  { value: "sporty", label: "ספורטיבי" }
];

// סוגי מצבי רוח
const moodTypes = [
  { value: "elegant", label: "אלגנטי" },
  { value: "casual", label: "יומיומי" },
  { value: "energized", label: "אנרגטי" }
];

interface OutfitItem {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  color: string;
}

export function RealOutfitVisualizer() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bodyShape, setBodyShape] = useState<string>("X");
  const [style, setStyle] = useState<string>("classic");
  const [mood, setMood] = useState<string>("elegant");
  const [outfitItems, setOutfitItems] = useState<Record<string, OutfitItem[]>>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("top");
  const [showImagePath, setShowImagePath] = useState<boolean>(false);
  const [userLiked, setUserLiked] = useState<boolean | undefined>(undefined);
  const [showFeedbackInput, setShowFeedbackInput] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  // טען מידע שמור
  useEffect(() => {
    // נסה לטעון העדפות מישיון לוקאלי
    const styleData = localStorage.getItem('styleAnalysis');
    if (styleData) {
      try {
        const parsedData = JSON.parse(styleData);
        if (parsedData?.analysis?.bodyShape) {
          setBodyShape(parsedData.analysis.bodyShape);
        }
        if (parsedData?.analysis?.styleProfile) {
          setStyle(parsedData.analysis.styleProfile);
        }
      } catch (e) {
        console.error("Error parsing stored style data:", e);
      }
    }

    // טען מצב רוח נוכחי
    const currentMood = localStorage.getItem('current-mood');
    if (currentMood) {
      setMood(currentMood);
    }

    // בדוק אם יש נתוני תלבושת שמורים בזיכרון המקומי
    const lastOutfitData = localStorage.getItem('last-outfit-data');
    if (lastOutfitData) {
      try {
        const parsedOutfit = JSON.parse(lastOutfitData);
        setRecommendations(parsedOutfit.recommendations || []);
        setDescription(parsedOutfit.description || "");
      } catch (e) {
        console.error("Error parsing stored outfit data:", e);
      }
    }
  }, []);

  const generateNewOutfit = async () => {
    try {
      setLoading(true);
      setError(null);

      // נקה תוצאות קודמות
      setOutfitItems({});
      
      // קריאה ל-API ליצירת תלבושת חדשה
      const outfitResponse = await generateOutfit({
        bodyStructure: bodyShape as any,
        style: style as any,
        mood
      });
      
      if (!outfitResponse.success || !outfitResponse.data) {
        throw new Error(outfitResponse.error || "Failed to generate outfit");
      }

      // שלוף את הצבעים של התלבושת
      const colors = getOutfitColors();
      
      // מצא פריטי לבוש מתאימים לצבעים
      const matchingItems = await findMatchingClothingItems(colors);
      
      setOutfitItems(matchingItems);
      
      // שלוף המלצות והסבר על התלבושת
      const outfitData = outfitResponse.data[0];
      setRecommendations(outfitData.recommendations || []);
      setDescription(outfitData.description || "");
      
      toast.success("נוצרה תלבושת חדשה!");
    } catch (err: any) {
      console.error("Error generating outfit:", err);
      setError(err.message || "שגיאה ביצירת תלבושת");
      toast.error("אירעה שגיאה ביצירת התלבושת");
    } finally {
      setLoading(false);
    }
  };

  // רשימת הכרטיסיות - סוגי פריטים
  const itemTypes = [
    { id: "top", label: "עליון" },
    { id: "bottom", label: "תחתון" },
    { id: "shoes", label: "נעליים" }
  ];

  // הוסף מעיל אם קיים
  if (outfitItems.coat && outfitItems.coat.length > 0) {
    itemTypes.push({ id: "coat", label: "מעיל/ז׳קט" });
  }

  // פונקציה לטיפול בשגיאות בטעינת תמונות
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Error loading image: ${e.currentTarget.src}`);
    e.currentTarget.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';
  };

  const handleFeedback = (liked: boolean) => {
    setUserLiked(liked);
    
    if (!liked) {
      setShowFeedbackInput(true);
    } else {
      setShowFeedbackInput(false);
      // Dispatch feedback event for learning immediately for likes
      window.dispatchEvent(new CustomEvent('outfit-feedback', {
        detail: { 
          lookId: `${bodyShape}-${style}-${mood}`, 
          liked: true, 
          disliked: false 
        }
      }));
      toast.info('תודה! הלוק נשמר בהעדפות שלך');
    }
  };

  const handleFeedbackSubmit = () => {
    // Dispatch feedback event with comment
    window.dispatchEvent(new CustomEvent('outfit-feedback', {
      detail: { 
        lookId: `${bodyShape}-${style}-${mood}`, 
        liked: false, 
        disliked: true,
        comment: feedbackComment 
      }
    }));
    
    setShowFeedbackInput(false);
    setFeedbackComment('');
    toast.info('תודה על המשוב! נשתמש בו כדי לשפר את ההמלצות');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">יוצר תלבושות חכם</h2>
          <p className="text-gray-600 text-sm">בחר את מבנה הגוף, הסגנון ומצב הרוח, ונייצר עבורך תלבושת מותאמת אישית</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* בחירת מבנה גוף */}
          <select 
            value={bodyShape} 
            onChange={(e) => setBodyShape(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            {bodyStructures.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* בחירת סגנון */}
          <select 
            value={style} 
            onChange={(e) => setStyle(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            {styleTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* בחירת מצב רוח */}
          <select 
            value={mood} 
            onChange={(e) => setMood(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            {moodTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button 
            onClick={generateNewOutfit} 
            disabled={loading}
            className="flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            צור תלבושת
          </Button>

          <Button 
            onClick={() => setShowImagePath(!showImagePath)} 
            variant="outline"
            className="flex items-center gap-1"
            title="הצג/הסתר נתיבי תמונות"
          >
            <Info className="h-4 w-4" />
            {showImagePath ? "הסתר נתיבים" : "הצג נתיבים"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>שגיאה</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2 text-lg">יוצר תלבושת מותאמת אישית...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2">
            {description && (
              <div className="bg-slate-50 p-4 rounded-lg mb-4 text-right border">
                <h3 className="font-semibold text-lg mb-2">המלצת הסטייליסט:</h3>
                <p>{description}</p>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                {itemTypes.map(type => (
                  <TabsTrigger 
                    key={type.id} 
                    value={type.id}
                    disabled={!outfitItems[type.id] || outfitItems[type.id].length === 0}
                  >
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {itemTypes.map(type => (
                <TabsContent key={type.id} value={type.id} className="mt-0">
                  {!outfitItems[type.id] || outfitItems[type.id].length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border">
                      <p className="text-gray-500">
                        {Object.keys(outfitItems).length === 0 
                          ? "לחץ על 'צור תלבושת' כדי להתחיל" 
                          : `לא נמצאו פריטי ${type.label} מתאימים`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {outfitItems[type.id].map(item => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="relative aspect-square w-full">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img 
                                    src={transformImageUrl(item.image) || '/placeholder.svg'}
                                    alt={item.name}
                                    className="object-cover w-full h-full"
                                    onError={handleImageError}
                                  />
                                </TooltipTrigger>
                                {showImagePath && (
                                  <TooltipContent>
                                    <p className="max-w-xs break-all">
                                      {item.image}
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div className="rtl">
                                <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                                <p className="text-gray-600 text-sm">{item.price}</p>
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {item.color}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>טיפים והמלצות</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <ul className="space-y-2 text-right">
                    {recommendations.map((tip, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center">צור תלבושת כדי לקבל טיפי סטיילינג</p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {/* Feedback buttons */}
                <div className="flex justify-center gap-2 w-full mb-2">
                  <Button
                    variant={userLiked === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedback(true)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    אהבתי את הלוק!
                  </Button>
                  <Button
                    variant={userLiked === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedback(false)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    לא מתאים לי
                  </Button>
                </div>

                {/* Feedback input for dislikes */}
                {showFeedbackInput && (
                  <div className="w-full space-y-2">
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="מה לא מתאים? (למשל: הצבעים, הסגנון, הגזרה...)"
                      className="w-full p-2 border rounded-md text-sm min-h-[80px] resize-none"
                      dir="rtl"
                    />
                    <Button 
                      size="sm"
                      className="w-full" 
                      onClick={handleFeedbackSubmit}
                    >
                      שלח משוב
                    </Button>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={generateNewOutfit}
                  disabled={loading}
                >
                  הצע תלבושת אחרת
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
