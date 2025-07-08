
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Edit, User, RefreshCw } from "lucide-react";

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
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Extract avatar ID from URL and create optimized viewer URL
  const getViewerUrl = (url: string) => {
    try {
      let avatarId = '';
      if (url.includes('.glb')) {
        avatarId = url.split('/').pop()?.replace('.glb', '') || '';
      } else {
        avatarId = url.split('/').pop() || '';
      }
      
      // Use optimized parameters for faster loading
      return `https://models.readyplayer.me/${avatarId}?morphTargets=ARKit&textureAtlas=512&pose=A&background=87ceeb`;
    } catch (e) {
      console.error('Error creating viewer URL:', e);
      return url;
    }
  };

  const viewerUrl = getViewerUrl(avatarUrl);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('models.readyplayer.me')) return;

      const { type } = event.data;
      
      if (type === 'v1.frame.ready') {
        setIsLoading(false);
        setError(false);
        setLoadingTimeout(false);
        clearTimeout(timeoutId);
      }
    };

    setIsLoading(true);
    setError(false);
    setLoadingTimeout(false);

    // Set timeout for loading
    timeoutId = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 8000); // 8 seconds timeout for viewer

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [avatarUrl, isLoading]);

  const handleIframeLoad = () => {
    // Fallback in case postMessage doesn't work
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError(true);
    setLoadingTimeout(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(false);
    setLoadingTimeout(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
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
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          {onEditAvatar && (
            <Button onClick={onEditAvatar} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      {(isLoading || loadingTimeout) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg z-10">
          <div className="text-center">
            {!loadingTimeout ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading avatar...</p>
              </>
            ) : (
              <>
                <div className="text-orange-500 mb-2">
                  <RefreshCw className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-600 text-sm mb-2">Taking longer than expected</p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={viewerUrl}
        className="w-full h-full border-0 rounded-lg"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        loading="eager"
        allow="accelerometer; camera; encrypted-media; gyroscope; picture-in-picture"
        style={{ 
          display: (isLoading || loadingTimeout) ? 'none' : 'block'
        }}
      />
      
      {onEditAvatar && !isLoading && !loadingTimeout && (
        <Button
          onClick={onEditAvatar}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-lg"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );
};
