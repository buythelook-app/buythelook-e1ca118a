
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, X, RefreshCw } from "lucide-react";

interface ReadyPlayerMeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: (avatarUrl: string) => void;
}

export const ReadyPlayerMeCreator = ({ isOpen, onClose, onAvatarCreated }: ReadyPlayerMeCreatorProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from ReadyPlayerMe
      if (!event.origin.includes('readyplayer.me')) return;

      const { type, data, eventName } = event.data;
      
      console.log('ReadyPlayerMe message:', event.data);

      // Handle both old and new message formats
      const messageType = type || eventName;

      if (messageType === 'v1.avatar.exported') {
        console.log('Avatar created successfully:', data?.url);
        onAvatarCreated(data?.url);
        onClose();
      } else if (messageType === 'v1.frame.ready') {
        console.log('ReadyPlayerMe frame ready - hiding loading');
        setIsLoading(false);
        setLoadingTimeout(false);
        clearTimeout(timeoutId);
      }
    };

    if (isOpen) {
      setIsLoading(true);
      setLoadingTimeout(false);
      
      // Set a timeout to show alternative options if loading takes too long
      timeoutId = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeout(true);
        }
      }, 10000); // 10 seconds timeout

      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, onAvatarCreated, onClose, isLoading]);

  const handleClose = () => {
    setIsLoading(true);
    setLoadingTimeout(false);
    onClose();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadingTimeout(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

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
              {loadingTimeout && (
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
          {(isLoading || loadingTimeout) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg z-10">
              <div className="text-center max-w-md">
                {!loadingTimeout ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">Loading Avatar Creator</h3>
                    <p className="text-gray-600 mb-4">This may take a few moments...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-red-500 mb-4">
                      <X className="w-16 h-16 mx-auto mb-2" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Loading Taking Longer Than Expected</h3>
                    <p className="text-gray-600 mb-4">
                      The avatar creator is taking longer to load. This might be due to internet connection or server load.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleRefresh} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                      <Button onClick={handleClose} variant="outline" size="sm">
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src="https://readyplayer.me/avatar?frameApi"
            className="w-full h-full border-0 rounded-lg"
            allow="camera *; microphone *; clipboard-write"
            loading="eager"
            style={{ 
              display: isLoading ? 'none' : 'block',
              visibility: loadingTimeout ? 'hidden' : 'visible'
            }}
            onLoad={() => {
              // Fallback for iframe load event
              setTimeout(() => {
                if (isLoading) {
                  setIsLoading(false);
                }
              }, 2000);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
