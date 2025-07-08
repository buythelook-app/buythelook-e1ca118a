
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";

interface ReadyPlayerMeViewerProps {
  avatarUrl: string;
  width?: number;
  height?: number;
  onEditAvatar?: () => void;
}

export const ReadyPlayerMeViewer = ({ 
  avatarUrl, 
  width = 300, 
  height = 400, 
  onEditAvatar 
}: ReadyPlayerMeViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Create the viewer URL with the avatar
  const viewerUrl = `https://models.readyplayer.me/${avatarUrl.split('/').pop()}?morphTargets=ARKit&textureAtlas=1024`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://models.readyplayer.me') return;

      const { type } = event.data;
      
      if (type === 'v1.frame.ready') {
        setIsLoading(false);
        setError(false);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleIframeLoad = () => {
    // Fallback in case postMessage doesn't work
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <User className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-500 text-sm text-center mb-4">
          Unable to load avatar
        </p>
        {onEditAvatar && (
          <Button onClick={onEditAvatar} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Create New Avatar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading avatar...</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={viewerUrl}
        className="w-full h-full border-0 rounded-lg"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      
      {onEditAvatar && (
        <Button
          onClick={onEditAvatar}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );
};
