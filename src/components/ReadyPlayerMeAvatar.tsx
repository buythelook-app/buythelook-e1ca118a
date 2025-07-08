
import { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";

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
  const [avatarModelUrl, setAvatarModelUrl] = useState<string>("");
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);

  // Get or create avatar URL
  useEffect(() => {
    const getAvatarUrl = () => {
      // Check if user has a custom avatar URL saved
      const savedAvatarUrl = localStorage.getItem('userAvatarUrl');
      
      if (savedAvatarUrl) {
        setAvatarModelUrl(savedAvatarUrl);
      } else if (avatarUrl) {
        setAvatarModelUrl(avatarUrl);
      } else {
        // Use default avatar based on gender from style analysis
        const styleAnalysis = localStorage.getItem('styleAnalysis');
        let gender = 'male';
        
        try {
          if (styleAnalysis) {
            const analysis = JSON.parse(styleAnalysis);
            gender = analysis?.analysis?.gender || 'male';
          }
        } catch (error) {
          console.log('Could not get gender from storage');
        }

        // Set default avatar based on gender
        const defaultAvatarId = gender === 'female' ? '64bfa3c0e1b557e396e31c49' : '64bfa3c0e1b557e396e31c48';
        setAvatarModelUrl(defaultAvatarId);
      }
    };

    getAvatarUrl();
  }, [avatarUrl]);

  const openAvatarCreator = () => {
    setShowAvatarCreator(true);
    
    // Open Ready Player Me avatar creator
    const avatarCreatorUrl = `https://demo.readyplayer.me/?frameApi=true&clearCache=true&bodyType=halfbody&quickStart=false&language=en`;
    const popup = window.open(avatarCreatorUrl, 'AvatarCreator', 'width=900,height=700,scrollbars=no,resizable=yes');
    
    // Listen for avatar creation completion
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://demo.readyplayer.me') return;
      
      if (event.data?.eventName === 'v1.avatar.exported') {
        const newAvatarUrl = event.data.url;
        // Extract avatar ID from the full URL
        const avatarId = newAvatarUrl.split('/').pop()?.replace('.glb', '') || newAvatarUrl;
        localStorage.setItem('userAvatarUrl', avatarId);
        setAvatarModelUrl(avatarId);
        setShowAvatarCreator(false);
        window.removeEventListener('message', handleMessage);
        if (popup) popup.close();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Clean up if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        setShowAvatarCreator(false);
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
      }
    }, 1000);
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
        className="relative bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Avatar Display - Simplified to avoid loading issues */}
        <div className="text-center">
          <div className="w-40 h-40 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <User className="w-20 h-20 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">אווטאר Ready Player Me</p>
            {avatarModelUrl && (
              <p className="text-xs text-gray-500">ID: {avatarModelUrl.substring(0, 8)}...</p>
            )}
            <p className="text-sm text-gray-600">מותאם למבנה הגוף שלך</p>
          </div>
        </div>

        {/* Clothing overlay info */}
        {items.length > 0 && (
          <div className="absolute top-4 left-4 space-y-1">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"
              >
                {item.name || item.type}
              </div>
            ))}
            {items.length > 3 && (
              <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                +{items.length - 3} עוד
              </div>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {showAvatarCreator && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
            <div className="bg-white p-4 rounded-lg shadow-md text-center border">
              <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-700">יוצר אווטאר...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4">
        <button
          onClick={openAvatarCreator}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors shadow-md"
          title="צור אווטאר אישי"
        >
          🎨 ערוך אווטאר
        </button>
      </div>

      {/* Body shape info */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        מבנה גוף: {BODY_SHAPE_DESCRIPTIONS[bodyShape]}
      </div>
    </div>
  );
};
