
import { useState } from "react";
import { User, Shirt } from "lucide-react";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
  name?: string;
  color?: string;
}

interface ReadyPlayerMeAvatarProps {
  items: OutfitItem[];
  bodyShape: 'X' | 'V' | 'H' | 'O' | 'A';
  width?: number;
  height?: number;
  avatarUrl?: string;
}

export const ReadyPlayerMeAvatar = ({ 
  items, 
  bodyShape, 
  width = 400, 
  height = 600,
  avatarUrl 
}: ReadyPlayerMeAvatarProps) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(() => {
    try {
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      if (styleAnalysis) {
        const analysis = JSON.parse(styleAnalysis);
        return analysis?.analysis?.gender || 'female';
      }
    } catch (error) {
      console.log('Could not get gender from storage');
    }
    return 'female';
  });

  const BODY_SHAPE_DESCRIPTIONS = {
    'X': 'שעון חול',
    'V': 'משולש הפוך', 
    'H': 'מלבן',
    'O': 'אובלי',
    'A': 'אגס'
  };

  // Get body silhouette based on gender and body shape
  const getBodySilhouette = () => {
    const baseClasses = "relative mx-auto transition-all duration-300";
    
    if (selectedGender === 'female') {
      switch (bodyShape) {
        case 'X': return `${baseClasses} w-32 h-80 bg-gradient-to-b from-pink-200 to-pink-300 rounded-t-full`; // Hourglass
        case 'A': return `${baseClasses} w-32 h-80 bg-gradient-to-b from-pink-200 to-pink-300 rounded-t-3xl`; // Pear
        case 'V': return `${baseClasses} w-32 h-80 bg-gradient-to-b from-pink-200 to-pink-300 rounded-t-2xl`; // Inverted triangle
        case 'H': return `${baseClasses} w-28 h-80 bg-gradient-to-b from-pink-200 to-pink-300 rounded-t-3xl`; // Rectangle
        case 'O': return `${baseClasses} w-36 h-80 bg-gradient-to-b from-pink-200 to-pink-300 rounded-full`; // Oval
        default: return `${baseClasses} w-32 h-80 bg-gradient-to-b from-pink-200 to-pink-300 rounded-t-full`;
      }
    } else {
      switch (bodyShape) {
        case 'X': return `${baseClasses} w-34 h-80 bg-gradient-to-b from-blue-200 to-blue-300 rounded-t-2xl`; // Athletic
        case 'V': return `${baseClasses} w-36 h-80 bg-gradient-to-b from-blue-200 to-blue-300 rounded-t-xl`; // Inverted triangle
        case 'H': return `${baseClasses} w-30 h-80 bg-gradient-to-b from-blue-200 to-blue-300 rounded-t-2xl`; // Rectangle
        case 'O': return `${baseClasses} w-38 h-80 bg-gradient-to-b from-blue-200 to-blue-300 rounded-full`; // Round
        case 'A': return `${baseClasses} w-32 h-80 bg-gradient-to-b from-blue-200 to-blue-300 rounded-t-3xl`; // Pear (less common for males)
        default: return `${baseClasses} w-34 h-80 bg-gradient-to-b from-blue-200 to-blue-300 rounded-t-2xl`;
      }
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div 
        className="relative bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-center p-8"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Gender Selection */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={() => setSelectedGender('female')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedGender === 'female' 
                ? 'bg-pink-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            נשים
          </button>
          <button
            onClick={() => setSelectedGender('male')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedGender === 'male' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            גברים
          </button>
        </div>

        {/* Body Silhouette with Outfit Items */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Body silhouette */}
          <div className={getBodySilhouette()}>
            {/* Head */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full border-2 border-white shadow-sm">
              <User className="w-6 h-6 text-amber-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            {/* Outfit overlay visualization */}
            <div className="absolute inset-0 flex flex-col justify-center items-center space-y-2">
              {items.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className="w-6 h-6 rounded bg-white bg-opacity-70 flex items-center justify-center shadow-sm"
                  title={item.name || item.type}
                >
                  <Shirt className="w-4 h-4 text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outfit Info */}
        {items.length > 0 && (
          <div className="absolute top-4 right-4 space-y-1 max-w-32">
            <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {items.length} פריטים
            </div>
            {items.slice(0, 2).map((item, index) => (
              <div
                key={item.id}
                className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm truncate"
              >
                {item.name || item.type}
              </div>
            ))}
            {items.length > 2 && (
              <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                +{items.length - 2} עוד
              </div>
            )}
          </div>
        )}

        {/* Style Info */}
        <div className="text-center mt-4">
          <p className="text-lg font-medium text-gray-700">תצוגת התלבושת</p>
          <p className="text-sm text-gray-600">מותאם למבנה הגוף שלך</p>
        </div>
      </div>

      {/* Body shape info */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        מבנה גוף: {BODY_SHAPE_DESCRIPTIONS[bodyShape]}
      </div>
    </div>
  );
};
