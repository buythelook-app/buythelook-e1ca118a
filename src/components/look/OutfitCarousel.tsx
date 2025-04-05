
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
              onAddToCart={() => onAddToCart(outfit)}
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
