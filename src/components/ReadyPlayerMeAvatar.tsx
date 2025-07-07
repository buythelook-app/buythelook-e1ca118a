
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
  const [error, setError] = useState<string | null>(null);

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

        // Default avatars based on gender - using working RPM avatar IDs
        const defaultAvatars = {
          male: '64bfa3c0e1b557e396e31c48',
          female: '64bfa3c0e1b557e396e31c49'
        };

        setAvatarModelUrl(defaultAvatars[gender as keyof typeof defaultAvatars] || defaultAvatars.male);
      }
    };

    getAvatarUrl();
  }, [avatarUrl]);

  const handleAvatarLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleAvatarError = () => {
    setIsLoading(false);
    setError('Failed to load avatar');
    console.error('Failed to load Ready Player Me avatar');
  };

  const openAvatarCreator = () => {
    // Open Ready Player Me avatar creator with proper configuration
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
        window.removeEventListener('message', handleMessage);
        if (popup) popup.close();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Clean up if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
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

  // Construct the correct Ready Player Me view URL
  const getAvatarViewUrl = (avatarId: string) => {
    // If it's already a full URL, extract the ID
    let cleanId = avatarId;
    if (avatarId.includes('https://')) {
      cleanId = avatarId.split('/').pop()?.replace('.glb', '') || avatarId;
    }
    
    return `https://models.readyplayer.me/${cleanId}.glb?morphTargets=ARKit,Oculus+Visemes&textureAtlas=1024&lod=1`;
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div 
        className="relative bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center"
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

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
            <div className="bg-white p-4 rounded-lg shadow-md text-center border border-red-200">
              <p className="text-red-500 mb-2">שגיאה בטעינת האווטאר</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                נסה שוב
              </button>
            </div>
          </div>
        )}

        {avatarModelUrl && !error && (
          <div className="w-full h-full flex items-center justify-center">
            {/* For now, show a placeholder with avatar info until we implement proper 3D viewer */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-4xl">👤</span>
              </div>
              <p className="text-gray-600 text-sm">אווטאר Ready Player Me</p>
              <p className="text-xs text-gray-500 mt-1">ID: {avatarModelUrl.substring(0, 8)}...</p>
            </div>
          </div>
        )}

        {/* Clothing overlay */}
        {!isLoading && !error && items.length > 0 && (
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
