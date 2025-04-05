
import { useState, useEffect } from "react";
import { type CanvasItem } from "@/types/canvasTypes";
import { type DashboardItem } from "@/types/lookTypes";
import { OutfitCanvas } from "./OutfitCanvas";
import { mapItemType } from "./OutfitTypeMapper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";

interface OutfitCarouselProps {
  outfits: DashboardItem[][];
  isRefreshing: boolean;
  onAddToCart: (items: DashboardItem[]) => void;
  onTryDifferent: () => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  occasion?: string;
}

export const OutfitCarousel = ({
  outfits,
  isRefreshing,
  onAddToCart,
  onTryDifferent,
  activeIndex,
  setActiveIndex,
  occasion
}: OutfitCarouselProps) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();

  // Update current slide index when carousel slides change
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };
    
    api.on('select', onSelect);
    
    return () => {
      api.off('select', onSelect);
    };
  }, [api, setActiveIndex]);

  if (outfits.length === 0) {
    return null;
  }

  // Handle adding all items from an outfit to cart
  const handleAddToCart = (outfit: DashboardItem[]) => {
    const cartItems = outfit.map(item => ({
      id: item.id,
      title: item.name || "", 
      price: item.price || "$0.00",
      image: item.image
    }));
    
    addItems(cartItems);
    
    toast({
      title: "Success",
      description: `Look added to your cart`,
    });
    
    navigate('/cart');
  };

  return (
    <Carousel
      className="w-full relative"
      setApi={setApi}
    >
      <div className="absolute top-0 right-0 bg-white bg-opacity-60 px-3 py-1 rounded-bl-md z-10">
        <span className="text-sm font-medium">
          {activeIndex + 1} / {outfits.length}
        </span>
      </div>
      <CarouselContent>
        {outfits.map((outfit, index) => (
          <CarouselItem key={index} className="flex flex-col items-center">
            <OutfitCanvas 
              canvasItems={outfit.map(item => ({
                id: item.id,
                image: item.image,
                type: mapItemType(item.type)
              }))}
              isRefreshing={isRefreshing} 
              onAddToCart={() => handleAddToCart(outfit)}
              onTryDifferent={onTryDifferent}
              occasion={outfit[0]?.occasion || outfit[0]?.event || outfit[0]?.metadata?.occasion}
              originalItems={outfit}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {outfits.length > 1 && (
        <>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </>
      )}
    </Carousel>
  );
};
