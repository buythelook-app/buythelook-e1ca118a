import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, X, RefreshCw, Loader2 } from "lucide-react";

interface ReadyPlayerMeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: (avatarUrl: string) => void;
}

export const ReadyPlayerMeCreator = ({ isOpen, onClose, onAvatarCreated }: ReadyPlayerMeCreatorProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from ReadyPlayerMe domains
      if (!event.origin.includes('readyplayer.me') && !event.origin.includes('rpm.me')) {
        return;
      }

      console.log('ReadyPlayerMe message received:', event.data);

      const { eventName, type, data } = event.data;
      const messageType = eventName || type;

      if (messageType === 'v1.frame.ready') {
        console.log('ReadyPlayerMe frame is ready');
        setIsLoading(false);
        setHasError(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else if (messageType === 'v1.avatar.exported') {
        console.log('Avatar exported:', data?.url);
        if (data?.url) {
          onAvatarCreated(data.url);
          onClose();
        }
      }
    };

    if (isOpen) {
      console.log('Opening ReadyPlayerMe creator');
      setIsLoading(true);
      setHasError(false);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set timeout for loading error
      timeoutRef.current = setTimeout(() => {
        console.log('ReadyPlayerMe loading timeout');
        setIsLoading(false);
        setHasError(true);
      }, 10000);

      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, onAvatarCreated, onClose]);

  const handleClose = () => {
    setIsLoading(true);
    setHasError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClose();
  };

  const handleRefresh = () => {
    console.log('Refreshing ReadyPlayerMe iframe');
    setIsLoading(true);
    setHasError(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
    }, 10000);
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src + '&t=' + Date.now();
    }
  };

  const showLoadingSpinner = isLoading && !hasError;
  const showErrorMessage = hasError || (isLoading && hasError);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0" aria-describedby="avatar-creator-description">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Create Your Avatar
            </span>
            <div className="flex gap-2">
              {hasError && (
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div id="avatar-creator-description" className="sr-only">
          Create and customize your 3D avatar using ReadyPlayerMe
        </div>
        
        <div className="relative w-full h-[600px] p-6 pt-0">
          {/* Loading Overlay */}
          {showLoadingSpinner && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg z-20">
              <div className="text-center max-w-md">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Loading Avatar Creator</h3>
                <p className="text-gray-600">Setting up your personalization experience...</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {showErrorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg z-20">
              <div className="text-center max-w-md">
                <div className="text-red-500 mb-4">
                  <X className="w-16 h-16 mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Unable to Load Avatar Creator</h3>
                <p className="text-gray-600 mb-6">
                  The avatar creator is having trouble loading. This could be due to connection issues or high server load.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleRefresh} variant="default" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={handleClose} variant="outline" size="sm">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* ReadyPlayerMe Iframe */}
          <iframe
            ref={iframeRef}
            src="https://readyplayer.me/avatar?frameApi&clearCache"
            className="w-full h-full border-0 rounded-lg bg-gray-50"
            allow="camera *; microphone *; clipboard-write; fullscreen"
            loading="eager"
            title="ReadyPlayerMe Avatar Creator"
            onLoad={() => {
              console.log('Iframe onLoad event fired');
              // Backup timeout in case the message event doesn't fire
              setTimeout(() => {
                if (isLoading && !hasError) {
                  console.log('Iframe loaded - backup timeout triggered');
                  setIsLoading(false);
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                  }
                }
              }, 3000);
            }}
            onError={() => {
              console.error('Iframe failed to load');
              setIsLoading(false);
              setHasError(true);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};