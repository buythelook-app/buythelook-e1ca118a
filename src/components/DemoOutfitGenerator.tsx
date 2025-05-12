
import { Button } from "@/components/ui/button";
import { OutfitAgentCard } from "@/components/OutfitAgentCard";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Define demo items
const generateDemoOutfits = () => {
  // Create demo color palettes
  const tops = ['#2C3E50', '#E74C3C', '#3498DB', '#1ABC9C', '#9B59B6'];
  const bottoms = ['#34495E', '#7F8C8D', '#BDC3C7', '#2C3E50', '#7F8C8D'];
  const shoes = ['#7F8C8D', '#34495E', '#7F8C8D', '#2C3E50', '#E74C3C'];
  
  // Generate demo agent names
  const agentNames = [
    'Classic Style Agent',
    'Modern Minimalist',
    'Trend Spotter',
    'Color Harmony',
    'Body Shape Expert'
  ];
  
  // Generate descriptions
  const descriptions = [
    'אלגנטי עם שילוב של גוונים כהים מתואמים',
    'מינימליסטי עם דגש על צבעים נייטרלים',
    'שילוב נועז של צבעים וטקסטורות עכשוויות',
    'הרמוניה צבעונית מושלמת לפי גלגל הצבעים',
    'מחמיא למבנה גוף בצורת X עם הדגשת המותניים'
  ];
  
  return Array.from({ length: 5 }).map((_, index) => {
    // Generate unique item IDs
    const topId = `demo-top-${index + 1}`;
    const bottomId = `demo-bottom-${index + 1}`;
    const shoeId = `demo-shoe-${index + 1}`;
    
    return {
      agentName: agentNames[index],
      score: 75 + Math.floor(Math.random() * 20),
      items: [
        {
          id: topId,
          image: `https://placehold.co/400x600/${tops[index].replace('#', '')}/${getContrastColor(tops[index])}?text=Top+${index + 1}`,
          type: 'top' as const
        },
        {
          id: bottomId,
          image: `https://placehold.co/400x600/${bottoms[index].replace('#', '')}/${getContrastColor(bottoms[index])}?text=Bottom+${index + 1}`,
          type: 'bottom' as const
        },
        {
          id: shoeId,
          image: `https://placehold.co/400x600/${shoes[index].replace('#', '')}/${getContrastColor(shoes[index])}?text=Shoes+${index + 1}`,
          type: 'shoes' as const
        }
      ],
      details: {
        Description: descriptions[index],
        Top: `Item ID: ${topId}`,
        Bottom: `Item ID: ${bottomId}`,
        Shoes: `Item ID: ${shoeId}`
      }
    };
  });
};

// Helper function to generate contrast color for text
function getContrastColor(hexColor: string) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '000000' : 'FFFFFF';
}

