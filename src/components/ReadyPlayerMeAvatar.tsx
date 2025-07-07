
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [avatarModelUrl, setAvatarModelUrl] = useState<string>("");

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
        // Use a default Ready Player Me avatar based on body shape and gender
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

        // Default avatars based on gender
        const defaultAvatars = {
          male: 'https://models.readyplayer.me/64bfa3c0e1b557e396e31c48.glb',
          female: 'https://models.readyplayer.me/64bfa3c0e1b557e396e31c49.glb'
        };

        setAvatarModelUrl(defaultAvatars[gender as keyof typeof defaultAvatars] || defaultAvatars.male);
      }
    };

    getAvatarUrl();
  }, [avatarUrl]);

  const handleAvatarLoad = () => {
    setIsLoading(false);
  };

  const handleAvatarError = () => {
    setIsLoading(false);
    console.error('Failed to load Ready Player Me avatar');
  };

  const openAvatarCreator = () => {
    // Open Ready Player Me avatar creator
    const avatarCreatorUrl = `https://demo.readyplayer.me/?frameApi`;
    window.open(avatarCreatorUrl, 'AvatarCreator', 'width=800,height=600');
    
    // Listen for avatar creation completion
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.eventName === 'v1.avatar.exported') {
        const newAvatarUrl = event.data.url;
        localStorage.setItem('userAvatarUrl', newAvatarUrl);
        setAvatarModelUrl(newAvatarUrl);
        window.removeEventListener('message', handleMessage);
      }
    };
    
    window.addEventListener('message', handleMessage);
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
        className="relative bg-gradient-to-b from-blue-50 to-purple-50"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
            <div className="bg-white p-4 rounded-lg shadow-md text-center border">
              <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-700">טוען אווטאר...</p>
            </div>
          </div>
        )}

        {avatarModelUrl && (
          <iframe
            src={`https://models.readyplayer.me/render?url=${encodeURIComponent(avatarModelUrl)}&background=transparent&scene=fullbody&quality=high`}
            width={width}
            height={height}
            style={{ border: 'none' }}
            onLoad={handleAvatarLoad}
            onError={handleAvatarError}
            title="Ready Player Me Avatar"
          />
        )}

        {/* Clothing overlay */}
        {!isLoading && items.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="absolute bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded"
                style={{
                  bottom: `${20 + (index * 25)}px`,
                  left: '10px',
                  zIndex: 10
                }}
              >
                {item.name || item.type}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={openAvatarCreator}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
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
