
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, X } from "lucide-react";

interface ReadyPlayerMeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: (avatarUrl: string) => void;
}

export const ReadyPlayerMeCreator = ({ isOpen, onClose, onAvatarCreated }: ReadyPlayerMeCreatorProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from ReadyPlayerMe
      if (event.origin !== 'https://readyplayer.me') return;

      const { type, data } = event.data;
      
      console.log('ReadyPlayerMe message:', event.data);

      if (type === 'v1.avatar.exported') {
        console.log('Avatar created successfully:', data.url);
        onAvatarCreated(data.url);
        onClose();
      } else if (type === 'v1.frame.ready') {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onAvatarCreated, onClose]);

  const handleClose = () => {
    setIsLoading(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Create Your Avatar
            </span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-[600px] p-6 pt-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading avatar creator...</p>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src="https://readyplayer.me/avatar"
            className="w-full h-full border-0 rounded-lg"
            allow="camera *; microphone *"
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