export function DemoOutfitGenerator() {
  const demoOutfits = generateDemoOutfits();
  const [userFeedback, setUserFeedback] = useState<Record<string, { isLiked?: boolean, feedback?: string }>>({});
  
  const handleApprove = (agentName: string, feedback?: string) => {
    // Update local state
    setUserFeedback(prev => ({
      ...prev,
      [agentName]: { ...prev[agentName], feedback }
    }));
    
    // Log approval to AI system
    logOutfitFeedback(agentName, true, feedback);
    
    toast.success(`אישרת את הלוק של ${agentName}${feedback ? ' עם פידבק' : ''}`);
  };
  
  const handleReject = (agentName: string, feedback?: string) => {
    // Update local state
    setUserFeedback(prev => ({
      ...prev,
      [agentName]: { ...prev[agentName], feedback }
    }));
    
    // Log rejection to AI system
    logOutfitFeedback(agentName, false, feedback);
    
    toast.error(`דחית את הלוק של ${agentName}${feedback ? ' עם פידבק' : ''}`);
  };
  
  const handleLike = (agentName: string, liked: boolean) => {
    // Update local state
    setUserFeedback(prev => ({
      ...prev,
      [agentName]: { ...prev[agentName], isLiked: liked }
    }));
    
    // Log user preference to AI system
    logOutfitFeedback(agentName, undefined, undefined, liked);
    
    toast.info(`${liked ? 'אהבת' : 'לא אהבת'} את הלוק של ${agentName}`);
  };
  
  // Function to log outfit feedback to the system
  const logOutfitFeedback = async (agentName: string, approved?: boolean, feedback?: string, liked?: boolean) => {
    try {
      // Find the outfit
      const outfit = demoOutfits.find(o => o.agentName === agentName);
      if (!outfit) return;
      
      // Generate outfit ID from items
      const topId = outfit.items.find(i => i.type === 'top')?.id;
      const bottomId = outfit.items.find(i => i.type === 'bottom')?.id;
      const shoesId = outfit.items.find(i => i.type === 'shoes')?.id;
      const outfitId = `${topId}-${bottomId}-${shoesId}`;
      
      console.log(`Logging feedback for outfit ${outfitId}:`, { approved, feedback, liked });
      
      // Store feedback in database (if authenticated)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('agent_feedback')
          .upsert({
            agent_name: agentName,
            outfit_id: outfitId,
            approved: approved,
            feedback: feedback,
            user_liked: liked,
            timestamp: new Date().toISOString()
          }, { onConflict: 'agent_name' });
        
        if (error) {
          console.error('Error saving outfit feedback:', error);
        } else {
          console.log('Successfully saved outfit feedback to database');
        }
      } else {
        // Store in localStorage for non-authenticated users
        const feedbackHistory = JSON.parse(localStorage.getItem('outfit-feedback') || '[]');
        feedbackHistory.push({
          timestamp: new Date().toISOString(),
          agentName,
          outfitId,
          approved,
          feedback,
          liked
        });
        localStorage.setItem('outfit-feedback', JSON.stringify(feedbackHistory));
        console.log('Saved outfit feedback to localStorage');
      }
    } catch (error) {
      console.error('Error logging outfit feedback:', error);
    }
  };

  // Load existing feedback when component mounts
  useEffect(() => {
    const loadSavedFeedback = async () => {
      try {
        // Try to load from database first
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: savedFeedback, error } = await supabase
            .from('agent_feedback')
            .select('*');
          
          if (!error && savedFeedback) {
            const feedbackMap: Record<string, { isLiked?: boolean, feedback?: string }> = {};
            savedFeedback.forEach((item: any) => {
              feedbackMap[item.agent_name] = {
                isLiked: item.user_liked,
                feedback: item.feedback
              };
            });
            setUserFeedback(feedbackMap);
          }
        } else {
          // Fall back to localStorage
          const feedbackHistory = JSON.parse(localStorage.getItem('outfit-feedback') || '[]');
          const feedbackMap: Record<string, { isLiked?: boolean, feedback?: string }> = {};
          
          feedbackHistory.forEach((item: any) => {
            if (item.agentName) {
              feedbackMap[item.agentName] = {
                isLiked: item.liked,
                feedback: item.feedback
              };
            }
          });
          
          setUserFeedback(feedbackMap);
        }
      } catch (error) {
        console.error('Error loading saved feedback:', error);
      }
    };
    
    loadSavedFeedback();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">דוגמאות לוקים</h2>
        <p className="text-sm text-gray-500">
          לוקים לדוגמה - עד שה-API יחזיר תוצאות אמיתיות
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoOutfits.map((outfit, index) => (
          <OutfitAgentCard
            key={index}
            agentName={outfit.agentName}
            score={outfit.score}
            items={outfit.items}
            details={outfit.details}
            onApprove={handleApprove}
            onReject={handleReject}
            onLike={handleLike}
            isLiked={userFeedback[outfit.agentName]?.isLiked}
            feedback={userFeedback[outfit.agentName]?.feedback}
          />
        ))}
      </div>
    </div>
  );
}
