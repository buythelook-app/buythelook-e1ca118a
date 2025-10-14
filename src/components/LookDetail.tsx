
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { HomeButton } from "./HomeButton";
import { LookHeader } from "./look/LookHeader";
import { LookActions } from "./look/LookActions";
import { LookItemsList } from "./look/LookItemsList";
import { StyleRulers } from "./look/StyleRulers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LookCanvas } from "./LookCanvas";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export const LookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [look, setLook] = useState<any>(null);
  const [elegance, setElegance] = useState(75);
  const [colorIntensity, setColorIntensity] = useState(60);
  const [userStyle, setUserStyle] = useState<string | null>(null);
  const [userLiked, setUserLiked] = useState<boolean | undefined>(undefined);
  const [showFeedbackInput, setShowFeedbackInput] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  useEffect(() => {
    // Load the user's style preference
    const styleData = localStorage.getItem('styleAnalysis');
    if (styleData) {
      try {
        const parsedData = JSON.parse(styleData);
        const styleProfile = parsedData?.analysis?.styleProfile || null;
        setUserStyle(styleProfile);
      } catch (error) {
        console.error("Error parsing style data:", error);
      }
    }

    if (id) {
      const storedLook = localStorage.getItem(`look-${id}`);
      if (storedLook) {
        setLook(JSON.parse(storedLook));
      } else {
        toast.error("Look not found");
        navigate('/home');
      }
    }
  }, [id, navigate]);

  if (!look) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading look details...</div>
      </div>
    );
  }

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
      window.dispatchEvent(new CustomEvent('outfit-feedback', {
        detail: { 
          lookId: look.id, 
          liked: true, 
          disliked: false,
          lookData: look
        }
      }));
      toast.info('תודה! הלוק נשמר בהעדפות שלך');
    }
  };

  const handleFeedbackSubmit = () => {
    window.dispatchEvent(new CustomEvent('outfit-feedback', {
      detail: { 
        lookId: look.id, 
        liked: false, 
        disliked: true,
        comment: feedbackComment,
        lookData: look
      }
    }));
    
    setShowFeedbackInput(false);
    setFeedbackComment('');
    toast.info('תודה על המשוב! נשתמש בו כדי לשפר את ההמלצות');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 text-gray-900 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
          className="mb-4 md:mb-6 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        >
          ← Back
        </Button>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-8">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">{look.title}</h2>
                  {userStyle && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {userStyle} style
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{look.description}</p>
                <div className="relative aspect-[3/4] w-full bg-white rounded-lg overflow-hidden">
                  <LookCanvas 
                    items={look.items.map((item: any) => ({
                      id: item.id,
                      image: item.image,
                      type: item.type
                    }))}
                    width={600}
                    height={800}
                  />
                </div>
                
                {/* Feedback buttons */}
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handleFeedback(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      userLiked === true 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">אהבתי</span>
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      userLiked === false 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-sm">לא מתאים</span>
                  </button>
                </div>

                {/* Feedback input for dislikes */}
                {showFeedbackInput && (
                  <div className="space-y-2 mt-4">
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="מה לא מתאים? (למשל: הצבעים, הסגנון, הגזרה...)"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 text-sm min-h-[80px] resize-none"
                      dir="rtl"
                    />
                    <button 
                      onClick={handleFeedbackSubmit}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all duration-300 text-sm"
                    >
                      שלח משוב
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-4 md:mt-6">
                <LookActions
                  id={look.id}
                  image={look.items[0]?.image}
                  title={look.title}
                  price={look.price}
                  category={look.category}
                  items={look.items}
                />
              </div>
            </div>

            <div className="mt-4 md:mt-6">
              <LookItemsList look={look} />
            </div>
          </div>

          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-4">
              <StyleRulers
                elegance={elegance}
                colorIntensity={colorIntensity}
                onEleganceChange={handleEleganceChange}
                onColorIntensityChange={handleColorIntensityChange}
              />
            </div>
          </div>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
