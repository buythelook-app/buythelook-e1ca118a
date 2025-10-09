import { useEffect } from 'react';
import { feedbackLearningAgent } from '@/agents/feedbackLearningAgent';

/**
 * Hook that listens for outfit feedback events and triggers learning agent
 * Automatically processes user feedback to improve future recommendations
 */
export function useFeedbackTrigger(userId: string | undefined) {
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ [FeedbackTrigger] No userId provided, skipping feedback listener setup');
      return;
    }

    console.log('👂 [FeedbackTrigger] Setting up feedback listener for user:', userId);

    // Listen for feedback events dispatched from outfit cards
    const handleFeedback = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { lookId, liked, disliked, comment } = customEvent.detail;
      
      console.log('📝 [FeedbackTrigger] Feedback received:', {
        lookId,
        liked,
        disliked,
        hasComment: !!comment
      });
      
      try {
        // שמירת הפידבק ישירות לטבלת user_feedback
        const { supabase } = await import('@/lib/supabaseClient');
        
        console.log('💾 [FeedbackTrigger] Saving feedback to database...');
        const { error: saveError } = await (supabase as any)
          .from('user_feedback')
          .insert({
            user_id: userId,
            look_id: lookId,
            is_liked: liked || false,
            is_disliked: disliked || false,
            comment: comment || null,
            feedback_type: 'outfit_rating'
          });
        
        if (saveError) {
          console.error('❌ [FeedbackTrigger] Error saving feedback:', saveError);
        } else {
          console.log('✅ [FeedbackTrigger] Feedback saved to database');
        }
        
        // Process feedback through learning agent
        console.log('🧠 [FeedbackTrigger] Triggering feedback learning agent...');
        
        // Analyze feedback patterns
        const patterns = await feedbackLearningAgent.analyzeFeedbackPatterns(userId);
        
        if (patterns) {
          console.log('✅ [FeedbackTrigger] Feedback patterns analyzed:', {
            preferredColorsCount: patterns.preferredColors.length,
            dislikedItemsCount: patterns.dislikedItems.length,
            likedCombinationsCount: patterns.likedCombinations.length
          });
          
          // Generate learning insights
          const insights = await feedbackLearningAgent.generateLearningInsights(patterns);
          console.log('💡 [FeedbackTrigger] Learning insights generated:', {
            personalizedWeightsCount: Object.keys(insights.personalizedWeights).length,
            colorAffinityScore: insights.colorAffinityScore
          });
          
          // Apply insights to agent configuration
          const applied = await feedbackLearningAgent.applyLearningToAgents(userId, insights);
          
          if (applied) {
            console.log('✅ [FeedbackTrigger] Learning insights applied successfully');
          } else {
            console.warn('⚠️ [FeedbackTrigger] Failed to apply learning insights');
          }
        }
        
      } catch (error) {
        console.error('❌ [FeedbackTrigger] Error processing feedback:', error);
      }
    };
    
    // Add event listener
    window.addEventListener('outfit-feedback', handleFeedback);
    
    console.log('✅ [FeedbackTrigger] Feedback listener registered');
    
    // Cleanup
    return () => {
      console.log('🧹 [FeedbackTrigger] Cleaning up feedback listener');
      window.removeEventListener('outfit-feedback', handleFeedback);
    };
  }, [userId]);
}
