
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { enhancedAgentCrew } from "@/agents/enhancedCrew";
import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";

export function useEnhancedOutfitGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { toast } = useToast();
  
  const generateOutfitWithLearning = async (forceRefresh: boolean = true) => {
    setIsGenerating(true);
    
    try {
      logger.info("🚀 מתחיל יצירת תלבושת משופרת עם למידה", { 
        context: "useEnhancedOutfitGeneration",
        data: { forceRefresh }
      });
      
      // קבלת משתמש נוכחי
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous-user';
      
      // יצירת הקשר משופר עם פרמטרי למידה
      const enhancedContext = {
        userId,
        forceRefresh,
        randomSeed: Math.random(),
        timestamp: Date.now(),
        learningEnabled: true,
        attempt: Date.now() // משתמש בזמן כניסיון ייחודי
      };
      
      logger.info("🧠 הקשר משופר עם למידה", {
        context: "useEnhancedOutfitGeneration",
        data: enhancedContext
      });
      
      // שימוש ב-Enhanced Agent Crew עם מנגנון למידה
      const result = await enhancedAgentCrew.runWithLearning(enhancedContext);
      
      if (!result.success) {
        logger.error("❌ יצירת תלבושת משופרת נכשלה", {
          context: "useEnhancedOutfitGeneration",
          data: { error: result.error }
        });
        
        toast({
          title: "יצירה נכשלה",
          description: result.error || "לא הצלחנו ליצור תלבושת באמצעות אייגנטים משופרים.",
          variant: "destructive",
        });
        
        return {
          success: false,
          items: []
        };
      }
      
      // חילוץ הלוק הראשון מהתוצאות המשופרות
      const looks = result.data?.looks || [];
      if (looks.length === 0) {
        logger.warn("לא נוצרו לוקים על ידי אייגנטים משופרים");
        
        toast({
          title: "לא נוצרו תלבושות",
          description: "האייגנטים המשופרים לא הצליחו ליצור תלבושות מתאימות עם הפריטים הזמינים.",
          variant: "destructive",
        });
        
        return {
          success: false,
          items: []
        };
      }
      
      // המרת הלוק הראשון לפורמט DashboardItem
      const firstLook = looks[0];
      const items: DashboardItem[] = firstLook.items.map((item: any) => ({
        id: item.id,
        name: item.title,
        image: item.image,
        type: item.type as any,
        price: item.price
      }));
      
      // עדכון המלצות מהתוצאה המשופרת
      if (result.data?.recommendations && Array.isArray(result.data.recommendations)) {
        setRecommendations(result.data.recommendations);
        localStorage.setItem('style-recommendations', JSON.stringify(result.data.recommendations));
      }
      
      logger.info("✅ יצירת תלבושת משופרת הושלמה בהצלחה", {
        context: "useEnhancedOutfitGeneration",
        data: { 
          itemCount: items.length,
          lookId: firstLook.id,
          hasRecommendations: result.data?.recommendations?.length > 0,
          learningApplied: result.data?.learningData?.applied
        }
      });
      
      sonnerToast.success("נוצרה תלבושת חדשה עם למידה מעמוד הבית! 🧠✨", {
        duration: 3000
      });
      
      return {
        success: true,
        items: items,
        learningData: result.data?.learningData
      };
      
    } catch (error) {
      logger.error('❌ שגיאה ביצירת תלבושת משופרת:', {
        context: "useEnhancedOutfitGeneration",
        data: error
      });
      
      toast({
        title: "יצירה נכשלה",
        description: "לא הצלחנו ליצור תלבושת עם אייגנטים משופרים. אנא נסה שוב.",
        variant: "destructive",
      });
      
      return {
        success: false,
        items: []
      };
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    isGenerating,
    generateOutfitWithLearning,
    recommendations
  };
}
