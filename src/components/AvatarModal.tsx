
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReadyPlayerMeAvatar } from "./ReadyPlayerMeAvatar";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
  name?: string;
  color?: string;
}

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OutfitItem[];
  bodyShape: 'X' | 'V' | 'H' | 'O' | 'A';
}

export const AvatarModal = ({ isOpen, onClose, items, bodyShape }: AvatarModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center">המראה שלך עם התלבושת</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <ReadyPlayerMeAvatar 
            items={items}
            bodyShape={bodyShape}
            width={350}
            height={500}
          />
        </div>
        <div className="text-center text-sm text-gray-600 mt-4">
          <p>כך התלבושת תיראה על האווטאר שלך</p>
          <p className="text-xs text-gray-500 mt-1">
            לחץ על "ערוך אווטאר" כדי ליצור אווטאר אישי
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
