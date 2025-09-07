import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        title: "נא להכניס תיאור",
        description: "אנא כתוב מה אתה מחפש כדי שנוכל לעזור לך",
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
        title: "ניתוח הושלם!",
        description: "מחפש עבורך את הפריטים המתאימים ביותר",
      });
      
      onStyleAnalyzed(analyzedFilters);
      setInputText("");
    } catch (error) {
      toast({
        title: "שגיאה בניתוח",
        description: "נסה שוב או השתמש בפילטרים הרגילים",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-netflix-card border-netflix-border mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-netflix-accent">
          <Sparkles className="w-5 h-5" />
          ספר לנו מה אתה מחפש
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="למשל: 'אני מחפש משהו אלגנטי לעבודה שלא יעלה יותר מדי' או 'רוצה משהו צעיר וטרנדי למסיבה'"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="resize-none bg-netflix-background border-netflix-border text-netflix-text placeholder:text-netflix-text/60"
          rows={3}
        />
        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-netflix-accent hover:bg-netflix-accent/90 text-white"
        >
          {isAnalyzing ? "מנתח..." : "חפש עבורי"}
        </Button>
      </CardContent>
    </Card>
  );
};