
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { AvatarModal } from "./AvatarModal";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
  name?: string;
  color?: string;
}

interface TryMeButtonProps {
  items: OutfitItem[];
}

export const TryMeButton = ({ items }: TryMeButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get body shape from localStorage (from style quiz results)
  const getBodyShape = (): 'X' | 'V' | 'H' | 'O' | 'A' => {
    try {
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      if (styleAnalysis) {
        const analysis = JSON.parse(styleAnalysis);
        const bodyShape = analysis?.analysis?.bodyShape;
        
        // Map common body shape names to our system
        const bodyShapeMapping: { [key: string]: 'X' | 'V' | 'H' | 'O' | 'A' } = {
          'hourglass': 'X',
          'triangle': 'V', 
          'rectangle': 'H',
          'oval': 'O',
          'pear': 'A',
          'X': 'X',
          'V': 'V', 
          'H': 'H',
          'O': 'O',
          'A': 'A'
        };
        
        return bodyShapeMapping[bodyShape] || 'H';
      }
    } catch (error) {
      console.log('Could not get body shape from storage');
    }
    
    // Default to rectangle if no body shape found
    return 'H';
  };

  const bodyShape = getBodyShape();

  return (
    <Button
      onClick={() => alert("Coming Soon")}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-sm px-3 py-2 h-9 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
    >
      <User className="w-4 h-4" />
      Try with Avatar
    </Button>
  );
};
