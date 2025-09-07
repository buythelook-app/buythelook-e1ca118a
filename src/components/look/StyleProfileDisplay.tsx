
import { useEffect, useState } from 'react';

interface StyleProfileDisplayProps {
  styleProfile: string | undefined;
}

export const StyleProfileDisplay = ({ styleProfile }: StyleProfileDisplayProps) => {
  const [originalStyle, setOriginalStyle] = useState<string | null>(null);
  
  // Load the ORIGINAL style from quiz (not affected by filter changes)
  useEffect(() => {
    const originalQuizStyle = localStorage.getItem('originalQuizStyle');
    if (originalQuizStyle) {
      try {
        const parsed = JSON.parse(originalQuizStyle);
        setOriginalStyle(parsed.styleProfile);
        console.log('📋 [StyleProfileDisplay] Loaded original quiz style:', parsed.styleProfile);
      } catch (error) {
        console.log('Could not load original quiz style:', error);
      }
    } else {
      // Fallback: if no original style exists, use current styleProfile and save it as original
      if (styleProfile) {
        localStorage.setItem('originalQuizStyle', JSON.stringify({
          styleProfile: styleProfile,
          timestamp: new Date().toISOString()
        }));
        setOriginalStyle(styleProfile);
        console.log('📋 [StyleProfileDisplay] Saved current style as original:', styleProfile);
      }
    }
  }, [styleProfile]);
  
  // Use original style if available, otherwise fallback to current styleProfile
  const displayStyle = originalStyle || styleProfile;
  
  if (!displayStyle) return null;
  
  return (
    <div className="mt-4 md:mt-0 px-4 py-2 bg-gray-100 rounded-full text-gray-700">
      מבוסס על העדפת הסגנון שלך - {displayStyle}
    </div>
  );
};
