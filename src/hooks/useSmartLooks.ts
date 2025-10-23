import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateOutfit, findMatchingClothingItems } from '@/services/outfitGenerationService';
import { PersonalizationAgent } from '@/agents/personalizationAgent';
import { validatorAgent } from '@/agents/validatorAgent';
import logger from '@/lib/logger';
import { toast } from 'sonner';
import { getLocalImagePath } from '@/utils/localImageMapper';
import { DashboardItem } from '@/types/lookTypes';

interface OutfitSuggestion {
  top: string;
  bottom: string;
  shoes: string;
  coat?: string;
  description: string;
  recommendations: string[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}
import { agentCrew } from '@/agents/crew';

interface UseSmartLooksParams {
  userProfile?: any;
  mood?: string;
  occasion?: string;
}

export const useSmartLooks = ({ userProfile, mood, occasion }: UseSmartLooksParams = {}) => {
  const [selectedMood, setSelectedMood] = useState<string>(
    localStorage.getItem('current-mood') || mood || 'elegant'
  );

  // שלב 1+2: בסיס צבעים מהיר + פריטי Zara
  const { data: baseData, isLoading: isLoadingBase, error: baseError } = useQuery({
    queryKey: ['smart-looks-base', selectedMood, occasion],
    queryFn: async () => {
      try {
        logger.info('🚀 [useSmartLooks] שלב 1+2: מביא בסיס צבעים ופריטי Zara', {
          context: 'useSmartLooks',
          data: { mood: selectedMood, occasion }
        });

        // שלב 1: קבל צבעים מהירים
        const styleProfile = localStorage.getItem('styleProfile') || 'classic';
        const bodyShape = localStorage.getItem('bodyShape') || 'H';
        
        const outfitData = await generateOutfit({ 
          bodyStructure: (bodyShape || 'H') as 'X' | 'V' | 'H' | 'O' | 'A',
          mood: selectedMood,
          style: (styleProfile || 'classic') as 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty'
        });

        if (!outfitData.success || !outfitData.data) {
          throw new Error('Failed to generate outfit colors');
        }

        // שלב 2: מצא פריטים מתאימים מ-Zara  
        const outfitSuggestions = outfitData.data || [];
        
        // המר את התוצאות לפורמט של צבעים
        const colorsMap: Record<string, string> = {};
        if (outfitSuggestions.length > 0) {
          const firstSuggestion = outfitSuggestions[0];
          colorsMap.top = firstSuggestion.top;
          colorsMap.bottom = firstSuggestion.bottom;
          colorsMap.shoes = firstSuggestion.shoes;
          if (firstSuggestion.coat) colorsMap.coat = firstSuggestion.coat;
        }
        
        const items = await findMatchingClothingItems(colorsMap);

        logger.info('✅ [useSmartLooks] שלבים 1+2 הושלמו', {
          context: 'useSmartLooks',
          data: { itemsFound: Object.keys(items).length }
        });

        return { colors: outfitData.data, items };
      } catch (error) {
        logger.error('❌ [useSmartLooks] שגיאה בשלבים 1+2', {
          context: 'useSmartLooks',
          data: { error }
        });
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // שלב 3+4+5: התאמה אישית + סטיילינג + ולידציה
  const { data: smartLooks, isLoading: isProcessing, error: processError } = useQuery({
    queryKey: ['smart-looks-enhanced', baseData, selectedMood, occasion],
    queryFn: async () => {
      if (!baseData) return null;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'anonymous';

        logger.info('🎯 [useSmartLooks] שלבים 3-5: עיבוד חכם', {
          context: 'useSmartLooks',
          data: { userId, hasBaseData: !!baseData }
        });

        // שלב 3: התאמה אישית עם PersonalizationAgent
        const personalizationAgent = new PersonalizationAgent();
        const personalizedResult = await personalizationAgent.run(userId);

        if (!personalizedResult.success) {
          logger.warn('⚠️ [useSmartLooks] PersonalizationAgent נכשל, ממשיך עם נתוני בסיס', {
            context: 'useSmartLooks'
          });
        }

        // שלב 4: בניית לוקים מהנתונים
        const looksData = personalizedResult.success && personalizedResult.data?.looks 
          ? personalizedResult.data.looks 
          : Object.entries(baseData.items).map(([occasion, items]: [string, any]) => ({
              id: `look-${occasion}-${Date.now()}`,
              items: Array.isArray(items) ? items.slice(0, 3) : [],
              style: localStorage.getItem('styleProfile') || 'classic',
              occasion,
              description: `${selectedMood} look for ${occasion}`,
              enhanced: false
            }));

        // שלב 5: ולידציה עם ValidatorAgent
        const validationResult = await validatorAgent.runWithOutfitData(userId, looksData);

        const finalLooks = validationResult.success && validationResult.data?.isCompatible
          ? looksData
          : looksData.filter((_: any, index: number) => {
              const result = validationResult.data?.validationResults?.[index];
              return !result || result.validationScore >= 70;
            });

        logger.info('✅ [useSmartLooks] שלבים 3-5 הושלמו', {
          context: 'useSmartLooks',
          data: { 
            totalLooks: finalLooks.length,
            validationScore: validationResult.data?.overallScore 
          }
        });

        // שלב 6 (async): שליחה ל-crew ללמידה ברקע
        agentCrew.run(userId).catch(err => {
          logger.warn('⚠️ [useSmartLooks] למידה ברקע נכשלה (לא משפיע על המשתמש)', {
            context: 'useSmartLooks',
            data: { error: err }
          });
        });

        return {
          looks: finalLooks,
          validationScore: validationResult.data?.overallScore || 85,
          enhanced: personalizedResult.success
        };

      } catch (error) {
        logger.error('❌ [useSmartLooks] שגיאה בעיבוד חכם', {
          context: 'useSmartLooks',
          data: { error }
        });
        throw error;
      }
    },
    enabled: !!baseData,
    retry: 1,
    staleTime: 1000 * 60 * 5
  });

  // המרה ל-DashboardItems
  const convertToLooks = useCallback((data: any) => {
    if (!data?.looks) return {};

    const looksByOccasion: Record<string, DashboardItem[]> = {
      Work: [],
      Casual: [],
      Evening: [],
      Weekend: []
    };

    data.looks.forEach((look: any) => {
      const occasion = look.occasion || 'Casual';
      const items = (look.items || []).map((item: any) => {
        const itemType = item.type || 'top';
        const imageUrl = item.image || item.url || '';
        
        return {
          id: item.id || `item-${Date.now()}-${Math.random()}`,
          name: item.name || item.title || item.product_name || 'Unknown Item',
          image: imageUrl.startsWith('http') ? imageUrl : getLocalImagePath(item.id, itemType as any),
          type: itemType,
          price: parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0,
          color: item.color || item.colour || 'unknown',
          url: item.url || item.product_url || '#'
        };
      });

      if (looksByOccasion[occasion]) {
        looksByOccasion[occasion].push(...items);
      } else {
        looksByOccasion.Casual.push(...items);
      }
    });

    return looksByOccasion;
  }, []);

  const looks = smartLooks ? convertToLooks(smartLooks) : {};
  const isLoading = isLoadingBase || isProcessing;
  const error = baseError || processError;

  // טיפול בשגיאות
  useEffect(() => {
    if (error) {
      logger.error('❌ [useSmartLooks] שגיאה כללית', {
        context: 'useSmartLooks',
        data: { error }
      });
      toast.error('שגיאה בטעינת המלצות הלבוש');
    }
  }, [error]);

  const handleMoodSelect = useCallback((newMood: string) => {
    logger.info('🎭 [useSmartLooks] שינוי מצב רוח', {
      context: 'useSmartLooks',
      data: { oldMood: selectedMood, newMood }
    });
    setSelectedMood(newMood);
    localStorage.setItem('current-mood', newMood);
  }, [selectedMood]);

  return {
    looks,
    isLoading,
    error,
    selectedMood,
    handleMoodSelect,
    validationScore: smartLooks?.validationScore,
    isEnhanced: smartLooks?.enhanced || false
  };
};
