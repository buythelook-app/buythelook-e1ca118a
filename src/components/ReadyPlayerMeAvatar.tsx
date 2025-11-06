
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Shirt } from "lucide-react";
import { ReadyPlayerMeCreator } from "./ReadyPlayerMeCreator";
import { ReadyPlayerMeViewer } from "./ReadyPlayerMeViewer";

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
  const [showCreator, setShowCreator] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  // Load avatar URL from localStorage on component mount
  useEffect(() => {
    const savedAvatarUrl = localStorage.getItem('readyPlayerMeAvatarUrl');
    if (savedAvatarUrl) {
      setCurrentAvatarUrl(savedAvatarUrl);
    } else if (avatarUrl) {
      setCurrentAvatarUrl(avatarUrl);
    }
  }, [avatarUrl]);

  const handleAvatarCreated = (newAvatarUrl: string) => {
    console.log('Avatar created with URL:', newAvatarUrl);
    setCurrentAvatarUrl(newAvatarUrl);
    localStorage.setItem('readyPlayerMeAvatarUrl', newAvatarUrl);
  };

  const handleEditAvatar = () => {
    setShowCreator(true);
  };

  const BODY_SHAPE_DESCRIPTIONS = {
    'X': 'שעון חול',
    'V': 'משולש הפוך', 
    'H': 'מלבן',
    'O': 'אובלי',
    'A': 'אגס'
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div 
        className="relative bg-gradient-to-b from-blue-50 to-cyan-50 flex flex-col items-center justify-center p-8"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Avatar Display */}
        <div className="flex-1 flex items-center justify-center">
          {currentAvatarUrl ? (
            <ReadyPlayerMeViewer 
              avatarUrl={currentAvatarUrl}
              width={width - 64}
              height={height - 200}
              onEditAvatar={handleEditAvatar}
            />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No avatar created yet</p>
              <Button onClick={() => setShowCreator(true)} className="bg-blue-600 hover:bg-blue-700">
                <User className="w-4 h-4 mr-2" />
                Create Avatar
              </Button>
            </div>
          )}
        </div>

        {/* Outfit Info Overlay */}
        {items.length > 0 && (
          <div className="absolute top-4 right-4 space-y-1 max-w-32">
            <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {items.length} פריטים
            </div>
            {items.slice(0, 2).map((item, index) => (
              <div
                key={item.id}
                className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm truncate flex items-center gap-1"
              >
                <Shirt className="w-3 h-3" />
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

        {/* Body shape info */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          מבנה גוף: {BODY_SHAPE_DESCRIPTIONS[bodyShape]}
        </div>

        {/* Style Info */}
        <div className="text-center mt-4">
          <p className="text-lg font-medium text-gray-700">
            {currentAvatarUrl ? 'Your Personal Avatar' : 'תצוגת התלבושת'}
          </p>
          <p className="text-sm text-gray-600">
            {currentAvatarUrl ? 'With your selected outfit' : 'מותאם למבנה הגוף שלך'}
          </p>
        </div>
      </div>

      {/* ReadyPlayerMe Creator Modal */}
      <ReadyPlayerMeCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onAvatarCreated={handleAvatarCreated}
      />
    </div>
  );
};
