import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface FreeTextStyleInputProps {
  onStyleAnalyzed: (filters: {
    style: string;
    budget: string;
    eventType: string;
    mood: string;
  }) => void;
}

export const FreeTextStyleInput = ({ onStyleAnalyzed }: FreeTextStyleInputProps) => {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeStyleRequest = async (text: string) => {
    // Simple AI-like text analysis to map user request to filters
    const lowerText = text.toLowerCase();
    
    // Style mapping
    let style = "classic";
    if (lowerText.includes("מקרי") || lowerText.includes("casual") || lowerText.includes("נוח")) {
      style = "casual";
    } else if (lowerText.includes("רומנטי") || lowerText.includes("romantic") || lowerText.includes("נשי")) {
      style = "romantic";
    } else if (lowerText.includes("מינימליסטי") || lowerText.includes("minimalist") || lowerText.includes("פשוט")) {
      style = "minimalist";
    } else if (lowerText.includes("ספורטיבי") || lowerText.includes("sporty") || lowerText.includes("אתלטי")) {
      style = "sporty";
    } else if (lowerText.includes("boohoo") || lowerText.includes("צעיר") || lowerText.includes("טרנדי")) {
      style = "boohoo";
    }

    // Budget mapping
    let budget = "medium";
    if (lowerText.includes("זול") || lowerText.includes("חסכוני") || lowerText.includes("cheap") || lowerText.includes("budget")) {
      budget = "low";
    } else if (lowerText.includes("יקר") || lowerText.includes("מעוצב") || lowerText.includes("luxury") || lowerText.includes("premium")) {
      budget = "high";
    }

    // Event type mapping
    let eventType = "casual";
    if (lowerText.includes("עבודה") || lowerText.includes("work") || lowerText.includes("משרד") || lowerText.includes("פורמלי")) {
      eventType = "work";
    } else if (lowerText.includes("מסיבה") || lowerText.includes("party") || lowerText.includes("יציאה") || lowerText.includes("ערב")) {
      eventType = "party";
    } else if (lowerText.includes("חתונה") || lowerText.includes("wedding") || lowerText.includes("אירוע")) {
      eventType = "special event";
    } else if (lowerText.includes("ספורט") || lowerText.includes("gym") || lowerText.includes("אימון")) {
      eventType = "sport";
    } else if (lowerText.includes("חוף") || lowerText.includes("beach") || lowerText.includes("קיץ")) {
      eventType = "beach";
    }

    // Mood mapping
    let mood = "confident";
    if (lowerText.includes("אלגנטי") || lowerText.includes("elegant") || lowerText.includes("מעודן")) {
      mood = "elegant";
    } else if (lowerText.includes("אנרגטי") || lowerText.includes("energetic") || lowerText.includes("חיוני")) {
      mood = "energized";
    } else if (lowerText.includes("רגוע") || lowerText.includes("relaxed") || lowerText.includes("נוח")) {
      mood = "relaxed";
    } else if (lowerText.includes("משחק") || lowerText.includes("playful") || lowerText.includes("כיפי")) {
      mood = "playful";
    }

    return { style, budget, eventType, mood };
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Please enter a description",
        description: "Please write what you're looking for so we can help you",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analyzedFilters = await analyzeStyleRequest(inputText);
      
      toast({
        title: "Analysis complete!",
        description: "Finding the best matching items for you",
      });
      
      onStyleAnalyzed(analyzedFilters);
      setInputText("");
    } catch (error) {
      toast({
        title: "Analysis error",
        description: "Try again or use the regular filters",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mb-12 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-fashion-glass rounded-3xl p-8 border border-white/20 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-fashion-accent" />
          <h2 className="text-xl font-semibold text-white">What's your style mood today?</h2>
        </div>
        <div className="space-y-6">
          <Textarea
            placeholder="e.g., 'I'm looking for something elegant for work that won't cost too much' or 'I want something young and trendy for a party'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="resize-none bg-white/5 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm rounded-2xl p-4 min-h-[100px] focus:ring-2 focus:ring-fashion-accent/50 focus:border-fashion-accent/50"
            rows={3}
          />
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-fashion-primary to-fashion-accent hover:from-fashion-primary/90 hover:to-fashion-accent/90 text-white font-medium py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border-0"
          >
            {isAnalyzing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Sparkles className="mr-2 w-5 h-5" />
            )}
            {isAnalyzing ? "Finding your perfect style..." : "Find my style"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};